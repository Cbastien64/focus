
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

  const handleDragOver = (e: React.DragEvent, priority: TaskPriority) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, priority: TaskPriority) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const task = tasks.find((t) => t.id === taskId);
    
    if (task && task.priority !== priority) {
      // Create a new task with the new priority
      addTask({
        title: 'New Task',
        description: 'Dropped task',
        priority,
        status: 'todo',
        tags: [],
        hashtags: [],
        assignedTo: null,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Matrice d'Eisenhower</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MatrixQuadrant
          title="Urgent & Important"
          description="À faire en premier"
          tasks={quadrantTasks.both}
          onOpenTaskForm={() => handleOpenForm('both')}
          onDragOver={(e) => handleDragOver(e, 'both')}
          onDrop={(e) => handleDrop(e, 'both')}
          colorClass="bg-red-500"
        />
        
        <MatrixQuadrant
          title="Important, Non-urgent"
          description="À planifier"
          tasks={quadrantTasks.important}
          onOpenTaskForm={() => handleOpenForm('important')}
          onDragOver={(e) => handleDragOver(e, 'important')}
          onDrop={(e) => handleDrop(e, 'important')}
          colorClass="bg-blue-500"
        />
        
        <MatrixQuadrant
          title="Urgent, Non-important"
          description="À déléguer"
          tasks={quadrantTasks.urgent}
          onOpenTaskForm={() => handleOpenForm('urgent')}
          onDragOver={(e) => handleDragOver(e, 'urgent')}
          onDrop={(e) => handleDrop(e, 'urgent')}
          colorClass="bg-yellow-500"
        />
        
        <MatrixQuadrant
          title="Non-urgent, Non-important"
          description="À éliminer ou reporter"
          tasks={quadrantTasks.neither}
          onOpenTaskForm={() => handleOpenForm('neither')}
          onDragOver={(e) => handleDragOver(e, 'neither')}
          onDrop={(e) => handleDrop(e, 'neither')}
          colorClass="bg-gray-500"
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
