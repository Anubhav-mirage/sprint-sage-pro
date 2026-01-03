import { useSprint } from '@/context/SprintContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingDown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RiskChart() {
  const { riskData, metrics } = useSprint();
  
  const getRiskLevel = () => {
    if (metrics.riskScore > 60) return { label: 'High', color: 'text-danger', bg: 'bg-danger-light' };
    if (metrics.riskScore > 30) return { label: 'Medium', color: 'text-warning', bg: 'bg-warning-light' };
    return { label: 'Low', color: 'text-success', bg: 'bg-success-light' };
  };

  const risk = getRiskLevel();

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Risk Burndown</h3>
        </div>
        <span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
          risk.bg, risk.color
        )}>
          <AlertTriangle className="w-3 h-3" />
          {risk.label} Risk
        </span>
      </div>

      {/* Risk Score */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">{metrics.riskScore}%</span>
          <span className="text-sm text-muted-foreground">current risk</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={riskData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="day" 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickFormatter={(value) => `D${value}`}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickFormatter={(value) => `${value}%`}
              width={35}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`${value.toFixed(0)}%`, 'Risk']}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Area
              type="monotone"
              dataKey="projected"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#riskGradient)"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="hsl(var(--danger))"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-primary rounded" />
          <span>Projected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-danger rounded" style={{ borderStyle: 'dashed' }} />
          <span>Actual</span>
        </div>
      </div>
    </div>
  );
}
