import pino from 'pino';
import { env } from './env';

const logger = pino({
  level: env.logLevel,
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
});

export { logger };
export default logger;
