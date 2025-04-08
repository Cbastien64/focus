
import React from 'react';
import { useTimerContext } from '@/context/TimerContext';
import { Play, Pause, RotateCcw, Save, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StopwatchDisplayProps {
  className?: string;
}

const StopwatchDisplay: React.FC<StopwatchDisplayProps> = ({ className }) => {
  const { 
    stopwatchTime, 
    isStopwatchRunning, 
    startStopwatch, 
    pauseStopwatch, 
    resetStopwatch,
    saveStopwatchTime,
    timerState
  } = useTimerContext();
  
  // Format time as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const hoursStr = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '';
    return `${hoursStr}${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <h2 className="text-2xl font-semibold mb-2 text-yellow-500">
        Chronomètre
      </h2>
      
      <div className="mb-6 relative w-72 h-72">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            className="text-muted opacity-20"
            strokeWidth="2"
          />
          
          {/* Progress circle for stopwatch is always yellow */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            className="text-yellow-500"
            strokeWidth="2"
            strokeDasharray="283"
            strokeDashoffset="0"
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          
          {/* Time display */}
          <text
            x="50"
            y="55"
            textAnchor="middle"
            className="text-3xl font-bold text-yellow-500"
            fill="currentColor"
          >
            {formatTime(stopwatchTime)}
          </text>
        </svg>
      </div>
      
      <div className="flex space-x-2">
        {!isStopwatchRunning ? (
          <Button 
            variant="default"
            className="bg-yellow-500 hover:bg-yellow-600"
            size="icon"
            onClick={startStopwatch}
            title="Démarrer"
          >
            <Play className="h-5 w-5" />
          </Button>
        ) : (
          <Button 
            variant="outline"
            size="icon"
            onClick={pauseStopwatch}
            title="Pause"
          >
            <Pause className="h-5 w-5" />
          </Button>
        )}
        
        <Button 
          variant="outline"
          size="icon"
          onClick={resetStopwatch}
          title="Réinitialiser"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="outline"
          size="icon"
          onClick={saveStopwatchTime}
          title="Enregistrer le temps"
          disabled={stopwatchTime === 0 || !timerState.currentTaskId}
        >
          <Save className="h-5 w-5" />
        </Button>
      </div>
      
      {stopwatchTime > 0 && !timerState.currentTaskId && (
        <p className="text-sm text-muted-foreground mt-2">
          Sélectionnez une tâche pour enregistrer ce temps
        </p>
      )}
    </div>
  );
};

export default StopwatchDisplay;
