
import React, { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import MatrixQuadrant from './MatrixQuadrant';
import TaskForm from '../tasks/TaskForm';
import { Task, TaskPriority } from '@/types';

const EisenhowerMatrix: React.FC = () => {
  const { tasks, addTask } = useTaskContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  const quadrantTasks = {
    both: tasks.filter((task) => task.priority === 'both' && task.status !== 'completed'),
    urgent: tasks.filter((task) => task.priority === 'urgent' && task.status !== 'completed'),
    important: tasks.filter((task) => task.priority === 'important' && task.status !== 'completed'),
    neither: tasks.filter((task) => task.priority === 'neither' && task.status !== 'completed'),
  };

  const handleOpenForm = (priority: TaskPriority) => {
    setSelectedTask(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Matrice d'Eisenhower</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MatrixQuadrant
          title="Urgent & Important"
          description="À faire en premier"
          tasks={quadrantTasks.both}
          onAddTask={() => handleOpenForm('both')}
        />
        
        <MatrixQuadrant
          title="Important, Non-urgent"
          description="À planifier"
          tasks={quadrantTasks.important}
          onAddTask={() => handleOpenForm('important')}
        />
        
        <MatrixQuadrant
          title="Urgent, Non-important"
          description="À déléguer"
          tasks={quadrantTasks.urgent}
          onAddTask={() => handleOpenForm('urgent')}
        />
        
        <MatrixQuadrant
          title="Non-urgent, Non-important"
          description="À éliminer ou reporter"
          tasks={quadrantTasks.neither}
          onAddTask={() => handleOpenForm('neither')}
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
