import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

function cors(req: Request, res: Response, next: NextFunction): void {
  const origins = env.corsOrigins.length ? env.corsOrigins : ['*'];
  const origin = req.get('origin') || undefined;

  if (origins.includes('*') || (origin && origins.includes(origin))) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
}

export default cors;
