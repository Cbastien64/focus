
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TaskProvider } from "./context/TaskContext";
import { TimerProvider } from "./context/TimerContext";
import Index from "./pages/Index";
import TasksPage from "./pages/TasksPage";
import TimerPage from "./pages/TimerPage";
import MatrixPage from "./pages/MatrixPage";
import TagsPage from "./pages/TagsPage";
import DataPage from "./pages/DataPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TaskProvider>
        <TimerProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/timer" element={<TimerPage />} />
              <Route path="/matrix" element={<MatrixPage />} />
              <Route path="/tags" element={<TagsPage />} />
              <Route path="/data" element={<DataPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TimerProvider>
      </TaskProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
