
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { TimerSettings, TimerState, TimerType } from '@/types';
import { useTaskContext } from './TaskContext';
import { toast } from 'sonner';

interface TimerContextProps {
  settings: TimerSettings;
  timerState: TimerState;
  updateSettings: (newSettings: Partial<TimerSettings>) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  setCurrentTask: (taskId: string | null) => void;
  // New stopwatch functionality
  stopwatchTime: number;
  isStopwatchRunning: boolean;
  startStopwatch: () => void;
  pauseStopwatch: () => void;
  resetStopwatch: () => void;
  saveStopwatchTime: () => void;
}

const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

const DEFAULT_TIMER_STATE: TimerState = {
  type: 'focus',
  timeRemaining: DEFAULT_SETTINGS.focusDuration * 60,
  isRunning: false,
  currentTaskId: null,
  completedSessions: 0,
};

const TimerContext = createContext<TimerContextProps | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [timerState, setTimerState] = useState<TimerState>(DEFAULT_TIMER_STATE);
  const intervalRef = useRef<number | null>(null);
  const { incrementTaskTime } = useTaskContext();
  
  // New state for stopwatch
  const [stopwatchTime, setStopwatchTime] = useState<number>(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);
  const stopwatchIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerState.isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimerState((prev) => {
          const newTimeRemaining = prev.timeRemaining - 1;
          
          if (newTimeRemaining <= 0) {
            clearInterval(intervalRef.current!);
            const audio = new Audio('/notification.mp3');
            audio.play().catch(error => console.error('Error playing notification sound:', error));
            
            if (prev.currentTaskId && prev.type === 'focus') {
              incrementTaskTime(prev.currentTaskId, settings.focusDuration * 60);
            }
            
            let nextType: TimerType = 'shortBreak';
            let completedSessions = prev.completedSessions;
            
            if (prev.type === 'focus') {
              completedSessions += 1;
              
              if (completedSessions % settings.longBreakInterval === 0) {
                nextType = 'longBreak';
                toast.success("Bravo! C'est l'heure d'une pause longue.");
              } else {
                toast.success("Séance terminée! C'est l'heure d'une courte pause.");
              }
            } else {
              nextType = 'focus';
              if (prev.type === 'shortBreak') {
                toast.success("Pause terminée! Reprenons le travail.");
              } else {
                toast.success("Longue pause terminée! C'est reparti!");
              }
            }
            
            let nextDuration = 0;
            switch (nextType) {
              case 'focus':
                nextDuration = settings.focusDuration * 60;
                break;
              case 'shortBreak':
                nextDuration = settings.shortBreakDuration * 60;
                break;
              case 'longBreak':
                nextDuration = settings.longBreakDuration * 60;
                break;
            }
            
            return {
              ...prev,
              type: nextType,
              timeRemaining: nextDuration,
              isRunning: false,
              completedSessions,
            };
          }
          
          return { ...prev, timeRemaining: newTimeRemaining };
        });
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning, settings, incrementTaskTime]);

  useEffect(() => {
    if (!timerState.isRunning) {
      let newTimeRemaining = 0;
      
      switch (timerState.type) {
        case 'focus':
          newTimeRemaining = settings.focusDuration * 60;
          break;
        case 'shortBreak':
          newTimeRemaining = settings.shortBreakDuration * 60;
          break;
        case 'longBreak':
          newTimeRemaining = settings.longBreakDuration * 60;
          break;
      }
      
      setTimerState((prev) => ({
        ...prev,
        timeRemaining: newTimeRemaining,
      }));
      
      document.documentElement.style.setProperty('--timer-duration', `${newTimeRemaining}s`);
    }
  }, [settings, timerState.type, timerState.isRunning]);

  // Stopwatch effect
  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchIntervalRef.current = window.setInterval(() => {
        setStopwatchTime((prev) => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
    };
  }, [isStopwatchRunning]);

  const updateSettings = (newSettings: Partial<TimerSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const startTimer = () => {
    setTimerState((prev) => ({ ...prev, isRunning: true }));
  };

  const pauseTimer = () => {
    setTimerState((prev) => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    let newTimeRemaining = 0;
    
    switch (timerState.type) {
      case 'focus':
        newTimeRemaining = settings.focusDuration * 60;
        break;
      case 'shortBreak':
        newTimeRemaining = settings.shortBreakDuration * 60;
        break;
      case 'longBreak':
        newTimeRemaining = settings.longBreakDuration * 60;
        break;
    }
    
    setTimerState((prev) => ({
      ...prev,
      timeRemaining: newTimeRemaining,
      isRunning: false,
    }));
  };

  const skipTimer = () => {
    if (timerState.currentTaskId && timerState.type === 'focus') {
      const totalSessionTime = settings.focusDuration * 60;
      const elapsedTime = totalSessionTime - timerState.timeRemaining;
      
      if (elapsedTime > 0) {
        incrementTaskTime(timerState.currentTaskId, elapsedTime);
      }
    }
    
    let nextType: TimerType = 'shortBreak';
    let completedSessions = timerState.completedSessions;
    
    if (timerState.type === 'focus') {
      completedSessions += 1;
      
      if (completedSessions % settings.longBreakInterval === 0) {
        nextType = 'longBreak';
      } else {
        nextType = 'shortBreak';
      }
    } else {
      nextType = 'focus';
    }
    
    let nextDuration = 0;
    switch (nextType) {
      case 'focus':
        nextDuration = settings.focusDuration * 60;
        break;
      case 'shortBreak':
        nextDuration = settings.shortBreakDuration * 60;
        break;
      case 'longBreak':
        nextDuration = settings.longBreakDuration * 60;
        break;
    }
    
    setTimerState({
      type: nextType,
      timeRemaining: nextDuration,
      isRunning: false,
      currentTaskId: timerState.currentTaskId,
      completedSessions,
    });
    
    toast.info("Timer passé");
  };

  const setCurrentTask = (taskId: string | null) => {
    setTimerState((prev) => ({ ...prev, currentTaskId: taskId }));
  };

  // Stopwatch functions
  const startStopwatch = () => {
    setIsStopwatchRunning(true);
    // Stop the pomodoro timer if it's running
    if (timerState.isRunning) {
      pauseTimer();
    }
  };

  const pauseStopwatch = () => {
    setIsStopwatchRunning(false);
  };

  const resetStopwatch = () => {
    pauseStopwatch();
    setStopwatchTime(0);
  };

  const saveStopwatchTime = () => {
    if (timerState.currentTaskId && stopwatchTime > 0) {
      incrementTaskTime(timerState.currentTaskId, stopwatchTime);
      toast.success("Temps enregistré pour la tâche sélectionnée");
      resetStopwatch();
    } else if (!timerState.currentTaskId && stopwatchTime > 0) {
      toast.error("Aucune tâche sélectionnée");
    }
  };

  return (
    <TimerContext.Provider
      value={{
        settings,
        timerState,
        updateSettings,
        startTimer,
        pauseTimer,
        resetTimer,
        skipTimer,
        setCurrentTask,
        // Stopwatch values
        stopwatchTime,
        isStopwatchRunning,
        startStopwatch,
        pauseStopwatch,
        resetStopwatch,
        saveStopwatchTime,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimerContext = () => {
  const context = useContext(TimerContext);
  
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  
  return context;
};
