
export type TaskPriority = 'both' | 'urgent' | 'important' | 'neither';

export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Collaborator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  tags: Tag[];
  hashtags: string[];
  assignedTo: Collaborator | null;
  timeSpent: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date | null; // Added due date
  order?: number; // Added order for sorting
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
