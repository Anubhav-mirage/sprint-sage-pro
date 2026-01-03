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
import { useAiChat } from '@/hooks/useAiChat';

interface SprintContextType {
  stories: UserStory[];
  teamMembers: TeamMember[];
  metrics: SprintMetrics;
  riskData: RiskDataPoint[];
  messages: ReturnType<typeof useAiChat>['messages'];
  isAiTyping: boolean;
  
  // Story actions
  addStory: (story: UserStory) => void;
  removeStory: (id: string) => void;
  updateStory: (id: string, updates: Partial<UserStory>) => void;
  reorderStories: (activeId: string, overId: string) => void;
  
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

    const newRiskData = initialRiskData.map((point, idx) => ({
      ...point,
      projected: Math.max(0, riskScore - (riskScore / 14) * idx),
    }));
    setRiskData(newRiskData);
  }, [stories, metrics.capacity]);

  const { messages, isAiTyping, sendMessage, addConfirmationMessage } = useAiChat({
    stories,
    metrics,
  });

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

  const reorderStories = useCallback((activeId: string, overId: string) => {
    setStories(prev => {
      const oldIndex = prev.findIndex(s => s.id === activeId);
      const newIndex = prev.findIndex(s => s.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return prev;
      
      const newStories = [...prev];
      const [removed] = newStories.splice(oldIndex, 1);
      newStories.splice(newIndex, 0, removed);
      
      return newStories;
    });
  }, []);

  const applyBreakdown = useCallback((storyId: string, newStories: Partial<UserStory>[]) => {
    const oldStory = stories.find(s => s.id === storyId);
    
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
    addConfirmationMessage(
      `✅ **Breakdown Applied!**\n\nI've updated the backlog:\n- Removed "${oldStory?.title || 'vague story'}" (${oldStory?.storyPoints || 0} pts)\n- Added "${fullStories[0]?.title}" (${fullStories[0]?.storyPoints} pts)\n${fullStories[1] ? `- Added "${fullStories[1].title}" (${fullStories[1].storyPoints} pts)\n` : ''}\nYour capacity utilization has improved and risk score decreased. The sprint plan is now more achievable!`
    );
    
    setTimeout(recalculateMetrics, 0);
  }, [stories, recalculateMetrics, addConfirmationMessage]);

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
        reorderStories,
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
