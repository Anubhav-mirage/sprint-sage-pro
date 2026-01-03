import { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Sparkles, Calendar, User, Link2 } from 'lucide-react';
import { UserStory, Priority, RiskLevel, StoryStatus } from '@/data/mockData';
import { useSprint } from '@/context/SprintContext';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface StoryDetailDrawerProps {
  story: UserStory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StoryDetailDrawer({ story, open, onOpenChange }: StoryDetailDrawerProps) {
  const { updateStory, teamMembers } = useSprint();
  const [editedStory, setEditedStory] = useState<UserStory | null>(null);
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string[]>([]);
  const [newCriterion, setNewCriterion] = useState('');

  useEffect(() => {
    if (story) {
      setEditedStory({ ...story });
      // Mock acceptance criteria based on story
      setAcceptanceCriteria([
        'User can complete the action successfully',
        'Error states are handled gracefully',
        'Loading states are displayed appropriately',
      ]);
    }
  }, [story]);

  if (!editedStory) return null;

  const handleSave = () => {
    if (editedStory) {
      updateStory(editedStory.id, editedStory);
      onOpenChange(false);
    }
  };

  const handleAddCriterion = () => {
    if (newCriterion.trim()) {
      setAcceptanceCriteria([...acceptanceCriteria, newCriterion.trim()]);
      setNewCriterion('');
    }
  };

  const handleRemoveCriterion = (index: number) => {
    setAcceptanceCriteria(acceptanceCriteria.filter((_, i) => i !== index));
  };

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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-2xl overflow-y-auto">
          <DrawerHeader className="border-b border-border pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DrawerTitle className="text-xl font-semibold text-foreground">
                  Story Details
                </DrawerTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Edit story information and acceptance criteria
                </p>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="w-4 h-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="p-6 space-y-6">
            {/* Vague Warning */}
            {editedStory.isVague && (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-center gap-2 text-warning font-medium">
                  <AlertTriangle className="w-5 h-5" />
                  This story needs refinement
                </div>
                <p className="mt-1 text-sm text-warning/80">
                  Ask SprintPilot to help break this story down into actionable tasks.
                </p>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedStory.title}
                onChange={(e) => setEditedStory({ ...editedStory, title: e.target.value })}
                className="text-lg font-medium"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editedStory.description}
                onChange={(e) => setEditedStory({ ...editedStory, description: e.target.value })}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Story Points */}
              <div className="space-y-2">
                <Label>Story Points</Label>
                <Select
                  value={String(editedStory.storyPoints)}
                  onValueChange={(value) => setEditedStory({ ...editedStory, storyPoints: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 5, 8, 13, 21].map((points) => (
                      <SelectItem key={points} value={String(points)}>
                        {points} pts
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={editedStory.priority}
                  onValueChange={(value) => setEditedStory({ ...editedStory, priority: value as Priority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Risk Level */}
              <div className="space-y-2">
                <Label>Risk Level</Label>
                <Select
                  value={editedStory.riskLevel}
                  onValueChange={(value) => setEditedStory({ ...editedStory, riskLevel: value as RiskLevel })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editedStory.status}
                  onValueChange={(value) => setEditedStory({ ...editedStory, status: value as StoryStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assignee */}
              <div className="space-y-2 col-span-2">
                <Label>Assignee</Label>
                <Select
                  value={editedStory.assignee || 'unassigned'}
                  onValueChange={(value) => setEditedStory({ ...editedStory, assignee: value === 'unassigned' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                            {member.avatar}
                          </div>
                          {member.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Acceptance Criteria */}
            <div className="space-y-3">
              <Label>Acceptance Criteria</Label>
              <div className="space-y-2">
                {acceptanceCriteria.map((criterion, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 group"
                  >
                    <div className="w-5 h-5 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                      {index + 1}
                    </div>
                    <span className="flex-1 text-sm">{criterion}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveCriterion(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add acceptance criterion..."
                  value={newCriterion}
                  onChange={(e) => setNewCriterion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCriterion()}
                />
                <Button variant="secondary" onClick={handleAddCriterion}>
                  Add
                </Button>
              </div>
            </div>

            {/* AI Insights */}
            {editedStory.aiInsights && editedStory.aiInsights.length > 0 && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Insights
                </Label>
                <div className="space-y-2">
                  {editedStory.aiInsights.map((insight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10"
                    >
                      <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                      <span className="text-sm">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dependencies */}
            {editedStory.dependencies && editedStory.dependencies.length > 0 && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Dependencies
                </Label>
                <div className="flex flex-wrap gap-2">
                  {editedStory.dependencies.map((dep) => (
                    <Badge key={dep} variant="secondary">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Created {editedStory.createdAt.toLocaleDateString()}
              </div>
              {editedStory.assignee && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {teamMembers.find(m => m.id === editedStory.assignee)?.name || 'Unknown'}
                </div>
              )}
            </div>
          </div>

          <DrawerFooter className="border-t border-border">
            <div className="flex gap-3 w-full">
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button onClick={handleSave} className="flex-1 gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
