export enum TaskStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
}

export interface Task {
  _id?: string; // MongoDB ObjectId as string
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate: string; // ISO date string
} 