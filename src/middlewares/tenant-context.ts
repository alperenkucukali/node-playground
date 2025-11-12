import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/api-error';
import { env } from '../config/env';

function tenantContext(req: Request, _res: Response, next: NextFunction): void {
  const headerName = env.tenant.headerName;
  const requestTenant = req.get(headerName);
  const tenantId = (requestTenant || env.tenant.defaultId || '').trim();

  if (!tenantId) {
    next(ApiError.badRequest(`Tenant id is required. Provide header ${headerName}`));
    return;
  }

  req.tenantId = tenantId;
  next();
}

export default tenantContext;
