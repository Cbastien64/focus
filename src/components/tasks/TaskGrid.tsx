
import React, { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '@/types';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuTrigger, 
  DropdownMenuCheckboxItem 
} from "@/components/ui/dropdown-menu";

const TaskGrid: React.FC = () => {
  const { tasks, tags } = useTaskContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  
  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };
  
  const handleAddTask = () => {
    setSelectedTask(undefined);
    setIsFormOpen(true);
  };
  
  const toggleTagFilter = (tagId: string) => {
    if (tagFilter.includes(tagId)) {
      setTagFilter(tagFilter.filter((id) => id !== tagId));
    } else {
      setTagFilter([...tagFilter, tagId]);
    }
  };
  
  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Filter by status
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }
    
    // Filter by priority
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }
    
    // Filter by tags
    if (tagFilter.length > 0) {
      const taskHasFilteredTag = task.tags.some((tag) => tagFilter.includes(tag.id));
      if (!taskHasFilteredTag) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tâches</h1>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                <span>Filtres</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filtrer par tag</DropdownMenuLabel>
              {tags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={tagFilter.includes(tag.id)}
                  onCheckedChange={() => toggleTagFilter(tag.id)}
                >
                  <span 
                    className="inline-block w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: tag.color }}
                  ></span>
                  {tag.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Select 
            value={priorityFilter} 
            onValueChange={(value) => setPriorityFilter(value as TaskPriority | 'all')}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="both">Urgent & Important</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="important">Important</SelectItem>
                <SelectItem value="neither">Standard</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select 
            value={statusFilter} 
            onValueChange={(value) => setStatusFilter(value as TaskStatus | 'all')}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="todo">À faire</SelectItem>
                <SelectItem value="in-progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddTask} className="gap-1 bg-focus hover:bg-focus-dark">
            <Plus className="h-4 w-4" />
            <span>Ajouter</span>
          </Button>
        </div>
      </div>
      
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={handleEdit} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-muted-foreground mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m8 2 4 4 4-4" />
              <path d="M8 10h8" />
              <path d="M8 14h4" />
            </svg>
          </div>
          <h3 className="text-xl font-medium">Aucune tâche trouvée</h3>
          <p className="text-muted-foreground mt-1">
            {tasks.length > 0
              ? "Ajustez vos filtres ou "
              : "Commencez par "}
            <button
              onClick={handleAddTask}
              className="text-focus hover:underline"
            >
              créer une nouvelle tâche
            </button>
          </p>
        </div>
      )}
      
      <TaskForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        task={selectedTask}
      />
    </div>
  );
};

export default TaskGrid;
