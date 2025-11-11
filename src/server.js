const http = require('node:http');
const app = require('./app');
const { env } = require('./config/env');
const logger = require('./config/logger');

const server = http.createServer(app);

function start() {
  server.listen(env.port, () => {
    logger.info(`${env.appName} listening on port ${env.port}`);
  });

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

function shutdown(signal) {
  logger.info(`Received ${signal || 'shutdown'}, closing server...`);
  server.close(() => {
    logger.info('Server closed gracefully');
    process.exit(0);
  });
}

if (require.main === module) {
  start();
}

module.exports = { server, start };
