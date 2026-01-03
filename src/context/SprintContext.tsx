import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  UserStory, 
  TeamMember, 
  SprintMetrics, 
  RiskDataPoint,
  initialStories, 
  teamMembers as initialTeamMembers, 
  sprintMetrics as initialMetrics,
  riskBurndown as initialRiskData
} from '@/data/mockData';

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

interface SprintContextType {
  stories: UserStory[];
  teamMembers: TeamMember[];
  metrics: SprintMetrics;
  riskData: RiskDataPoint[];
  messages: Message[];
  isAiTyping: boolean;
  
  // Story actions
  addStory: (story: UserStory) => void;
  removeStory: (id: string) => void;
  updateStory: (id: string, updates: Partial<UserStory>) => void;
  
  // AI Chat actions
  sendMessage: (content: string) => void;
  applyBreakdown: (storyId: string, newStories: Partial<UserStory>[]) => void;
  
  // Metrics
  recalculateMetrics: () => void;
}

const SprintContext = createContext<SprintContextType | undefined>(undefined);

export function SprintProvider({ children }: { children: ReactNode }) {
  const [stories, setStories] = useState<UserStory[]>(initialStories);
  const [teamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [metrics, setMetrics] = useState<SprintMetrics>(initialMetrics);
  const [riskData, setRiskData] = useState<RiskDataPoint[]>(initialRiskData);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      role: 'assistant',
      content: "Hello! I'm SprintPilot, your AI planning assistant. I've analyzed your current backlog for the **User Onboarding** sprint. I notice a few items that might need attention - particularly the vague \"Improve UX\" story. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  const recalculateMetrics = useCallback(() => {
    const committedPoints = stories
      .filter(s => s.status !== 'done')
      .reduce((sum, s) => sum + s.storyPoints, 0);
    
    const highRiskCount = stories.filter(s => s.riskLevel === 'high').length;
    const vagueCount = stories.filter(s => s.isVague).length;
    const riskScore = Math.min(100, (highRiskCount * 15) + (vagueCount * 20) + (committedPoints > metrics.capacity ? 25 : 0));
    
    setMetrics(prev => ({
      ...prev,
      committedPoints,
      riskScore,
    }));

    // Update risk burndown projection
    const newRiskData = initialRiskData.map((point, idx) => ({
      ...point,
      projected: Math.max(0, riskScore - (riskScore / 14) * idx),
    }));
    setRiskData(newRiskData);
  }, [stories, metrics.capacity]);

  const addStory = useCallback((story: UserStory) => {
    setStories(prev => [...prev, story]);
    setTimeout(recalculateMetrics, 0);
  }, [recalculateMetrics]);

  const removeStory = useCallback((id: string) => {
    setStories(prev => prev.filter(s => s.id !== id));
    setTimeout(recalculateMetrics, 0);
  }, [recalculateMetrics]);

  const updateStory = useCallback((id: string, updates: Partial<UserStory>) => {
    setStories(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    setTimeout(recalculateMetrics, 0);
  }, [recalculateMetrics]);

  const applyBreakdown = useCallback((storyId: string, newStories: Partial<UserStory>[]) => {
    // Remove the vague story
    setStories(prev => prev.filter(s => s.id !== storyId));
    
    // Add the new refined stories
    const fullStories: UserStory[] = newStories.map((s, idx) => ({
      id: `story-new-${Date.now()}-${idx}`,
      title: s.title || 'New Story',
      description: s.description || '',
      storyPoints: s.storyPoints || 3,
      priority: s.priority || 'medium',
      riskLevel: 'low' as const,
      status: 'backlog' as const,
      createdAt: new Date(),
      aiInsights: ['Created from AI breakdown'],
    }));

    setStories(prev => [...prev, ...fullStories]);
    
    // Add confirmation message
    const confirmationMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `✅ **Breakdown Applied!**\n\nI've updated the backlog:\n- Removed "Improve UX" (8 pts)\n- Added "${fullStories[0].title}" (${fullStories[0].storyPoints} pts)\n- Added "${fullStories[1].title}" (${fullStories[1].storyPoints} pts)\n\nYour capacity utilization has improved and risk score decreased. The sprint plan is now more achievable!`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, confirmationMessage]);
    
    setTimeout(recalculateMetrics, 0);
  }, [recalculateMetrics]);

  const sendMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsAiTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const lowerContent = content.toLowerCase();
      let response: Message;

      if (lowerContent.includes('improve ux') || lowerContent.includes('vague') || lowerContent.includes('review')) {
        response = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `I've analyzed the **"Improve UX"** story and found several concerns:\n\n**Issues Identified:**\n• The story is too vague and lacks specific acceptance criteria\n• An 8-point estimate for an undefined scope creates high risk\n• No clear definition of "better" makes it hard to measure success\n\n**My Recommendation:**\nBased on your product context and past design patterns, I suggest breaking this into two focused stories:\n\n1. **"Implement SSO Integration"** (5 pts) - Add Google and GitHub single sign-on\n2. **"Update Welcome Email Template"** (2 pts) - Modernize the welcome email with the new brand guidelines\n\nThis reduces total points from 8 to 7 and significantly lowers sprint risk.`,
          timestamp: new Date(),
          action: {
            type: 'breakdown',
            label: 'Apply Breakdown',
            storyId: 'story-5',
            newStories: [
              {
                title: 'Implement SSO Integration',
                description: 'Add Google and GitHub single sign-on options to the login flow.',
                storyPoints: 5,
                priority: 'medium',
              },
              {
                title: 'Update Welcome Email Template',
                description: 'Modernize the welcome email with the new brand guidelines and improved copy.',
                storyPoints: 2,
                priority: 'low',
              },
            ],
          },
        };
      } else if (lowerContent.includes('capacity') || lowerContent.includes('overloaded')) {
        response = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `📊 **Capacity Analysis**\n\nYour team's current status:\n- **Committed:** ${metrics.committedPoints} points\n- **Capacity:** ${metrics.capacity} points\n- **Utilization:** ${Math.round((metrics.committedPoints / metrics.capacity) * 100)}%\n\n${metrics.committedPoints > metrics.capacity ? '⚠️ **Warning:** You\'re over capacity! Consider deferring lower priority items.' : '✅ You\'re within healthy capacity limits.'}`,
          timestamp: new Date(),
        };
      } else if (lowerContent.includes('risk') || lowerContent.includes('dependencies')) {
        response = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `🔍 **Risk Assessment**\n\nI've identified these risk factors:\n\n1. **Dependency Chain:** Story #3 → #2 → #1\n   - Ensure "Design Login Page" is completed first\n\n2. **Vague Stories:** The "Improve UX" story needs refinement\n\n3. **High-Point Stories:** Consider splitting stories over 5 points\n\n**Current Risk Score:** ${metrics.riskScore}%\n\nWould you like me to suggest specific mitigations?`,
          timestamp: new Date(),
        };
      } else {
        response = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `I can help you with:\n\n• **Reviewing stories** - "Review the Improve UX story"\n• **Capacity planning** - "Am I overloaded?"\n• **Risk analysis** - "What are my biggest risks?"\n• **Story refinement** - Ask about any specific story\n\nWhat would you like to explore?`,
          timestamp: new Date(),
        };
      }

      setMessages(prev => [...prev, response]);
      setIsAiTyping(false);
    }, 1500);
  }, [metrics]);

  return (
    <SprintContext.Provider
      value={{
        stories,
        teamMembers,
        metrics,
        riskData,
        messages,
        isAiTyping,
        addStory,
        removeStory,
        updateStory,
        sendMessage,
        applyBreakdown,
        recalculateMetrics,
      }}
    >
      {children}
    </SprintContext.Provider>
  );
}

export function useSprint() {
  const context = useContext(SprintContext);
  if (context === undefined) {
    throw new Error('useSprint must be used within a SprintProvider');
  }
  return context;
}
