import { useSprint } from '@/context/SprintContext';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TeamWorkload() {
  const { teamMembers } = useSprint();

  const getLoadColor = (assigned: number, capacity: number) => {
    const ratio = assigned / capacity;
    if (ratio > 1) return 'bg-danger';
    if (ratio > 0.8) return 'bg-warning';
    if (ratio > 0.5) return 'bg-primary';
    return 'bg-success';
  };

  const getLoadBg = (assigned: number, capacity: number) => {
    const ratio = assigned / capacity;
    if (ratio > 1) return 'bg-danger-light';
    if (ratio > 0.8) return 'bg-warning-light';
    return 'bg-secondary';
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Team Workload</h3>
      </div>

      <div className="space-y-4">
        {teamMembers.map((member) => {
          const loadPercentage = Math.min((member.assignedPoints / member.capacity) * 100, 100);
          const isOverloaded = member.assignedPoints > member.capacity;

          return (
            <div 
              key={member.id}
              className={cn(
                "p-3 rounded-lg transition-colors",
                getLoadBg(member.assignedPoints, member.capacity)
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  {member.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-foreground truncate">
                      {member.name}
                    </span>
                    <span className={cn(
                      "text-xs font-medium",
                      isOverloaded ? 'text-danger' : 'text-muted-foreground'
                    )}>
                      {member.assignedPoints}/{member.capacity} pts
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.role}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 bg-background rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    getLoadColor(member.assignedPoints, member.capacity)
                  )}
                  style={{ width: `${loadPercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-semibold text-foreground">
              {teamMembers.reduce((sum, m) => sum + m.assignedPoints, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Assigned</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">
              {teamMembers.reduce((sum, m) => sum + m.capacity, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Capacity</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-success">
              {teamMembers.reduce((sum, m) => sum + Math.max(0, m.capacity - m.assignedPoints), 0)}
            </div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
        </div>
      </div>
    </div>
  );
}
