
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TaskPriority, TaskStatus, Task, Tag, Collaborator } from '@/types';
import { useTaskContext } from '@/context/TaskContext';
import { Check, AlertTriangle, Clock } from 'lucide-react';
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
    } else {
      setTitle('');
      setDescription('');
      setPriority('neither');
      setStatus('todo');
      setSelectedTags([]);
      setHashtags('');
      setAssignedToId(null);
    }
  }, [task, open]);
  
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Modifier la tâche' : 'Nouvelle tâche'}</DialogTitle>
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
                  value={priority === 'important' || priority === 'both' ? 'important' : 'not-important'}
                  onValueChange={(value) => {
                    if (value === 'important') {
                      setPriority(priority === 'urgent' ? 'both' : 'important');
                    } else {
                      setPriority(priority === 'both' || priority === 'important' ? 'urgent' : 'neither');
                    }
                  }}
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
                  value={priority === 'urgent' || priority === 'both' ? 'urgent' : 'not-urgent'}
                  onValueChange={(value) => {
                    if (value === 'urgent') {
                      setPriority(priority === 'important' ? 'both' : 'urgent');
                    } else {
                      setPriority(priority === 'both' || priority === 'urgent' ? 'important' : 'neither');
                    }
                  }}
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
                className={`${
                  priority === 'both' ? 'bg-red-500' :
                  priority === 'urgent' ? 'bg-yellow-500' :
                  priority === 'important' ? 'bg-blue-500' :
                  'bg-gray-500'
                } text-white`}
              >
                {priority === 'both' ? 'Urgent & Important' : 
                 priority === 'urgent' ? 'Urgent' : 
                 priority === 'important' ? 'Important' : 'Standard'}
              </Badge>
              
              {priority === 'both' && <AlertTriangle className="h-4 w-4 text-red-500" />}
              {priority === 'urgent' && <Clock className="h-4 w-4 text-yellow-500" />}
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
