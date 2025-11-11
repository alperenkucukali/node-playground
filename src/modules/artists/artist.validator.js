const ApiError = require('../../utils/api-error');

const ID_PATTERN = /^[a-z0-9_-]+$/i;

function assertBodyObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw ApiError.badRequest('Request body must be a JSON object');
  }
}

function normalizeId(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw ApiError.badRequest('id is required and must be a non-empty string');
  }

  const normalized = value.trim();
  if (!ID_PATTERN.test(normalized)) {
    throw ApiError.badRequest('id may include letters, numbers, underscores, or hyphens');
  }

  return normalized;
}

function normalizeName(field, value, { required } = { required: true }) {
  if (value === undefined) {
    if (required) {
      throw ApiError.badRequest(`${field} is required`);
    }
    return undefined;
  }

  if (typeof value !== 'string' || !value.trim()) {
    throw ApiError.badRequest(`${field} must be a non-empty string`);
  }

  return value.trim();
}

function normalizeIsActive(value, { required = false } = {}) {
  if (value === undefined) {
    if (required) {
      throw ApiError.badRequest('isActive is required');
    }
    return undefined;
  }

  if (typeof value !== 'boolean') {
    throw ApiError.badRequest('isActive must be a boolean');
  }

  return value;
}

function sanitizeArtistPayload(body, { partial = false } = {}) {
  assertBodyObject(body);
  const payload = {};

  if (!partial) {
    payload.id = normalizeId(body.id);
  } else if (body.id !== undefined) {
    throw ApiError.badRequest('id cannot be updated');
  }

  const firstName = normalizeName('firstName', body.firstName, { required: !partial });
  if (firstName !== undefined) {
    payload.firstName = firstName;
  }

  const lastName = normalizeName('lastName', body.lastName, { required: !partial });
  if (lastName !== undefined) {
    payload.lastName = lastName;
  }

  const isActive = normalizeIsActive(body.isActive, { required: false });
  if (isActive !== undefined) {
    payload.isActive = isActive;
  }

  return payload;
}

function validateArtistIdParam(req, _res, next) {
  try {
    req.params.id = normalizeId(req.params.id);
    next();
  } catch (error) {
    next(error);
  }
}

function validateCreateArtist(req, _res, next) {
  try {
    req.body = sanitizeArtistPayload(req.body);
    next();
  } catch (error) {
    next(error);
  }
}

function validateUpdateArtist(req, _res, next) {
  try {
    req.body = sanitizeArtistPayload(req.body, { partial: true });
    if (Object.keys(req.body).length === 0) {
      throw ApiError.badRequest('At least one field must be provided to update an artist');
    }
    next();
  } catch (error) {
    next(error);
  }
}

function parseArtistListQuery(req, _res, next) {
  try {
    if (req.query.limit !== undefined) {
      const limit = Number(req.query.limit);
      if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
        throw ApiError.badRequest('limit must be an integer between 1 and 100');
      }
      req.query.limit = limit;
    }

    if (req.query.isActive !== undefined) {
      if (!['true', 'false'].includes(String(req.query.isActive).toLowerCase())) {
        throw ApiError.badRequest('isActive must be true or false');
      }
      req.query.isActive = String(req.query.isActive).toLowerCase() === 'true';
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  validateArtistIdParam,
  validateCreateArtist,
  validateUpdateArtist,
  parseArtistListQuery,
};
