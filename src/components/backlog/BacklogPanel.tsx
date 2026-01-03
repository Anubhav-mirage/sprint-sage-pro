import { Plus, Filter, Search, Sparkles } from 'lucide-react';
import { useSprint } from '@/context/SprintContext';
import { StoryCard } from './StoryCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function BacklogPanel() {
  const { stories } = useSprint();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    story.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPoints = stories.reduce((sum, s) => sum + s.storyPoints, 0);
  const vagueCount = stories.filter(s => s.isVague).length;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Sprint Backlog</h2>
            <p className="text-sm text-muted-foreground">
              {stories.length} stories · {totalPoints} points
            </p>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Story
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* AI Alert */}
        {vagueCount > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-primary-light border border-primary/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {vagueCount} {vagueCount === 1 ? 'story needs' : 'stories need'} refinement
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Ask SprintPilot to review and break down vague stories.
            </p>
          </div>
        )}
      </div>

      {/* Stories List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {filteredStories.map((story, index) => (
          <div 
            key={story.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <StoryCard story={story} />
          </div>
        ))}

        {filteredStories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No stories found</p>
          </div>
        )}
      </div>
    </div>
  );
}
