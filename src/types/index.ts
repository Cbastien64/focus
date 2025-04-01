
export type TaskPriority = 'both' | 'urgent' | 'important' | 'neither';

export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  tags: Tag[];
  timeSpent: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}

export interface TimerSettings {
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // after how many focus sessions
}

export type TimerType = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerState {
  type: TimerType;
  timeRemaining: number; // in seconds
  isRunning: boolean;
  currentTaskId: string | null;
  completedSessions: number;
}
