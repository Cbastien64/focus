import React from 'react';
import { Task } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Edit, Trash, Copy, Hourglass, User, Hash, Timer, Calendar } from 'lucide-react';
import { useTaskContext } from '@/context/TaskContext';
import { useTimerContext } from '@/context/TimerContext';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from 'react-router-dom';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { deleteTask, duplicateTask } = useTaskContext();
  const { setCurrentTask, startTimer, timerState, startStopwatch } = useTimerContext();
  const navigate = useNavigate();
  
  const formatTimeSpent = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };
  
  const getPriorityClass = (): string => {
    return `task-priority-${task.priority}`;
  };
  
  const handleStartTimer = () => {
    setCurrentTask(task.id);
    
    if (!timerState.isRunning) {
      startTimer();
    }
    
    navigate('/timer');
  };
  
  const handleStartStopwatch = () => {
    setCurrentTask(task.id);
    startStopwatch();
    
    navigate('/timer');
  };

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <div className="flex items-center gap-2">
            <Badge className={getPriorityClass()} variant="outline">
              {task.priority === 'both' ? 'Urgent & Important' : 
               task.priority === 'urgent' ? 'Urgent' : 
               task.priority === 'important' ? 'Important' : 'Standard'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true, locale: fr })}
            </span>
          </div>
          <h3 className="text-lg font-semibold mt-2">{task.title}</h3>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          {task.description}
        </p>
        
        {task.dueDate && (
          <div className="flex items-center gap-2 mb-3 text-xs">
            <Calendar className="h-3 w-3 text-focus" />
            <span className="font-medium">
              Échéance: {format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: fr })}
            </span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map((tag) => (
            <Badge 
              key={tag.id} 
              style={{ backgroundColor: tag.color, color: 'white' }}
              className="text-xs"
            >
              {tag.name}
            </Badge>
          ))}
        </div>
        
        {task.hashtags && task.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.hashtags.map((hashtag, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="text-xs flex items-center gap-1"
              >
                <Hash className="h-3 w-3" />
                {hashtag}
              </Badge>
            ))}
          </div>
        )}
        
        {task.assignedTo && (
          <div className="flex items-center gap-2 mt-2 text-xs">
            <User className="h-3 w-3" />
            <span className="font-medium">{task.assignedTo.firstName} {task.assignedTo.lastName}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatTimeSpent(task.timeSpent)}</span>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex gap-1">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => onEdit(task)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => duplicateTask(task.id)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => deleteTask(task.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={handleStartStopwatch}
                >
                  <Timer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Démarrer le chronomètre</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            variant="default" 
            size="sm" 
            className="gap-1 bg-focus hover:bg-focus-dark"
            onClick={handleStartTimer}
          >
            <Hourglass className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
