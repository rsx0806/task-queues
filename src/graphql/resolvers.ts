import { Resolvers } from './generated-types';
import { TaskService } from '../services/task.service';
import { TaskStatus, Task as ModelTask } from '../models/task.model';
import { RabbitMQService } from '../services/rabbitmq.service';
import { sanitizeTaskInput } from '../utils/sanitize';

function mapTaskToGql(task: ModelTask) {
  return {
    id: task._id || '',
    title: task.title,
    description: task.description ?? null,
    status: task.status,
    dueDate: task.dueDate,
  };
}

export function createResolvers(taskService: TaskService, rabbitMQService: RabbitMQService): Resolvers {
  return {
    Query: {
      getTask: async (_parent, { id }) => {
        const task = await taskService.getTaskById(id);
        return task ? mapTaskToGql(task) : null;
      },
      getTasks: async (_parent, { status }) => {
        const tasks = await taskService.getTasks(status as TaskStatus | undefined);
        return tasks.map(mapTaskToGql);
      },
    },
    Mutation: {
      createTask: async (_parent, { input }) => {
        const { title, description, dueDate, status } = input;
        const sanitized = sanitizeTaskInput({ title: title ?? undefined, description: description ?? undefined });
        const task = await taskService.createTask({ ...sanitized, dueDate, status: status as TaskStatus });
        await rabbitMQService.publishTaskEvent(task._id || '', 'created');
        return mapTaskToGql(task);
      },
      updateTask: async (_parent, { id, input }) => {
        const { title, description, status } = input;
        const sanitized = sanitizeTaskInput({ title: title ?? undefined, description: description ?? undefined });
        const task = await taskService.updateTask(id, {
          ...sanitized,
          status: status ? (status as TaskStatus) : undefined,
        });
        if (task) {
          await rabbitMQService.publishTaskEvent(task._id || '', 'updated');
        }
        return task ? mapTaskToGql(task) : null;
      },
    },
  };
} 