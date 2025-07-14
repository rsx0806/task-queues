import { FastifyInstance } from 'fastify';
import { taskController } from '../controllers/task.controller';
import { TaskService } from '../services/task.service';
import { RabbitMQService } from '../services/rabbitmq.service';

export async function registerTaskRoutes(fastify: FastifyInstance, taskService: TaskService, rabbitMQService: RabbitMQService) {
  await taskController(fastify, taskService, rabbitMQService);
} 