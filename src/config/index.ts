import dotenv from 'dotenv';
dotenv.config();

export { EXCHANGES, QUEUES, ROUTING_KEYS } from './queues';
export const RABBITMQ_URL = process.env.RABBITMQ_URL;
export const MONGODB_URL = process.env.MONGODB_URL; 