import { useSprint } from '@/context/SprintContext';
import { cn } from '@/lib/utils';

export function CapacityGauge() {
  const { metrics } = useSprint();
  const { committedPoints, capacity } = metrics;
  
  const percentage = Math.min((committedPoints / capacity) * 100, 120);
  const isOverCapacity = committedPoints > capacity;
  const isWarning = percentage > 80 && percentage <= 100;
  
  // Calculate the arc
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = Math.PI * normalizedRadius; // Half circle
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  const getStatusColor = () => {
    if (isOverCapacity) return 'hsl(var(--danger))';
    if (isWarning) return 'hsl(var(--warning))';
    return 'hsl(var(--success))';
  };

  const getStatusBg = () => {
    if (isOverCapacity) return 'bg-danger-light';
    if (isWarning) return 'bg-warning-light';
    return 'bg-success-light';
  };

  const getStatusText = () => {
    if (isOverCapacity) return 'Over Capacity';
    if (isWarning) return 'Near Capacity';
    return 'On Track';
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Capacity</h3>
        <span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          getStatusBg(),
          isOverCapacity ? 'text-danger' : isWarning ? 'text-warning' : 'text-success'
        )}>
          {getStatusText()}
        </span>
      </div>

      {/* Gauge */}
      <div className="relative flex justify-center">
        <svg 
          width={radius * 2} 
          height={radius + 10}
          className="overflow-visible"
        >
          {/* Background Arc */}
          <path
            d={`M ${strokeWidth / 2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - strokeWidth / 2} ${radius}`}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Progress Arc */}
          <path
            d={`M ${strokeWidth / 2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - strokeWidth / 2} ${radius}`}
            fill="none"
            stroke={getStatusColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.3s ease',
            }}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <div className="text-3xl font-bold text-foreground">
            {committedPoints}
          </div>
          <div className="text-sm text-muted-foreground">
            of {capacity} pts
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center p-3 rounded-lg bg-secondary">
          <div className="text-lg font-semibold text-foreground">
            {Math.round(percentage)}%
          </div>
          <div className="text-xs text-muted-foreground">Utilization</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-secondary">
          <div className="text-lg font-semibold text-foreground">
            {Math.max(0, capacity - committedPoints)}
          </div>
          <div className="text-xs text-muted-foreground">Pts Available</div>
        </div>
      </div>
    </div>
  );
}
