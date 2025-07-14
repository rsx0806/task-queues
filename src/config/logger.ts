import { LoggerOptions } from 'pino';

export const loggerConfig: LoggerOptions = {
  level: 'info',
  timestamp: require('pino').stdTimeFunctions.isoTime,
  base: null,
  messageKey: 'msg',
  serializers: {
    req(req: any) {
      return {
        method: req.method,
        url: req.url,
        body: req.body,
      };
    },
    res(res: any) {
      return { statusCode: res.statusCode };
    },
    event(event: any) {
      return {
        action: event.action,
        taskId: event.taskId,
        timestamp: event.timestamp,
      };
    },
  },
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname,reqId,level',
      messageFormat: '{msg}',
    },
  },
}; 