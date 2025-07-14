import Fastify from 'fastify';
import pino from 'pino';
import { loggerConfig } from './config/logger';
import { connectToMongo, getMongoClient } from './services/mongodb.service';
import { TaskService } from './services/task.service';
import { registerTaskRoutes } from './routes/task.routes';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import { createResolvers } from './graphql/resolvers';
import { Resolvers } from './graphql/generated-types';
import { RabbitMQService } from './services/rabbitmq.service';
import { constraintDirective, constraintDirectiveTypeDefs } from 'graphql-constraint-directive';
import { makeExecutableSchema } from '@graphql-tools/schema';

const logger = pino(loggerConfig);

const fastify = Fastify({
  logger: loggerConfig,
});

fastify.get('/health', async (request, reply) => {
  return { status: 'ok' };
});

let rabbitMQService: RabbitMQService | undefined;

const start = async () => {
  try {
    const db = await connectToMongo();
    fastify.log.info('Connected to MongoDB');
    const taskService = new TaskService(db);
    rabbitMQService = new RabbitMQService(logger);
    await rabbitMQService.connect();
    fastify.log.info('Connected to RabbitMQ');
    
    await rabbitMQService.consumeTaskEvents(() => {});
    await registerTaskRoutes(fastify, taskService, rabbitMQService);

    const typeDefs = [constraintDirectiveTypeDefs, readFileSync('./src/graphql/schema.graphql', 'utf-8')];
    const resolvers: Resolvers = createResolvers(taskService, rabbitMQService);
    const schema = constraintDirective()(makeExecutableSchema({ typeDefs, resolvers }));
    const apolloServer = new ApolloServer({
      schema,
      formatError: (err) => ({
        message: err.message,
      }),
    });
    await startStandaloneServer(apolloServer, {
      listen: { port: 4000 },
    });
    fastify.log.info('GraphQL endpoint available at http://localhost:4000/graphql');

    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info('Server started on http://localhost:3000');
  } catch (err: unknown) {
    fastify.log.error(err);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  fastify.log.info('SIGINT received, closing MongoDB and RabbitMQ connections...');
  try {
    await getMongoClient().close();
    fastify.log.info('MongoDB connection closed.');
  } catch (err) {
    fastify.log.error('Error closing MongoDB connection:', err);
  }
  try {
    if (rabbitMQService) {
      await rabbitMQService.close();
      fastify.log.info('RabbitMQ connection closed.');
    }
  } catch (err) {
    fastify.log.error('Error closing RabbitMQ connection:', err);
  }
  process.exit(0);
});

start(); 