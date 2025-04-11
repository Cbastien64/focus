import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckSquare, Menu, Timer, Hourglass, Calendar, LayoutGrid, Folder, BarChart, Users, Home, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTaskContext } from '@/context/TaskContext';
import { useTimerContext } from '@/context/TimerContext';
import TaskCard from '@/components/tasks/TaskCard';
import TimerDisplay from '@/components/timer/TimerDisplay';
import StopwatchDisplay from '@/components/timer/StopwatchDisplay';
import WeeklyTaskView from '@/components/tasks/WeeklyTaskView';
import { Task } from '@/types';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import TaskForm from '@/components/tasks/TaskForm';
import { ScrollArea } from '@/components/ui/scroll-area';

const Index = () => {
  const { tasks, updateTask } = useTaskContext();
  const { timerState } = useTimerContext();
  const navigate = useNavigate();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTasks = tasks.filter((task) => {
    const taskDate = new Date(task.createdAt);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime() && task.status !== 'completed';
  }).sort((a, b) => (a.order || 0) - (b.order || 0));
  
  const priorityTasks = tasks.filter(
    (task) => task.priority === 'both' && task.status !== 'completed'
  ).slice(0, 3);

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const urgentTasks = tasks.filter((t) => t.priority === 'both' || t.priority === 'urgent');

  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [showWeeklyTasks, setShowWeeklyTasks] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  const getPriorityBgColor = (priority: string): string => {
    switch (priority) {
      case 'both':
        return 'bg-eisenhower-both/20 border-eisenhower-both';
      case 'urgent':
        return 'bg-eisenhower-urgent/20 border-eisenhower-urgent';
      case 'important':
        return 'bg-eisenhower-important/20 border-eisenhower-important';
      case 'neither':
        return 'bg-eisenhower-neither/20 border-eisenhower-neither';
      default:
        return 'bg-muted/50';
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    const sourceTaskId = e.dataTransfer.getData('taskId');
    
    if (sourceTaskId && sourceTaskId !== targetTaskId) {
      const sourceTask = todayTasks.find(task => task.id === sourceTaskId);
      const targetTask = todayTasks.find(task => task.id === targetTaskId);
      
      if (sourceTask && targetTask) {
        const updatedTasks = todayTasks.map(task => ({...task}));
        
        const sourceIndex = updatedTasks.findIndex(task => task.id === sourceTaskId);
        const targetIndex = updatedTasks.findIndex(task => task.id === targetTaskId);
        
        const [removed] = updatedTasks.splice(sourceIndex, 1);
        updatedTasks.splice(targetIndex, 0, removed);
        
        updatedTasks.forEach((task, index) => {
          updateTask(task.id, { order: index });
        });
        
        toast.success("Ordre des tâches mis à jour");
      }
    }
    
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const startTimer = () => {
    // Implement timer start logic
  };

  const startStopwatch = () => {
    // Implement stopwatch start logic
  };

  const navigateToTasksWithFilter = (filter: 'all' | 'todo' | 'urgent') => {
    navigate('/tasks', { state: { filter } });
  };

  const toggleWeeklyTasks = () => {
    setShowWeeklyTasks(!showWeeklyTasks);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <div className="flex items-center gap-2">
            <Link to="/tasks">
              <Button className="gap-1 bg-focus hover:bg-focus-dark">
                <CheckSquare className="h-4 w-4" />
                <span>Toutes les tâches</span>
              </Button>
            </Link>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <Menu className="h-4 w-4" />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-2 p-4 w-60 max-h-[80vh] overflow-y-auto">
                      <Link to="/" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                        <Home className="h-4 w-4 text-focus" />
                        <span>Accueil</span>
                      </Link>
                      <Link to="/tasks" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                        <CheckSquare className="h-4 w-4 text-focus" />
                        <span>Tâches</span>
                      </Link>
                      <Link to="/timer" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                        <Hourglass className="h-4 w-4 text-focus" />
                        <span>Timer Pomodoro</span>
                      </Link>
                      <Link to="/matrix" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                        <LayoutGrid className="h-4 w-4 text-focus" />
                        <span>Matrice d'Eisenhower</span>
                      </Link>
                      <Link to="/calendar" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                        <Calendar className="h-4 w-4 text-focus" />
                        <span>Agenda</span>
                      </Link>
                      <Link to="/projects" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                        <Folder className="h-4 w-4 text-focus" />
                        <span>Projets</span>
                      </Link>
                      <Link to="/collaborators" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                        <Users className="h-4 w-4 text-focus" />
                        <span>Collaborateurs</span>
                      </Link>
                      <Link to="/data" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                        <BarChart className="h-4 w-4 text-focus" />
                        <span>Données</span>
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigateToTasksWithFilter('all')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tâches totales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tasks.length}</div>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigateToTasksWithFilter('todo')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">À faire</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {todoTasks.length}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigateToTasksWithFilter('urgent')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {urgentTasks.length}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tâches du jour</CardTitle>
                    <CardDescription className="mt-2">
                      Tâches créées aujourd'hui (glissez-déposez pour réorganiser)
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleWeeklyTasks}
                    className="gap-1"
                  >
                    <Calendar className="h-4 w-4" />
                    {showWeeklyTasks ? 'Masquer la semaine' : 'Voir la semaine'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showWeeklyTasks ? (
                  <WeeklyTaskView onEditTask={handleEditTask} />
                ) : (
                  <>
                    {todayTasks.length > 0 ? (
                      <div className="space-y-4">
                        {todayTasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className={`p-3 rounded-md flex items-center justify-between cursor-pointer ${
                              getPriorityBgColor(task.priority)
                            } ${
                              draggedTask === task.id ? 'opacity-50 border-2 border-dashed border-focus' : 'border'
                            }`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, task.id)}
                            onDragEnd={handleDragEnd}
                            onClick={() => handleEditTask(task)}
                          >
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <h4 className="font-medium">{task.title}</h4>
                                {task.estimatedTime && (
                                  <div className="flex items-center text-xs text-muted-foreground ml-2">
                                    <Clock className="h-3 w-3 mr-1 text-focus" />
                                    <span>{task.estimatedTime} min</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                              {task.dueDate && (
                                <div className="flex items-center gap-2 mt-1 text-xs">
                                  <Calendar className="h-3 w-3 text-focus" />
                                  <span>Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 ml-2">
                              <Link to="/timer">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentTask(task.id);
                                    startStopwatch();
                                  }}
                                >
                                  <Timer className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link to="/timer">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentTask(task.id);
                                    startTimer();
                                  }}
                                >
                                  <Hourglass className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                        
                        {todayTasks.length > 3 && (
                          <Link to="/tasks" className="block text-sm text-focus hover:underline text-center mt-4">
                            Voir {todayTasks.length - 3} autres tâches
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Aucune tâche créée aujourd'hui</p>
                        <Link to="/tasks" className="mt-2 inline-block">
                          <Button variant="outline" size="sm">
                            Créer une tâche
                          </Button>
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tâches prioritaires</CardTitle>
                <CardDescription>
                  Tâches urgentes et importantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {priorityTasks.length > 0 ? (
                  <div className="space-y-4">
                    {priorityTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onEdit={() => {}} />
                    ))}
                    
                    {tasks.filter((t) => t.priority === 'both' && t.status !== 'completed').length > 3 && (
                      <Link to="/matrix" className="block text-sm text-focus hover:underline text-center mt-4">
                        Voir toutes les tâches prioritaires
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucune tâche prioritaire</p>
                    <Link to="/matrix" className="mt-2 inline-block">
                      <Button variant="outline" size="sm">
                        Voir la matrice d'Eisenhower
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Gestion du temps</CardTitle>
                <CardDescription>
                  Pomodoro & Chronomètre
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <Tabs defaultValue="timer" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="timer">
                      <Hourglass className="h-4 w-4 mr-2" />
                      Timer
                    </TabsTrigger>
                    <TabsTrigger value="stopwatch">
                      <Timer className="h-4 w-4 mr-2" />
                      Chrono
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="timer" className="flex justify-center py-4">
                    <TimerDisplay />
                  </TabsContent>
                  <TabsContent value="stopwatch" className="flex justify-center py-4">
                    <StopwatchDisplay />
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="bg-muted/50 justify-center">
                <Link to="/timer">
                  <Button variant="outline" size="sm">
                    Voir en plein écran
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <TaskForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        task={selectedTask}
      />
    </MainLayout>
  );
};

export default Index;
