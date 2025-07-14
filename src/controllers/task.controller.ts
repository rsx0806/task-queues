import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TaskService } from '../services/task.service';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema';
import { TaskStatus } from '../models/task.model';
import { RabbitMQService } from '../services/rabbitmq.service';
import { sanitizeTaskInput } from '../utils/sanitize';

function mapTaskToApi(task: any) {
  const { _id, ...rest } = task;
  return { ...rest, id: _id?.toString?.() ?? '' };
}

export async function taskController(fastify: FastifyInstance, taskService: TaskService, rabbitMQService: RabbitMQService) {
  fastify.get('/tasks/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const task = await taskService.getTaskById(request.params.id);
    if (!task) return reply.code(404).send({ message: 'Task not found' });
    return mapTaskToApi(task);
  });

  fastify.get('/tasks', async (request: FastifyRequest<{ Querystring: { status?: TaskStatus } }>, reply: FastifyReply) => {
    const { status } = request.query;
    const tasks = await taskService.getTasks(status);
    return tasks.map(mapTaskToApi);
  });

  fastify.post('/tasks', {
    schema: { body: createTaskSchema },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = sanitizeTaskInput(request.body as any);
    const task = await taskService.createTask(body);
    await rabbitMQService.publishTaskEvent((task._id || '').toString(), 'created');
    reply.code(201).send(mapTaskToApi(task));
  });

  fastify.patch('/tasks/:id', {
    schema: { body: updateTaskSchema },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = sanitizeTaskInput(request.body as any);
    const task = await taskService.updateTask((request.params as any).id, body);
    if (!task) return reply.code(404).send({ message: 'Task not found' });
    await rabbitMQService.publishTaskEvent((task._id || '').toString(), 'updated');
    return mapTaskToApi(task);
  });
} 