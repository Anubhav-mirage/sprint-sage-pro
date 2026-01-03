import { useState, useCallback } from 'react';
import { UserStory, SprintMetrics } from '@/data/mockData';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: {
    type: 'breakdown' | 'approve' | 'defer';
    label: string;
    storyId?: string;
    newStories?: Partial<UserStory>[];
  };
}

interface UseAiChatProps {
  stories: UserStory[];
  metrics: SprintMetrics;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sprint-copilot`;

export function useAiChat({ stories, metrics }: UseAiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      role: 'assistant',
      content: "Hello! I'm SprintPilot, your AI planning assistant powered by Gemini. I've analyzed your current backlog for the **User Onboarding** sprint. I notice a few items that might need attention - particularly the vague \"Improve UX\" story. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  const parseActionFromContent = (content: string): Message['action'] | undefined => {
    const actionMatch = content.match(/```action\n([\s\S]*?)\n```/);
    if (actionMatch) {
      try {
        const actionData = JSON.parse(actionMatch[1]);
        if (actionData.type === 'breakdown' && actionData.storyId && actionData.newStories) {
          return {
            type: 'breakdown',
            label: 'Apply Breakdown',
            storyId: actionData.storyId,
            newStories: actionData.newStories,
          };
        }
      } catch (e) {
        console.error('Failed to parse action:', e);
      }
    }
    return undefined;
  };

  const cleanContentFromAction = (content: string): string => {
    return content.replace(/```action\n[\s\S]*?\n```/g, '').trim();
  };

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsAiTyping(true);

    let assistantContent = "";

    const upsertAssistant = (nextChunk: string) => {
      assistantContent += nextChunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.id.startsWith('streaming-')) {
          return prev.map((m, i) => 
            i === prev.length - 1 
              ? { ...m, content: cleanContentFromAction(assistantContent) } 
              : m
          );
        }
        return [...prev, {
          id: `streaming-${Date.now()}`,
          role: 'assistant' as const,
          content: cleanContentFromAction(assistantContent),
          timestamp: new Date(),
        }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          message: content,
          stories: stories.map(s => ({
            id: s.id,
            title: s.title,
            description: s.description,
            storyPoints: s.storyPoints,
            priority: s.priority,
            riskLevel: s.riskLevel,
            isVague: s.isVague,
          })),
          metrics: {
            velocity: metrics.velocity,
            capacity: metrics.capacity,
            committedPoints: metrics.committedPoints,
            riskScore: metrics.riskScore,
          },
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (deltaContent) upsertAssistant(deltaContent);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (deltaContent) upsertAssistant(deltaContent);
          } catch { /* ignore */ }
        }
      }

      // Parse action from completed content and update final message
      const action = parseActionFromContent(assistantContent);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIdx = newMessages.length - 1;
        if (lastIdx >= 0 && newMessages[lastIdx].role === 'assistant') {
          newMessages[lastIdx] = {
            ...newMessages[lastIdx],
            id: `msg-${Date.now()}`,
            content: cleanContentFromAction(assistantContent),
            action,
          };
        }
        return newMessages;
      });

    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => {
        // Remove streaming message if exists
        const filtered = prev.filter(m => !m.id.startsWith('streaming-'));
        return [...filtered, errorMessage];
      });
    } finally {
      setIsAiTyping(false);
    }
  }, [stories, metrics]);

  const addConfirmationMessage = useCallback((content: string) => {
    const confirmationMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, confirmationMessage]);
  }, []);

  return {
    messages,
    isAiTyping,
    sendMessage,
    addConfirmationMessage,
  };
}
