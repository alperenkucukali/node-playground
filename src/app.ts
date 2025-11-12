import express, { Application, Request, Response } from 'express';
import { env } from './config/env';
import cors from './middlewares/cors';
import requestLogger from './middlewares/request-logger';
import tenantContext from './middlewares/tenant-context';
import notFound from './middlewares/not-found';
import errorHandler from './middlewares/error-handler';
import v1Router from './routes/v1';

export function buildApp(): Application {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cors);
  app.use(requestLogger);
  app.use(tenantContext);

  app.get('/health', (_req: Request, res: Response) => {
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

const app = buildApp();
export default app;
