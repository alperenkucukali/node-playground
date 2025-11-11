const express = require('express');
const { env } = require('./config/env');
const cors = require('./middlewares/cors');
const requestLogger = require('./middlewares/request-logger');
const tenantContext = require('./middlewares/tenant-context');
const notFound = require('./middlewares/not-found');
const errorHandler = require('./middlewares/error-handler');
const v1Router = require('./routes/v1');

function buildApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cors);
  app.use(requestLogger);
  app.use(tenantContext);

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now(),
      service: env.appName,
    });
  });

  app.use(env.apiRoot, v1Router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = buildApp();
