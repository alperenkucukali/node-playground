import http from 'node:http';
import app from './app';
import { env } from './config/env';
import logger from './config/logger';

const server = http.createServer(app);

export function start(): void {
  server.listen(env.port, () => {
    logger.info(`${env.appName} listening on port ${env.port}`);
  });

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

export function shutdown(signal?: NodeJS.Signals | string): void {
  logger.info(`Received ${signal || 'shutdown'}, closing server...`);
  server.close(() => {
    logger.info('Server closed gracefully');
    process.exit(0);
  });
}

if (require.main === module) {
  start();
}

export { server };
