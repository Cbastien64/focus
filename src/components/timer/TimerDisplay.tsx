
import React from 'react';
import { useTimerContext } from '@/context/TimerContext';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimerDisplayProps {
  className?: string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ className }) => {
  const { timerState, startTimer, pauseTimer, resetTimer, skipTimer } = useTimerContext();
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Get timer color based on type
  const getTimerColor = (): string => {
    switch (timerState.type) {
      case 'focus':
        return 'text-focus';
      case 'shortBreak':
        return 'text-green-500';
      case 'longBreak':
        return 'text-blue-500';
      default:
        return 'text-focus';
    }
  };
  
  // Get timer title based on type
  const getTimerTitle = (): string => {
    switch (timerState.type) {
      case 'focus':
        return 'Focus';
      case 'shortBreak':
        return 'Pause courte';
      case 'longBreak':
        return 'Pause longue';
      default:
        return 'Focus';
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <h2 className={`text-2xl font-semibold mb-2 ${getTimerColor()}`}>
        {getTimerTitle()}
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
          
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            className={getTimerColor()}
            strokeWidth="2"
            strokeDasharray="283"
            strokeDashoffset="0"
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={timerState.isRunning ? {
              animation: 'timer-progress var(--timer-duration) linear forwards',
              animationPlayState: 'running',
            } : {
              strokeDashoffset: `${283 * (1 - timerState.timeRemaining / (timerState.type === 'focus' ? (25 * 60) : timerState.type === 'shortBreak' ? (5 * 60) : (15 * 60)))}`,
              animationPlayState: 'paused',
            }}
          />
          
          {/* Time display */}
          <text
            x="50"
            y="55"
            textAnchor="middle"
            className={`text-3xl font-bold ${getTimerColor()}`}
            fill="currentColor"
          >
            {formatTime(timerState.timeRemaining)}
          </text>
        </svg>
      </div>
      
      <div className="flex space-x-2">
        {!timerState.isRunning ? (
          <Button 
            variant="default"
            className="bg-focus hover:bg-focus-dark"
            size="icon"
            onClick={startTimer}
            title="Démarrer"
          >
            <Play className="h-5 w-5" />
          </Button>
        ) : (
          <Button 
            variant="outline"
            size="icon"
            onClick={pauseTimer}
            title="Pause"
          >
            <Pause className="h-5 w-5" />
          </Button>
        )}
        
        <Button 
          variant="outline"
          size="icon"
          onClick={resetTimer}
          title="Réinitialiser"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="outline"
          size="icon"
          onClick={skipTimer}
          title="Passer"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default TimerDisplay;
