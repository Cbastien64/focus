
import React from 'react';
import { Task, TaskPriority } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, TimerIcon } from 'lucide-react';
import { useTimerContext } from '@/context/TimerContext';

interface MatrixQuadrantProps {
  title: string;
  description: string;
  priority: TaskPriority;
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

const MatrixQuadrant: React.FC<MatrixQuadrantProps> = ({
  title,
  description,
  priority,
  tasks,
  onAddTask,
  onEditTask,
}) => {
  const { setCurrentTask, startTimer, timerState } = useTimerContext();
  
  // Get the background color class based on priority
  const getBgColorClass = (): string => {
    switch (priority) {
      case 'both':
        return 'bg-eisenhower-both/10 border-eisenhower-both/30';
      case 'urgent':
        return 'bg-eisenhower-urgent/10 border-eisenhower-urgent/30';
      case 'important':
        return 'bg-eisenhower-important/10 border-eisenhower-important/30';
      case 'neither':
        return 'bg-eisenhower-neither/10 border-eisenhower-neither/30';
    }
  };
  
  // Get the badge color class based on priority
  const getBadgeClass = (): string => {
    return `task-priority-${priority}`;
  };
  
  // Handle start timer button
  const handleStartTimer = (taskId: string) => {
    setCurrentTask(taskId);
    
    // Only start the timer if it's not already running
    if (!timerState.isRunning) {
      startTimer();
    }
  };

  return (
    <Card className={`${getBgColorClass()} h-full`}>
      <CardHeader>
        <Badge className={getBadgeClass()}>
          {title}
        </Badge>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-card rounded-md border flex items-center justify-between shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{task.title}</h4>
                  {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {task.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          style={{ backgroundColor: tag.color, color: 'white' }}
                          className="text-xs"
                          variant="outline"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => onEditTask(task)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => handleStartTimer(task.id)}
                  >
                    <TimerIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-3">
              Aucune tâche dans ce quadrant
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={onAddTask}
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter</span>
            </Button>
          </div>
        )}
        
        {tasks.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-1"
            onClick={onAddTask}
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter une tâche</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MatrixQuadrant;
