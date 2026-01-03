import { CapacityGauge } from './CapacityGauge';
import { RiskChart } from './RiskChart';
import { TeamWorkload } from './TeamWorkload';
import { useSprint } from '@/context/SprintContext';
import { Calendar, Zap } from 'lucide-react';

export function DashboardPanel() {
  const { metrics } = useSprint();

  return (
    <div className="h-full overflow-y-auto bg-secondary/30 scrollbar-thin">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Sprint Dashboard</h2>
            <p className="text-sm text-muted-foreground">User Onboarding Sprint</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{metrics.remainingDays} days left</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Velocity: {metrics.velocity}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-secondary text-center">
            <div className="text-2xl font-bold text-foreground">{metrics.committedPoints}</div>
            <div className="text-xs text-muted-foreground">Committed</div>
          </div>
          <div className="p-3 rounded-lg bg-secondary text-center">
            <div className="text-2xl font-bold text-foreground">{metrics.capacity}</div>
            <div className="text-xs text-muted-foreground">Capacity</div>
          </div>
          <div className="p-3 rounded-lg bg-secondary text-center">
            <div className="text-2xl font-bold text-foreground">{metrics.riskScore}%</div>
            <div className="text-xs text-muted-foreground">Risk Score</div>
          </div>
          <div className="p-3 rounded-lg bg-secondary text-center">
            <div className="text-2xl font-bold text-foreground">{metrics.sprintDays}</div>
            <div className="text-xs text-muted-foreground">Sprint Days</div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6 space-y-6">
        <CapacityGauge />
        <RiskChart />
        <TeamWorkload />
      </div>
    </div>
  );
}
