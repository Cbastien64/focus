
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { TaskProvider } from '@/context/TaskContext';
import { TimerProvider } from '@/context/TimerContext';
import Index from '@/pages/Index';
import TasksPage from '@/pages/TasksPage';
import TimerPage from '@/pages/TimerPage';
import MatrixPage from '@/pages/MatrixPage';
import NotFound from '@/pages/NotFound';
import ProjectsPage from '@/pages/ProjectsPage';
import DataPage from '@/pages/DataPage';

function App() {
  return (
    <TaskProvider>
      <TimerProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/timer" element={<TimerPage />} />
            <Route path="/matrix" element={<MatrixPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/tags" element={<ProjectsPage />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </TimerProvider>
    </TaskProvider>
  );
}

export default App;
