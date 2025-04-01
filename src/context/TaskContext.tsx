import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Tag, TaskPriority, TaskStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface TaskContextProps {
  tasks: Task[];
  tags: Tag[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  duplicateTask: (id: string) => void;
  addTag: (name: string, color: string) => void;
  deleteTag: (id: string) => void;
  incrementTaskTime: (id: string, seconds: number) => void;
}

const TaskContext = createContext<TaskContextProps | undefined>(undefined);

// Sample tags
const initialTags: Tag[] = [
  { id: uuidv4(), name: 'Work', color: '#4f46e5' },
  { id: uuidv4(), name: 'Personal', color: '#ec4899' },
  { id: uuidv4(), name: 'Study', color: '#0ea5e9' },
  { id: uuidv4(), name: 'Health', color: '#10b981' },
];

// Sample tasks
const initialTasks: Task[] = [
  {
    id: uuidv4(),
    title: 'Créer une présentation pour la réunion',
    description: 'Préparer une présentation PowerPoint sur le nouveau projet',
    priority: 'both',
    status: 'todo',
    tags: [initialTags[0]],
    timeSpent: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    title: 'Faire du sport',
    description: '30 minutes de course à pied',
    priority: 'important',
    status: 'todo',
    tags: [initialTags[3]],
    timeSpent: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    title: 'Répondre aux emails',
    description: 'Traiter les emails importants en attente',
    priority: 'urgent',
    status: 'todo',
    tags: [initialTags[0]],
    timeSpent: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [tags, setTags] = useState<Tag[]>(initialTags);

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent'>) => {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      timeSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setTasks((prevTasks) => [...prevTasks, newTask]);
    toast.success('Tâche ajoutée avec succès');
  };

  const updateTask = (id: string, task: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === id
          ? { ...t, ...task, updatedAt: new Date() }
          : t
      )
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
    toast.success('Tag ajouté');
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
    toast.success('Tag supprimé');
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

  return (
    <TaskContext.Provider
      value={{
        tasks,
        tags,
        addTask,
        updateTask,
        deleteTask,
        duplicateTask,
        addTag,
        deleteTag,
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
