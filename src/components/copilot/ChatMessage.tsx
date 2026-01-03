import { Sparkles, User } from 'lucide-react';
import { useSprint } from '@/context/SprintContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserStory } from '@/data/mockData';
import DOMPurify from 'dompurify';

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

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { applyBreakdown } = useSprint();
  const isAssistant = message.role === 'assistant';

  const handleAction = () => {
    if (message.action?.type === 'breakdown' && message.action.storyId && message.action.newStories) {
      applyBreakdown(message.action.storyId, message.action.newStories);
    }
  };

  // Configure DOMPurify to allow only safe tags
  const sanitizeConfig = {
    ALLOWED_TAGS: ['strong', 'em', 'br', 'span'],
    ALLOWED_ATTR: []
  };

  const sanitize = (html: string): string => {
    return DOMPurify.sanitize(html, sanitizeConfig);
  };

  // Parse markdown-like formatting
  const formatContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      // Handle bold text
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Handle bullet points
      if (line.startsWith('•') || line.startsWith('-')) {
        const sanitizedContent = sanitize(line.replace(/^[•-]\s*/, ''));
        return (
          <li 
            key={idx} 
            className="ml-4 text-sm"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        );
      }
      
      // Handle numbered lists
      const numberMatch = line.match(/^(\d+)\.\s/);
      if (numberMatch) {
        const sanitizedContent = sanitize(line.replace(/^\d+\.\s*/, ''));
        return (
          <div key={idx} className="flex gap-2 text-sm">
            <span className="text-primary font-medium">{numberMatch[1]}.</span>
            <span dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
          </div>
        );
      }

      // Regular line
      if (line.trim() === '') return <br key={idx} />;
      const sanitizedLine = sanitize(line);
      return (
        <p 
          key={idx} 
          className="text-sm"
          dangerouslySetInnerHTML={{ __html: sanitizedLine }}
        />
      );
    });
  };

  return (
    <div className={cn(
      "flex gap-3 animate-slide-up",
      isAssistant ? "justify-start" : "justify-end"
    )}>
      {isAssistant && (
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      <div className={cn(
        "max-w-[85%] rounded-xl p-4",
        isAssistant 
          ? "ai-message" 
          : "user-message"
      )}>
        <div className="space-y-2">
          {formatContent(message.content)}
        </div>

        {/* Action Card */}
        {message.action && (
          <div className="mt-4 p-3 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-foreground">
                  Suggested Action
                </div>
                {message.action.newStories && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Creates {message.action.newStories.length} new stories
                  </div>
                )}
              </div>
              <Button 
                size="sm" 
                onClick={handleAction}
                className="gap-2"
              >
                <Sparkles className="w-3 h-3" />
                {message.action.label}
              </Button>
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="mt-2 text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {!isAssistant && (
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
