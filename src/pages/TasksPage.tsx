
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import TaskGrid from '@/components/tasks/TaskGrid';

const TasksPage = () => {
  return (
    <MainLayout>
      <TaskGrid />
    </MainLayout>
  );
};

export default TasksPage;
