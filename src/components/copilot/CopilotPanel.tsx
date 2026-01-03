import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { useSprint } from '@/context/SprintContext';
import { ChatMessage } from './ChatMessage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const suggestedPrompts = [
  "Review the 'Improve UX' story",
  "Am I overloaded?",
  "What are my biggest risks?",
];

export function CopilotPanel() {
  const { messages, sendMessage, isAiTyping } = useSprint();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isAiTyping) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">SprintPilot AI</h2>
            <p className="text-xs text-muted-foreground">Your sprint planning copilot</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Typing Indicator */}
        {isAiTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="ai-message flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Analyzing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="text-xs text-muted-foreground mb-2">Try asking:</div>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSuggestedPrompt(prompt)}
                className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 text-foreground rounded-full transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask SprintPilot anything..."
            rows={1}
            className={cn(
              "w-full resize-none rounded-xl border border-input bg-background px-4 py-3 pr-12",
              "text-sm placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            style={{ minHeight: '48px', maxHeight: '120px' }}
            disabled={isAiTyping}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isAiTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="mt-2 text-xs text-center text-muted-foreground">
          SprintPilot can make mistakes. Verify important decisions.
        </p>
      </div>
    </div>
  );
}
