
import React, { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import MatrixQuadrant from './MatrixQuadrant';
import TaskForm from '../tasks/TaskForm';
import { Task, TaskPriority } from '@/types';
import { v4 as uuidv4 } from 'uuid';

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

  const handleDragOver = (e: React.DragEvent, priority: TaskPriority) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, priority: TaskPriority) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const task = tasks.find((t) => t.id === taskId);
    
    if (task && task.priority !== priority) {
      addTask({
        id: uuidv4(),
        title: 'New Task',
        description: 'Dropped task',
        priority,
        status: 'todo',
        tags: [],
        hashtags: [],
        assignedTo: null,
        timeSpent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Matrice d'Eisenhower</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MatrixQuadrant
          title="Urgent & Important"
          subtitle="À faire en premier"
          tasks={quadrantTasks.both}
          color="bg-red-500"
          onCreateTask={() => handleOpenForm('both')}
          onDragOver={(e) => handleDragOver(e, 'both')}
          onDrop={(e) => handleDrop(e, 'both')}
        />
        
        <MatrixQuadrant
          title="Important, Non-urgent"
          subtitle="À planifier"
          tasks={quadrantTasks.important}
          color="bg-blue-500"
          onCreateTask={() => handleOpenForm('important')}
          onDragOver={(e) => handleDragOver(e, 'important')}
          onDrop={(e) => handleDrop(e, 'important')}
        />
        
        <MatrixQuadrant
          title="Urgent, Non-important"
          subtitle="À déléguer"
          tasks={quadrantTasks.urgent}
          color="bg-yellow-500"
          onCreateTask={() => handleOpenForm('urgent')}
          onDragOver={(e) => handleDragOver(e, 'urgent')}
          onDrop={(e) => handleDrop(e, 'urgent')}
        />
        
        <MatrixQuadrant
          title="Non-urgent, Non-important"
          subtitle="À éliminer ou reporter"
          tasks={quadrantTasks.neither}
          color="bg-gray-500"
          onCreateTask={() => handleOpenForm('neither')}
          onDragOver={(e) => handleDragOver(e, 'neither')}
          onDrop={(e) => handleDrop(e, 'neither')}
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
