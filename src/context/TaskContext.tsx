import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Tag, TaskPriority, TaskStatus, Collaborator } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface TaskContextProps {
  tasks: Task[];
  tags: Tag[];
  collaborators: Collaborator[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  duplicateTask: (id: string) => void;
  addTag: (name: string, color: string) => void;
  updateTag: (id: string, tag: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  addCollaborator: (collaborator: Omit<Collaborator, 'id'>) => void;
  updateCollaborator: (id: string, collaborator: Partial<Collaborator>) => void;
  deleteCollaborator: (id: string) => void;
  incrementTaskTime: (id: string, seconds: number) => void;
}

const TaskContext = createContext<TaskContextProps | undefined>(undefined);

// Initial projects
const initialTags: Tag[] = [
  { id: uuidv4(), name: 'Travail', color: '#4f46e5' },
  { id: uuidv4(), name: 'Personnel', color: '#ec4899' },
  { id: uuidv4(), name: 'Études', color: '#0ea5e9' },
  { id: uuidv4(), name: 'Santé', color: '#10b981' },
];

// Initial collaborators
const initialCollaborators: Collaborator[] = [
  { 
    id: uuidv4(), 
    firstName: 'Jean', 
    lastName: 'Dupont', 
    email: 'jean.dupont@example.com',
    phone: '01 23 45 67 89',
    organization: 'Entreprise A'
  },
  { 
    id: uuidv4(), 
    firstName: 'Marie', 
    lastName: 'Martin', 
    email: 'marie.martin@example.com',
    phone: '01 98 76 54 32',
    organization: 'Entreprise B'
  },
];

// Sample tasks
const initialTasks: Task[] = [
  {
    id: uuidv4(),
    title: 'Créer une présentation pour la réunion #presentation #reunion',
    description: 'Préparer une présentation PowerPoint sur le nouveau projet #projet',
    priority: 'both',
    status: 'todo',
    tags: [initialTags[0]],
    hashtags: ['presentation', 'reunion', 'projet'],
    assignedTo: initialCollaborators[0],
    timeSpent: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    title: 'Faire du sport #fitness',
    description: '30 minutes de course à pied #running',
    priority: 'important',
    status: 'todo',
    tags: [initialTags[3]],
    hashtags: ['fitness', 'running'],
    assignedTo: null,
    timeSpent: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    title: 'Répondre aux emails #communication',
    description: 'Traiter les emails importants en attente #urgent',
    priority: 'urgent',
    status: 'todo',
    tags: [initialTags[0]],
    hashtags: ['communication', 'urgent'],
    assignedTo: initialCollaborators[1],
    timeSpent: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [collaborators, setCollaborators] = useState<Collaborator[]>(initialCollaborators);

  // Extract hashtags from text
  const extractHashtags = (text: string): string[] => {
    const hashtagPattern = /#(\w+)/g;
    const matches = text.match(hashtagPattern);
    
    if (!matches) return [];
    
    return matches.map(tag => tag.substring(1).toLowerCase());
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent'>) => {
    const titleHashtags = extractHashtags(task.title);
    const descriptionHashtags = extractHashtags(task.description);
    const allHashtags = [...new Set([...titleHashtags, ...descriptionHashtags])];
    
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      hashtags: allHashtags,
      timeSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setTasks((prevTasks) => [...prevTasks, newTask]);
    toast.success('Tâche ajoutée avec succès');
  };

  const updateTask = (id: string, task: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === id) {
          const updatedTask = { ...t, ...task, updatedAt: new Date() };
          
          // Update hashtags if title or description changed
          if (task.title || task.description) {
            const titleHashtags = extractHashtags(task.title || t.title);
            const descriptionHashtags = extractHashtags(task.description || t.description);
            updatedTask.hashtags = [...new Set([...titleHashtags, ...descriptionHashtags])];
          }
          
          return updatedTask;
        }
        return t;
      })
    );
    toast.success('Tâche mise à jour');
  };

  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== id));
    toast.success('Tâche supprimée');
  };

  const duplicateTask = (id: string) => {
    const taskToDuplicate = tasks.find((t) => t.id === id);
    
    if (taskToDuplicate) {
      const duplicatedTask: Task = {
        ...taskToDuplicate,
        id: uuidv4(),
        title: `${taskToDuplicate.title} (copie)`,
        timeSpent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setTasks((prevTasks) => [...prevTasks, duplicatedTask]);
      toast.success('Tâche dupliquée');
    }
  };

  const addTag = (name: string, color: string) => {
    const newTag: Tag = {
      id: uuidv4(),
      name,
      color,
    };
    
    setTags((prevTags) => [...prevTags, newTag]);
    toast.success('Projet ajouté');
  };

  const updateTag = (id: string, tag: Partial<Tag>) => {
    setTags((prevTags) =>
      prevTags.map((t) =>
        t.id === id ? { ...t, ...tag } : t
      )
    );

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        const updatedTags = task.tags.map((t) =>
          t.id === id ? { ...t, ...tag } : t
        );
        
        return {
          ...task,
          tags: updatedTags,
          updatedAt: new Date(),
        };
      })
    );
    
    toast.success('Projet mis à jour');
  };

  const deleteTag = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => ({
        ...task,
        tags: task.tags.filter((tag) => tag.id !== id),
        updatedAt: new Date(),
      }))
    );
    
    setTags((prevTags) => prevTags.filter((tag) => tag.id !== id));
    toast.success('Projet supprimé');
  };

  const incrementTaskTime = (id: string, seconds: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              timeSpent: task.timeSpent + seconds,
              updatedAt: new Date(),
            }
          : task
      )
    );
  };

  const addCollaborator = (collaborator: Omit<Collaborator, 'id'>) => {
    const newCollaborator: Collaborator = {
      ...collaborator,
      id: uuidv4(),
    };
    
    setCollaborators((prevCollaborators) => [...prevCollaborators, newCollaborator]);
    toast.success('Collaborateur ajouté');
  };

  const updateCollaborator = (id: string, collaborator: Partial<Collaborator>) => {
    setCollaborators((prevCollaborators) =>
      prevCollaborators.map((c) =>
        c.id === id ? { ...c, ...collaborator } : c
      )
    );
    
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.assignedTo?.id === id) {
          const updatedCollaborator = {
            ...task.assignedTo,
            ...collaborator
          };
          
          return {
            ...task,
            assignedTo: updatedCollaborator,
            updatedAt: new Date(),
          };
        }
        return task;
      })
    );
    
    toast.success('Collaborateur mis à jour');
  };

  const deleteCollaborator = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.assignedTo?.id === id) {
          return {
            ...task,
            assignedTo: null,
            updatedAt: new Date(),
          };
        }
        return task;
      })
    );
    
    setCollaborators((prevCollaborators) => 
      prevCollaborators.filter((c) => c.id !== id)
    );
    
    toast.success('Collaborateur supprimé');
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        tags,
        collaborators,
        addTask,
        updateTask,
        deleteTask,
        duplicateTask,
        addTag,
        updateTag,
        deleteTag,
        addCollaborator,
        updateCollaborator,
        deleteCollaborator,
        incrementTaskTime,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  
  return context;
};
