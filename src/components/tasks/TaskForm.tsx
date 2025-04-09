
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TaskPriority, TaskStatus, Task, Tag, Collaborator } from '@/types';
import { useTaskContext } from '@/context/TaskContext';
import { Check, AlertTriangle, Clock, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
}

const TaskForm: React.FC<TaskFormProps> = ({ open, onOpenChange, task }) => {
  const { addTask, updateTask, tags, collaborators } = useTaskContext();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('neither');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [hashtags, setHashtags] = useState('');
  const [assignedToId, setAssignedToId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number>(0); // in minutes
  const [isImportant, setIsImportant] = useState<boolean>(false);
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  
  // Reset form when dialog opens/closes or task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setStatus(task.status);
      setSelectedTags(task.tags);
      setHashtags(task.hashtags ? task.hashtags.map(tag => `#${tag}`).join(' ') : '');
      setAssignedToId(task.assignedTo?.id || null);
      setDueDate(task.dueDate || null);
      setEstimatedTime(task.estimatedTime || 0);
      
      // Set importance and urgency based on priority
      setIsImportant(task.priority === 'important' || task.priority === 'both');
      setIsUrgent(task.priority === 'urgent' || task.priority === 'both');
    } else {
      setTitle('');
      setDescription('');
      setPriority('neither');
      setStatus('todo');
      setSelectedTags([]);
      setHashtags('');
      setAssignedToId(null);
      setDueDate(null);
      setEstimatedTime(0);
      setIsImportant(false);
      setIsUrgent(false);
    }
  }, [task, open]);
  
  // Update priority when importance or urgency changes
  useEffect(() => {
    if (isImportant && isUrgent) {
      setPriority('both');
    } else if (isImportant) {
      setPriority('important');
    } else if (isUrgent) {
      setPriority('urgent');
    } else {
      setPriority('neither');
    }
  }, [isImportant, isUrgent]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }
    
    // Extract hashtags from the hashtags field
    const hashtagsArray = hashtags
      .split(/\s+/)
      .filter(tag => tag.startsWith('#') && tag.length > 1)
      .map(tag => tag.substring(1).toLowerCase());
    
    const assignedTo = assignedToId 
      ? collaborators.find(c => c.id === assignedToId) || null 
      : null;
    
    if (task) {
      updateTask(task.id, {
        title,
        description,
        priority,
        status,
        tags: selectedTags,
        hashtags: hashtagsArray,
        assignedTo,
        dueDate,
        estimatedTime,
      });
    } else {
      addTask({
        title,
        description,
        priority,
        status,
        tags: selectedTags,
        hashtags: hashtagsArray,
        assignedTo,
        dueDate,
        estimatedTime,
      });
    }
    
    onOpenChange(false);
  };
  
  const toggleTag = (tag: Tag) => {
    if (selectedTags.some((t) => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Get priority label based on importance and urgency
  const getPriorityLabel = (): string => {
    if (isImportant && isUrgent) {
      return 'À faire en premier';
    } else if (isImportant && !isUrgent) {
      return 'À planifier';
    } else if (!isImportant && isUrgent) {
      return 'À déléguer';
    } else {
      return 'À éliminer ou reporter';
    }
  };
  
  // Get color class for the priority badge
  const getPriorityColorClass = (): string => {
    if (priority === 'both') {
      return 'bg-red-500';
    } else if (priority === 'important') {
      return 'bg-blue-500';
    } else if (priority === 'urgent') {
      return 'bg-yellow-500';
    } else {
      return 'bg-gray-500';
    }
  };

  // Format the estimated time in a readable format
  const formatEstimatedTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} heure${hours > 1 ? 's' : ''}`;
    }
    return `${hours} heure${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Modifier la tâche' : 'Nouvelle tâche'}</DialogTitle>
          <DialogDescription>
            {task ? 'Modifier les détails de la tâche' : 'Ajouter une nouvelle tâche'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la tâche"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la tâche (optionnelle)"
              rows={3}
            />
          </div>
          
          <div className="space-y-3">
            <Label>Matrice d'Eisenhower</Label>
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-muted/30">
              <div className="space-y-2">
                <div className="font-medium text-sm">Importance</div>
                <RadioGroup 
                  value={isImportant ? 'important' : 'not-important'}
                  onValueChange={(value) => setIsImportant(value === 'important')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="important" id="important" />
                    <Label htmlFor="important">Important</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not-important" id="not-important" />
                    <Label htmlFor="not-important">Non-important</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-sm">Urgence</div>
                <RadioGroup 
                  value={isUrgent ? 'urgent' : 'not-urgent'}
                  onValueChange={(value) => setIsUrgent(value === 'urgent')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="urgent" id="urgent" />
                    <Label htmlFor="urgent">Urgent</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not-urgent" id="not-urgent" />
                    <Label htmlFor="not-urgent">Non-urgent</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                className={`${getPriorityColorClass()} text-white`}
              >
                {isImportant && isUrgent ? 'Urgent & Important' : 
                 isImportant ? 'Important' : 
                 isUrgent ? 'Urgent' : 'Standard'}
              </Badge>
              
              <span className="text-sm text-muted-foreground ml-1">{getPriorityLabel()}</span>
              
              {isImportant && isUrgent && <AlertTriangle className="h-4 w-4 text-red-500" />}
              {isUrgent && !isImportant && <Clock className="h-4 w-4 text-yellow-500" />}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select 
              value={status} 
              onValueChange={(value) => setStatus(value as TaskStatus)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Sélectionner statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="todo">À faire</SelectItem>
                  <SelectItem value="in-progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Date d'échéance</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP', { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dueDate || undefined}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="estimatedTime">Temps estimé (en minutes)</Label>
            <div className="flex gap-2">
              <Input
                id="estimatedTime"
                type="number"
                min="0"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 0)}
                placeholder="Temps estimé"
                className="flex-1"
              />
              {estimatedTime > 0 && (
                <div className="flex items-center text-sm text-muted-foreground">
                  {formatEstimatedTime(estimatedTime)}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hashtags">Tags (format #tag)</Label>
            <Input
              id="hashtags"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#important #projet #urgent"
            />
            <p className="text-xs text-muted-foreground">
              Séparez les tags par des espaces, chaque tag doit commencer par #
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Projets</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  style={{
                    backgroundColor: selectedTags.some((t) => t.id === tag.id)
                      ? tag.color
                      : 'transparent',
                    color: selectedTags.some((t) => t.id === tag.id)
                      ? 'white'
                      : 'inherit',
                    borderColor: tag.color,
                  }}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {selectedTags.some((t) => t.id === tag.id) && (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {tag.name}
                </Badge>
              ))}
              {tags.length === 0 && (
                <span className="text-sm text-muted-foreground">Aucun projet disponible</span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Attribuer à un collaborateur</Label>
            <Select 
              value={assignedToId || "none"} 
              onValueChange={(value) => setAssignedToId(value === "none" ? null : value)}
            >
              <SelectTrigger id="assignedTo">
                <SelectValue placeholder="Sélectionner un collaborateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="none">Non attribuée</SelectItem>
                  {collaborators.map((collaborator) => (
                    <SelectItem key={collaborator.id} value={collaborator.id}>
                      {collaborator.firstName} {collaborator.lastName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="submit" className="bg-focus hover:bg-focus-dark">
              {task ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
