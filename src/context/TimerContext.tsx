
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { TimerSettings, TimerState, TimerType } from '@/types';
import { useTaskContext } from './TaskContext';
import { toast } from '@/components/ui/sonner';

interface TimerContextProps {
  settings: TimerSettings;
  timerState: TimerState;
  updateSettings: (newSettings: Partial<TimerSettings>) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  setCurrentTask: (taskId: string | null) => void;
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

  // Effect to handle the timer countdown
  useEffect(() => {
    if (timerState.isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimerState((prev) => {
          const newTimeRemaining = prev.timeRemaining - 1;
          
          // If the timer reaches zero
          if (newTimeRemaining <= 0) {
            clearInterval(intervalRef.current!);
            
            // Play notification sound
            const audio = new Audio('/notification.mp3');
            audio.play().catch(error => console.error('Error playing notification sound:', error));
            
            // If a task is associated with the timer and it's a focus session
            if (prev.currentTaskId && prev.type === 'focus') {
              incrementTaskTime(prev.currentTaskId, settings.focusDuration * 60);
            }
            
            // Determine next timer type
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
            
            // Set duration based on next timer type
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
    
    // Cleanup interval when timer is paused or component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning, settings, incrementTaskTime]);

  // Effect to update time remaining when settings change
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
      
      // Only update if the timer is not running to avoid disruption
      setTimerState((prev) => ({
        ...prev,
        timeRemaining: newTimeRemaining,
      }));
      
      // Update CSS variable for animation
      document.documentElement.style.setProperty('--timer-duration', `${newTimeRemaining}s`);
    }
  }, [settings, timerState.type, timerState.isRunning]);

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
    // If a task is associated with the timer and it's a focus session,
    // increment the time spent by the current elapsed time
    if (timerState.currentTaskId && timerState.type === 'focus') {
      const totalSessionTime = settings.focusDuration * 60;
      const elapsedTime = totalSessionTime - timerState.timeRemaining;
      
      if (elapsedTime > 0) {
        incrementTaskTime(timerState.currentTaskId, elapsedTime);
      }
    }
    
    // Determine next timer type
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
    
    // Set duration based on next timer type
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
