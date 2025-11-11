const ApiError = require('../utils/api-error');
const { env } = require('../config/env');

function tenantContext(req, _res, next) {
  const headerName = env.tenant.headerName;
  const requestTenant = req.get(headerName);
  const tenantId = (requestTenant || env.tenant.defaultId || '').trim();

  if (!tenantId) {
    return next(ApiError.badRequest(`Tenant id is required. Provide header ${headerName}`));
  }

  req.tenantId = tenantId;
  return next();
}

module.exports = tenantContext;
