
import React, { useState } from 'react';
import { Task, Tag } from '@/types';
import { useTaskContext } from '@/context/TaskContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Clock, Hourglass, User, MoveVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ProjectTaskTableProps {
  tag: Tag;
}

const ProjectTaskTable: React.FC<ProjectTaskTableProps> = ({ tag }) => {
  const { tasks } = useTaskContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  
  // Get tasks for this project/tag
  const projectTasks = tasks.filter(task => 
    task.tags.some(taskTag => taskTag.id === tag.id)
  );

  // Calculate total time spent on this project
  const totalTimeSpent = projectTasks.reduce((total, task) => total + task.timeSpent, 0);
  
  // Format time spent
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
  
  // Get priority badge class and label
  const getPriorityBadge = (priority: string) => {
    const label = priority === 'both' ? 'Urgent & Important' : 
                 priority === 'urgent' ? 'Urgent' : 
                 priority === 'important' ? 'Important' : 'Standard';
    
    return <Badge variant="outline" className={`task-priority-${priority} border-0`}>{label}</Badge>;
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    const label = status === 'todo' ? 'Liste de tâches' : 
                 status === 'in-progress' ? 'En cours' : 
                 status === 'completed' ? 'Terminée' : 'Liste de tâches';
    
    return <Badge variant="outline" className={`task-status-${status} border-0`}>{label}</Badge>;
  };
  
  // Handle edit task
  const handleEditTask = (taskId: string) => {
    navigate('/tasks', { state: { editTaskId: taskId } });
  };
  
  // If no tasks are associated with this project
  if (projectTasks.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <div
            className="w-4 h-4 rounded-full mr-2"
            style={{ backgroundColor: tag.color }}
          ></div>
          <h3 className="text-lg font-semibold">{tag.name}</h3>
        </div>
        <div className="bg-muted/30 rounded-md p-4 text-center text-muted-foreground">
          Aucune tâche associée à ce projet
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-8 border rounded-md shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-3 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: tag.color }}
              ></div>
              <h3 className="text-lg font-semibold">{tag.name}</h3>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        
        <CollapsibleContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Tâche</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Assigné à</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Durée estimée</TableHead>
                <TableHead>Temps passé</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoveVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>
                    {task.assignedTo ? (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{task.assignedTo.firstName} {task.assignedTo.lastName}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Non assigné</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? (
                      format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: fr })
                    ) : (
                      <span className="text-muted-foreground text-sm">Non définie</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.estimatedTime ? (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-focus" />
                        <span>{task.estimatedTime} min</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Non estimée</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Hourglass className="h-3 w-3" />
                      <span>{formatTimeSpent(task.timeSpent)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleEditTask(task.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="flex justify-between text-sm text-muted-foreground mt-2 p-3 border-t bg-muted/10">
            <div>
              <span className="font-medium">{projectTasks.length}</span> tâche{projectTasks.length > 1 ? 's' : ''} associée{projectTasks.length > 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Temps total : {formatTimeSpent(totalTimeSpent)}</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ProjectTaskTable;
