import { 
  AlertTriangle, 
  Link2, 
  Sparkles, 
  GripVertical,
  MoreHorizontal
} from 'lucide-react';
import { UserStory } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface StoryCardProps {
  story: UserStory;
  onClick?: () => void;
}

export function StoryCard({ story, onClick }: StoryCardProps) {
  const priorityColors = {
    high: 'bg-danger-light text-danger border-danger/20',
    medium: 'bg-warning-light text-warning border-warning/20',
    low: 'bg-success-light text-success border-success/20',
  };

  const riskColors = {
    high: 'text-danger',
    medium: 'text-warning',
    low: 'text-success',
  };

  return (
    <div 
      className={cn(
        "story-card group cursor-pointer animate-fade-in",
        story.isVague && "border-warning/40 bg-warning-light/30"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div className="mt-1 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-medium text-foreground leading-tight">
              {story.title}
            </h3>
            <button className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {story.description}
          </p>

          {/* Tags Row */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Story Points */}
            <Badge variant="secondary" className="font-mono text-xs">
              {story.storyPoints} pts
            </Badge>

            {/* Priority */}
            <Badge 
              variant="outline" 
              className={cn("text-xs capitalize", priorityColors[story.priority])}
            >
              {story.priority}
            </Badge>

            {/* Risk Indicator */}
            {story.riskLevel !== 'low' && (
              <span className={cn(
                "inline-flex items-center gap-1 text-xs font-medium",
                riskColors[story.riskLevel]
              )}>
                <AlertTriangle className="w-3 h-3" />
                {story.riskLevel === 'high' ? 'High Risk' : 'Med Risk'}
              </span>
            )}

            {/* Dependencies */}
            {story.dependencies && story.dependencies.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Link2 className="w-3 h-3" />
                {story.dependencies.length} dep
              </span>
            )}

            {/* AI Insights Badge */}
            {story.aiInsights && story.aiInsights.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-primary">
                <Sparkles className="w-3 h-3" />
                AI Insights
              </span>
            )}
          </div>

          {/* Vague Story Warning */}
          {story.isVague && (
            <div className="mt-3 p-2 rounded-md bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-2 text-warning text-sm font-medium">
                <AlertTriangle className="w-4 h-4" />
                Needs Refinement
              </div>
              <p className="mt-1 text-xs text-warning/80">
                This story is too vague. Ask SprintPilot to help break it down.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
