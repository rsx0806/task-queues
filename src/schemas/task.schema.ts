import { TaskStatus } from '../models/task.model';

export const taskStatusEnum = [
  TaskStatus.OPEN,
  TaskStatus.IN_PROGRESS,
  TaskStatus.COMPLETED,
  TaskStatus.OVERDUE,
];

export const createTaskSchema = {
  type: 'object',
  required: ['title', 'dueDate', 'status'],
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', maxLength: 500 },
    dueDate: { type: 'string', format: 'date-time' },
    status: { type: 'string', enum: taskStatusEnum },
  },
  additionalProperties: false,
};

export const updateTaskSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', maxLength: 500 },
    status: { type: 'string', enum: taskStatusEnum },
  },
  additionalProperties: false,
}; 