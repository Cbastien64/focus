import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TaskPriority, TaskStatus, Task, Tag, Collaborator } from '@/types';
import { useTaskContext } from '@/context/TaskContext';
import { Check, AlertTriangle, Clock, Calendar, Users, Hash, Timer, Layers } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [estimatedTime, setEstimatedTime] = useState<number | string>('');
  const [isImportant, setIsImportant] = useState<boolean>(false);
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
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
      setEstimatedTime(task.estimatedTime || '');
      
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
      setEstimatedTime('');
      setIsImportant(false);
      setIsUrgent(false);
    }
  }, [task, open]);
  
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
    
    const hashtagsArray = hashtags
      .split(/\s+/)
      .filter(tag => tag.startsWith('#') && tag.length > 1)
      .map(tag => tag.substring(1).toLowerCase());
    
    const assignedTo = assignedToId 
      ? collaborators.find(c => c.id === assignedToId) || null 
      : null;
    
    const estimatedTimeNum = typeof estimatedTime === 'string' && estimatedTime.trim() === '' 
      ? 0 
      : Number(estimatedTime);
    
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
        estimatedTime: estimatedTimeNum,
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
        estimatedTime: estimatedTimeNum,
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

  const getStatusColorClass = (): string => {
    switch (status) {
      case 'todo':
        return 'bg-[#F2FCE2] text-green-800 border-green-300';
      case 'in-progress':
        return 'bg-[#FEC6A1] text-orange-800 border-orange-300';
      case 'completed':
        return 'bg-[#FFDEE2] text-pink-800 border-pink-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (): string => {
    switch (status) {
      case 'todo':
        return 'Liste de tâches';
      case 'in-progress':
        return 'En cours';
      case 'completed':
        return 'Terminée';
      default:
        return 'Liste de tâches';
    }
  };

  const formatEstimatedTime = (minutes: number | string): string => {
    const mins = Number(minutes);
    if (isNaN(mins) || mins <= 0) return '';
    
    if (mins < 60) {
      return `${mins} minutes`;
    }
    const hours = Math.floor(mins / 60);
    const remainingMinutes = mins % 60;
    if (remainingMinutes === 0) {
      return `${hours} heure${hours > 1 ? 's' : ''}`;
    }
    return `${hours} heure${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setDueDate(date || null);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{task ? 'Modifier la tâche' : 'Nouvelle tâche'}</DialogTitle>
          <DialogDescription>
            {task ? 'Modifier les détails de la tâche' : 'Ajouter une nouvelle tâche'}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="pr-4 max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-medium">Titre</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de la tâche"
                required
                className="text-lg"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    <span>Description</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description de la tâche (optionnelle)"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    <span>Statut</span>
                  </Label>
                  <Select 
                    value={status} 
                    onValueChange={(value) => setStatus(value as TaskStatus)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Sélectionner statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="todo">Liste de tâches</SelectItem>
                        <SelectItem value="in-progress">En cours</SelectItem>
                        <SelectItem value="completed">Terminée</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <div className="mt-2">
                    <Badge 
                      className={cn("px-2 py-1", getStatusColorClass())}
                    >
                      {getStatusLabel()}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Date d'échéance</span>
                  </Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                        onSelect={handleDateSelect}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                      <div className="p-2 border-t border-border flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => { 
                            setDueDate(null);
                            setIsCalendarOpen(false);
                          }}
                        >
                          Effacer
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => setIsCalendarOpen(false)}
                        >
                          OK
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estimatedTime" className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    <span>Temps estimé (en minutes)</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="estimatedTime"
                      type="number"
                      min="0"
                      value={estimatedTime}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || !isNaN(Number(value))) {
                          setEstimatedTime(value);
                        }
                      }}
                      placeholder="Temps estimé"
                      className="flex-1"
                    />
                    {estimatedTime !== '' && Number(estimatedTime) > 0 && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        {formatEstimatedTime(estimatedTime)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assignedTo" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Attribuer à un collaborateur</span>
                  </Label>
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
              </div>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Matrice d'Eisenhower</span>
                  </Label>
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
                  <Label htmlFor="hashtags" className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    <span>Tags (format #tag)</span>
                  </Label>
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
                  <Label className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    <span>Projets</span>
                  </Label>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[100px] overflow-y-auto">
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
                        className="cursor-pointer mb-1"
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
              </div>
            </div>
            
            <DialogFooter className="pt-4 mt-2">
              <Button type="submit" className="bg-focus hover:bg-focus-dark">
                {task ? 'Mettre à jour' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
