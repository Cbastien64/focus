
import React from 'react';
import { useTimerContext } from '@/context/TimerContext';
import { Play, Pause, RotateCcw, Save, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StopwatchDisplayProps {
  className?: string;
  compact?: boolean;
}

const StopwatchDisplay: React.FC<StopwatchDisplayProps> = ({ className, compact = false }) => {
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

  // Generate size based on compact prop
  const getCircleSize = () => compact ? 'w-36 h-36' : 'w-72 h-72';
  const getHeadingSize = () => compact ? 'text-lg' : 'text-2xl';
  const getTimeSize = () => compact ? 'text-xl' : 'text-3xl';
  const getButtonSize = () => compact ? 'h-7 w-7 min-w-7' : '';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <h2 className={`${getHeadingSize()} font-semibold mb-2 text-yellow-500`}>
        Chronomètre
      </h2>
      
      <div className={`mb-3 relative ${getCircleSize()}`}>
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
            className={`${getTimeSize()} font-bold text-yellow-500`}
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
            className={`bg-yellow-500 hover:bg-yellow-600 ${getButtonSize()}`}
            size={compact ? "sm" : "icon"}
            onClick={startStopwatch}
            title="Démarrer"
          >
            <Play className={compact ? "h-3 w-3" : "h-5 w-5"} />
          </Button>
        ) : (
          <Button 
            variant="outline"
            size={compact ? "sm" : "icon"}
            className={getButtonSize()}
            onClick={pauseStopwatch}
            title="Pause"
          >
            <Pause className={compact ? "h-3 w-3" : "h-5 w-5"} />
          </Button>
        )}
        
        <Button 
          variant="outline"
          size={compact ? "sm" : "icon"}
          className={getButtonSize()}
          onClick={resetStopwatch}
          title="Réinitialiser"
        >
          <RotateCcw className={compact ? "h-3 w-3" : "h-5 w-5"} />
        </Button>
        
        <Button 
          variant="outline"
          size={compact ? "sm" : "icon"}
          className={getButtonSize()}
          onClick={saveStopwatchTime}
          title="Enregistrer le temps"
          disabled={stopwatchTime === 0 || !timerState.currentTaskId}
        >
          <Save className={compact ? "h-3 w-3" : "h-5 w-5"} />
        </Button>
      </div>
      
      {compact && stopwatchTime > 0 && !timerState.currentTaskId && (
        <p className="text-xs text-muted-foreground mt-1 text-center">
          Sélectionnez une tâche
        </p>
      )}

      {!compact && stopwatchTime > 0 && !timerState.currentTaskId && (
        <p className="text-sm text-muted-foreground mt-2">
          Sélectionnez une tâche pour enregistrer ce temps
        </p>
      )}
    </div>
  );
};

export default StopwatchDisplay;
