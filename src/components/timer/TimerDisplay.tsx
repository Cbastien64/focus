
import React from 'react';
import { useTimerContext } from '@/context/TimerContext';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimerDisplayProps {
  className?: string;
  compact?: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ className, compact = false }) => {
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

  // Generate size based on compact prop
  const getCircleSize = () => compact ? 'w-36 h-36' : 'w-72 h-72';
  const getHeadingSize = () => compact ? 'text-lg' : 'text-2xl';
  const getTimeSize = () => compact ? 'text-xl' : 'text-3xl';
  const getButtonSize = () => compact ? 'h-7 w-7 min-w-7' : '';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <h2 className={`${getHeadingSize()} font-semibold mb-2 ${getTimerColor()}`}>
        {getTimerTitle()}
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
            className={`${getTimeSize()} font-bold ${getTimerColor()}`}
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
            className={`bg-focus hover:bg-focus-dark ${getButtonSize()}`}
            size={compact ? "sm" : "icon"}
            onClick={startTimer}
            title="Démarrer"
          >
            <Play className={compact ? "h-3 w-3" : "h-5 w-5"} />
          </Button>
        ) : (
          <Button 
            variant="outline"
            size={compact ? "sm" : "icon"}
            className={getButtonSize()}
            onClick={pauseTimer}
            title="Pause"
          >
            <Pause className={compact ? "h-3 w-3" : "h-5 w-5"} />
          </Button>
        )}
        
        <Button 
          variant="outline"
          size={compact ? "sm" : "icon"}
          className={getButtonSize()}
          onClick={resetTimer}
          title="Réinitialiser"
        >
          <RotateCcw className={compact ? "h-3 w-3" : "h-5 w-5"} />
        </Button>
        
        <Button 
          variant="outline"
          size={compact ? "sm" : "icon"}
          className={getButtonSize()}
          onClick={skipTimer}
          title="Passer"
        >
          <SkipForward className={compact ? "h-3 w-3" : "h-5 w-5"} />
        </Button>
      </div>
    </div>
  );
};

export default TimerDisplay;
