
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckSquare, Menu, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTaskContext } from '@/context/TaskContext';
import { useTimerContext } from '@/context/TimerContext';
import TaskCard from '@/components/tasks/TaskCard';
import TimerDisplay from '@/components/timer/TimerDisplay';
import StopwatchDisplay from '@/components/timer/StopwatchDisplay';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { tasks } = useTaskContext();
  const { timerState } = useTimerContext();
  
  // Get today's tasks (tasks added today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTasks = tasks.filter((task) => {
    const taskDate = new Date(task.createdAt);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime() && task.status !== 'completed';
  });
  
  // Get priority tasks (urgent & important)
  const priorityTasks = tasks.filter(
    (task) => task.priority === 'both' && task.status !== 'completed'
  ).slice(0, 3);

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
                    <div className="grid gap-2 p-4 w-60">
                      <Link to="/" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                        <span>Accueil</span>
                      </Link>
                      <Link to="/tasks" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                        <CheckSquare className="h-4 w-4 text-focus" />
                        <span>Tâches</span>
                      </Link>
                      <Link to="/timer" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                        <Clock className="h-4 w-4 text-focus" />
                        <span>Timer Pomodoro</span>
                      </Link>
                      <Link to="/matrix" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                        <span>Matrice d'Eisenhower</span>
                      </Link>
                      <Link to="/calendar" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                        <span>Agenda</span>
                      </Link>
                      <Link to="/projects" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                        <span>Projets</span>
                      </Link>
                      <Link to="/collaborators" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                        <span>Collaborateurs</span>
                      </Link>
                      <Link to="/data" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
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
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tâches totales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tasks.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">À faire</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tasks.filter((t) => t.status === 'todo').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tasks.filter((t) => t.priority === 'both' || t.priority === 'urgent').length}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Tâches du jour</CardTitle>
                <CardDescription>
                  Tâches créées aujourd'hui
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayTasks.length > 0 ? (
                  <div className="space-y-4">
                    {todayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="p-3 bg-muted/50 rounded-md flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                        <Link to="/timer">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                          >
                            <Clock className="h-4 w-4" />
                            <span>Focus</span>
                          </Button>
                        </Link>
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
                      <Clock className="h-4 w-4 mr-2" />
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
    </MainLayout>
  );
};

export default Index;
