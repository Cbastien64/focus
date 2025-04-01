
import React, { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Plus } from 'lucide-react';
import { Task } from '@/types';
import TaskForm from '@/components/tasks/TaskForm';
import { Button } from '@/components/ui/button';
import MatrixQuadrant from './MatrixQuadrant';

const EisenhowerMatrix: React.FC = () => {
  const { tasks } = useTaskContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  
  // Filter tasks for each quadrant
  const urgentImportantTasks = tasks.filter(
    (task) => task.priority === 'both' && task.status !== 'completed'
  );
  
  const urgentTasks = tasks.filter(
    (task) => task.priority === 'urgent' && task.status !== 'completed'
  );
  
  const importantTasks = tasks.filter(
    (task) => task.priority === 'important' && task.status !== 'completed'
  );
  
  const neitherTasks = tasks.filter(
    (task) => task.priority === 'neither' && task.status !== 'completed'
  );
  
  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };
  
  const handleAddTask = (priority: 'both' | 'urgent' | 'important' | 'neither') => {
    setSelectedTask({
      id: '',
      title: '',
      description: '',
      priority,
      status: 'todo',
      tags: [],
      timeSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setIsFormOpen(true);
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Matrice d'Eisenhower</h1>
        
        <Button onClick={() => handleAddTask('both')} className="gap-1 bg-focus hover:bg-focus-dark">
          <Plus className="h-4 w-4" />
          <span>Ajouter une tâche</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MatrixQuadrant
          title="Urgent & Important"
          description="Faire immédiatement"
          priority="both"
          tasks={urgentImportantTasks}
          onAddTask={() => handleAddTask('both')}
          onEditTask={handleEdit}
        />
        
        <MatrixQuadrant
          title="Important & Non-Urgent"
          description="Planifier un moment précis"
          priority="important"
          tasks={importantTasks}
          onAddTask={() => handleAddTask('important')}
          onEditTask={handleEdit}
        />
        
        <MatrixQuadrant
          title="Urgent & Non-Important"
          description="Déléguer si possible"
          priority="urgent"
          tasks={urgentTasks}
          onAddTask={() => handleAddTask('urgent')}
          onEditTask={handleEdit}
        />
        
        <MatrixQuadrant
          title="Non-Urgent & Non-Important"
          description="Éliminer ou faire plus tard"
          priority="neither"
          tasks={neitherTasks}
          onAddTask={() => handleAddTask('neither')}
          onEditTask={handleEdit}
        />
      </div>
      
      <TaskForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        task={selectedTask}
      />
    </div>
  );
};

export default EisenhowerMatrix;
