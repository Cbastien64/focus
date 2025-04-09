
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import TaskGrid from '@/components/tasks/TaskGrid';
import { useLocation } from 'react-router-dom';
import { Task } from '@/types';
import { useTaskContext } from '@/context/TaskContext';

interface TaskGridProps {
  tasks: Task[];
}

const TasksPage = () => {
  const location = useLocation();
  const { tasks } = useTaskContext();
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'todo' | 'urgent'>('all');
  
  useEffect(() => {
    // Check if we have a filter in the location state
    if (location.state && location.state.filter) {
      const filter = location.state.filter;
      setActiveFilter(filter);
      
      // Filter tasks based on the provided filter
      switch(filter) {
        case 'todo':
          setFilteredTasks(tasks.filter(task => task.status === 'todo'));
          break;
        case 'urgent':
          setFilteredTasks(tasks.filter(task => 
            task.priority === 'both' || task.priority === 'urgent'));
          break;
        case 'all':
        default:
          setFilteredTasks(tasks);
          break;
      }
    } else {
      setFilteredTasks(tasks);
    }
  }, [location.state, tasks]);

  return (
    <MainLayout>
      {activeFilter !== 'all' && (
        <div className="mb-4 p-3 bg-muted rounded-md">
          <p className="font-medium">
            {activeFilter === 'todo' ? 'Affichage des tâches à faire' : 
             activeFilter === 'urgent' ? 'Affichage des tâches urgentes' : 
             'Toutes les tâches'}
          </p>
        </div>
      )}
      <TaskGrid tasks={filteredTasks} />
    </MainLayout>
  );
};

export default TasksPage;
