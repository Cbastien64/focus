
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import TimerDisplay from '@/components/timer/TimerDisplay';
import TimerSettings from '@/components/timer/TimerSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaskContext } from '@/context/TaskContext';
import { useTimerContext } from '@/context/TimerContext';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Task } from '@/types';

const TimerPage = () => {
  const { tasks } = useTaskContext();
  const { timerState, setCurrentTask } = useTimerContext();
  const [showSettings, setShowSettings] = useState(false);
  
  const uncompletedTasks = tasks.filter((task) => task.status !== 'completed');
  const currentTask = tasks.find((task) => task.id === timerState.currentTaskId);
  
  const handleSelectTask = (task: Task) => {
    setCurrentTask(task.id);
  };
  
  const handleClearTask = () => {
    setCurrentTask(null);
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Timer Pomodoro</h1>
          <Button 
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            {showSettings ? 'Masquer les paramètres' : 'Afficher les paramètres'}
          </Button>
        </div>
        
        <div className="grid gap-6">
          {showSettings && (
            <TimerSettings />
          )}
          
          <div className="flex flex-col items-center justify-center py-8">
            <TimerDisplay className="mb-10" />
            
            {currentTask ? (
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="text-center text-lg">
                    Tâche en cours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold mb-2">{currentTask.title}</h3>
                    <p className="text-muted-foreground">{currentTask.description}</p>
                  </div>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={handleClearTask}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Effacer la sélection
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="text-center text-lg">
                    Sélectionner une tâche
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {uncompletedTasks.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {uncompletedTasks.map((task) => (
                        <Button
                          key={task.id}
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => handleSelectTask(task)}
                        >
                          <span>{task.title}</span>
                          <Check className="h-4 w-4 text-focus opacity-0 group-hover:opacity-100" />
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">Aucune tâche disponible</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TimerPage;
