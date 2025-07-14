# Task Queues Microservice

Микросервис для управления задачами с REST и GraphQL API, асинхронной обработкой событий через RabbitMQ и хранением данных в MongoDB.

## Быстрый старт

1. Установите зависимости:
   ```bash
   npm install
   ```
2. Запустите MongoDB и RabbitMQ через Docker Compose:
   ```bash
   docker-compose up -d
   ```
3. Запустите сервис:
   ```bash
   npm run build && npm start
   ```
4. Импортируйте коллекцию Postman для тестирования API или воспользуйтесь public workspace:
   - Файл: `src/tests/task-queues.postman_collection.json`
   - [Postman workspace](https://web.postman.co/workspace/6f788bd9-1110-4908-bb14-3f5fa91a9ef5)

## REST и GraphQL endpoints
- REST: `http://localhost:3000/tasks`, `http://localhost:3000/health`
- GraphQL: `http://localhost:4000/graphql`

## Безопасность
- Валидация и санитайзинг входных данных (Fastify schema, sanitize-html)
- Ограничения по длине строк, XSS-защита

## Структура проекта
```
/src
  /controllers      # REST и GraphQL контроллеры
  /services         # Бизнес-логика, работа с БД и RabbitMQ
  /models           # Модели данных (MongoDB)
  /schemas          # Схемы валидации Fastify
  /graphql          # GraphQL-схемы, резолверы, сгенерированные типы
  /routes           # REST-роуты
  /tests            # Тесты и коллекции Postman
index.ts            # Точка входа
codegen.yml         # Конфиг для @graphql-codegen/cli
```

## Окружение
- Node.js, TypeScript, Fastify
- MongoDB
- RabbitMQ (Direct Exchange)
- Apollo Server (GraphQL)
- @graphql-codegen/cli

## Документация
- Архитектура, описание RabbitMQ, кодогенерации и тестов — см. [PLAN.md](./PLAN.md)