export type Priority = 'high' | 'medium' | 'low';
export type RiskLevel = 'high' | 'medium' | 'low';
export type StoryStatus = 'backlog' | 'ready' | 'in-progress' | 'done';

export interface UserStory {
  id: string;
  title: string;
  description: string;
  storyPoints: number;
  priority: Priority;
  riskLevel: RiskLevel;
  status: StoryStatus;
  assignee?: string;
  dependencies?: string[];
  aiInsights?: string[];
  isVague?: boolean;
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  capacity: number; // points per sprint
  assignedPoints: number;
}

export interface SprintMetrics {
  velocity: number;
  capacity: number;
  committedPoints: number;
  riskScore: number;
  sprintDays: number;
  remainingDays: number;
}

export interface RiskDataPoint {
  day: number;
  projected: number;
  actual?: number;
}

// Mock User Stories for "User Onboarding" sprint
export const initialStories: UserStory[] = [
  {
    id: 'story-1',
    title: 'Design Login Page',
    description: 'Create a modern, accessible login page with email/password and social auth options.',
    storyPoints: 3,
    priority: 'high',
    riskLevel: 'low',
    status: 'ready',
    assignee: 'dev-1',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 'story-2',
    title: 'Backend API for Authentication',
    description: 'Implement secure authentication endpoints with JWT tokens, refresh logic, and session management.',
    storyPoints: 5,
    priority: 'high',
    riskLevel: 'medium',
    status: 'ready',
    assignee: 'dev-2',
    dependencies: ['story-1'],
    aiInsights: ['Consider rate limiting', 'Add OAuth2 support'],
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 'story-3',
    title: 'User Registration Flow',
    description: 'Build the complete registration flow including email verification and welcome sequence.',
    storyPoints: 5,
    priority: 'high',
    riskLevel: 'low',
    status: 'ready',
    assignee: 'dev-1',
    dependencies: ['story-2'],
    createdAt: new Date('2024-01-11'),
  },
  {
    id: 'story-4',
    title: 'Password Reset Functionality',
    description: 'Implement secure password reset with email tokens and expiration handling.',
    storyPoints: 3,
    priority: 'medium',
    riskLevel: 'low',
    status: 'backlog',
    createdAt: new Date('2024-01-11'),
  },
  {
    id: 'story-5',
    title: 'Improve UX',
    description: 'Make the user experience better.',
    storyPoints: 8,
    priority: 'medium',
    riskLevel: 'high',
    status: 'backlog',
    isVague: true,
    aiInsights: ['Story is too vague - needs refinement', 'Consider breaking into smaller tasks'],
    createdAt: new Date('2024-01-12'),
  },
  {
    id: 'story-6',
    title: 'Onboarding Wizard',
    description: 'Create a multi-step onboarding wizard to collect user preferences and setup their workspace.',
    storyPoints: 8,
    priority: 'medium',
    riskLevel: 'medium',
    status: 'backlog',
    dependencies: ['story-3'],
    aiInsights: ['Large story - consider splitting'],
    createdAt: new Date('2024-01-12'),
  },
  {
    id: 'story-7',
    title: 'Profile Settings Page',
    description: 'Allow users to update their profile information, avatar, and notification preferences.',
    storyPoints: 5,
    priority: 'low',
    riskLevel: 'low',
    status: 'backlog',
    createdAt: new Date('2024-01-13'),
  },
];

export const teamMembers: TeamMember[] = [
  {
    id: 'dev-1',
    name: 'Alex Chen',
    avatar: 'AC',
    role: 'Frontend Developer',
    capacity: 15,
    assignedPoints: 8,
  },
  {
    id: 'dev-2',
    name: 'Jordan Smith',
    avatar: 'JS',
    role: 'Backend Developer',
    capacity: 15,
    assignedPoints: 5,
  },
  {
    id: 'dev-3',
    name: 'Sam Taylor',
    avatar: 'ST',
    role: 'Full Stack Developer',
    capacity: 10,
    assignedPoints: 0,
  },
];

export const sprintMetrics: SprintMetrics = {
  velocity: 40,
  capacity: 40,
  committedPoints: 37,
  riskScore: 35,
  sprintDays: 14,
  remainingDays: 10,
};

export const riskBurndown: RiskDataPoint[] = [
  { day: 1, projected: 100, actual: 100 },
  { day: 2, projected: 90, actual: 92 },
  { day: 3, projected: 80, actual: 85 },
  { day: 4, projected: 70, actual: 75 },
  { day: 5, projected: 60 },
  { day: 6, projected: 50 },
  { day: 7, projected: 40 },
  { day: 8, projected: 35 },
  { day: 9, projected: 25 },
  { day: 10, projected: 20 },
  { day: 11, projected: 15 },
  { day: 12, projected: 10 },
  { day: 13, projected: 5 },
  { day: 14, projected: 0 },
];

// AI response templates for the copilot
export const aiResponses = {
  greeting: "Hello! I'm SprintPilot, your AI planning assistant. I've analyzed your current backlog for the User Onboarding sprint. I notice a few items that might need attention. How can I help you today?",
  
  vagueStoryAnalysis: `I've analyzed the **"Improve UX"** story and found several concerns:

**Issues Identified:**
• The story is too vague and lacks specific acceptance criteria
• An 8-point estimate for an undefined scope creates risk
• No clear definition of "better" makes it hard to measure success

**My Recommendation:**
Based on your product context and past design patterns, I suggest breaking this into two focused stories:

1. **"Implement SSO Integration"** (5 pts) - Add Google and GitHub single sign-on
2. **"Update Welcome Email Template"** (2 pts) - Modernize the welcome email with the new brand guidelines

This reduces total points from 8 to 7 and significantly lowers risk.`,

  breakdownApplied: "I've updated the backlog with the two new stories. The capacity gauge has been recalculated - you're now at 36 points, which is well within your team's velocity of 40 points. The risk score has also decreased from 35% to 22%.",
  
  capacityWarning: "⚠️ **Capacity Alert:** Your committed points ({points}) exceed team capacity ({capacity}). I recommend deferring 1-2 lower priority items or negotiating scope with stakeholders.",
  
  dependencyWarning: "I've detected a dependency chain: Story #3 depends on #2, which depends on #1. Ensure the login page design is completed first to prevent blockers.",
};
