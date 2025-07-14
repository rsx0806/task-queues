const amqp = require('amqplib');
import { RABBITMQ_URL } from '../config';
import { EXCHANGES, QUEUES, ROUTING_KEYS } from '../config/queues';
import type { Logger } from 'pino';

export type TaskAction = 'created' | 'updated';

export interface TaskEvent {
  taskId: string;
  action: TaskAction;
  timestamp: string;
}

export class RabbitMQService {
  private logger: Logger;
  private connection: any = null;
  private channel: any = null;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async connect() {
    if (this.connection && this.channel) return;
    const conn = await amqp.connect(RABBITMQ_URL);
    const ch = await conn.createChannel();
    await ch.assertExchange(EXCHANGES.TASK, 'direct', { durable: true });
    await ch.assertQueue(QUEUES.TASK_ACTIONS, { durable: true });
    await ch.bindQueue(QUEUES.TASK_ACTIONS, EXCHANGES.TASK, ROUTING_KEYS.TASK_ACTION);
    this.connection = conn;
    this.channel = ch;
  }

  async publishTaskEvent(taskId: string, action: TaskAction) {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    const event: TaskEvent = {
      taskId,
      action,
      timestamp: new Date().toISOString(),
    };
    const msg = Buffer.from(JSON.stringify(event));
    this.channel.publish(EXCHANGES.TASK, ROUTING_KEYS.TASK_ACTION, msg);
    this.logger.info({ event }, 'Published task event to RabbitMQ');
  }

  async consumeTaskEvents(onEvent: (event: TaskEvent) => void) {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    await this.channel.consume(QUEUES.TASK_ACTIONS, (msg: any) => {
      if (msg) {
        const event: TaskEvent = JSON.parse(msg.content.toString());
        onEvent(event);
        this.logger.info(`Task ${event.taskId} was ${event.action} at ${event.timestamp}`);
        this.channel.ack(msg);
      }
    });
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
} 