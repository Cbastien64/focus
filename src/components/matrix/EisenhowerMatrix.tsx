
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

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Matrice d'Eisenhower</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MatrixQuadrant
          title="Urgent & Important"
          description="À faire en premier"
          priority="both"
          tasks={quadrantTasks.both}
          onAddTask={() => handleOpenForm('both')}
          onEditTask={handleEditTask}
        />
        
        <MatrixQuadrant
          title="Important, Non-urgent"
          description="À planifier"
          priority="important"
          tasks={quadrantTasks.important}
          onAddTask={() => handleOpenForm('important')}
          onEditTask={handleEditTask}
        />
        
        <MatrixQuadrant
          title="Urgent, Non-important"
          description="À déléguer"
          priority="urgent"
          tasks={quadrantTasks.urgent}
          onAddTask={() => handleOpenForm('urgent')}
          onEditTask={handleEditTask}
        />
        
        <MatrixQuadrant
          title="Non-urgent, Non-important"
          description="À éliminer ou reporter"
          priority="neither"
          tasks={quadrantTasks.neither}
          onAddTask={() => handleOpenForm('neither')}
          onEditTask={handleEditTask}
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
