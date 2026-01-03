import { SprintProvider } from '@/context/SprintContext';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { BacklogPanel } from '@/components/backlog/BacklogPanel';
import { DashboardPanel } from '@/components/dashboard/DashboardPanel';
import { CopilotPanel } from '@/components/copilot/CopilotPanel';

const SprintDashboard = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-1 flex min-w-0">
        {/* Left: Backlog */}
        <div className="w-[340px] shrink-0 border-r border-border">
          <BacklogPanel />
        </div>

        {/* Center: Dashboard */}
        <div className="flex-1 min-w-0">
          <DashboardPanel />
        </div>

        {/* Right: AI Copilot */}
        <div className="w-[380px] shrink-0">
          <CopilotPanel />
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <SprintProvider>
      <SprintDashboard />
    </SprintProvider>
  );
};

export default Index;
