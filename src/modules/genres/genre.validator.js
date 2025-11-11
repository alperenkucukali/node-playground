const ApiError = require('../../utils/api-error');

const ID_PATTERN = /^[a-z0-9_-]+$/;

function assertObject(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw ApiError.badRequest('Request body must be a JSON object');
  }
}

function normalizeId(raw) {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw ApiError.badRequest('id is required and must be a non-empty string');
  }

  const normalized = raw.trim().toLowerCase();
  if (!ID_PATTERN.test(normalized)) {
    throw ApiError.badRequest('id may contain lowercase letters, numbers, underscores, or hyphens');
  }

  return normalized;
}

function normalizeTexts(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw ApiError.badRequest('texts must be an object of locale -> text values');
  }

  const entries = Object.entries(raw).reduce((acc, [locale, text]) => {
    if (typeof locale !== 'string' || !locale.trim()) {
      throw ApiError.badRequest('texts keys must be non-empty locale codes');
    }
    if (typeof text !== 'string' || !text.trim()) {
      throw ApiError.badRequest(`texts.${locale} must be a non-empty string`);
    }
    acc[locale.trim().toLowerCase()] = text.trim();
    return acc;
  }, {});

  if (Object.keys(entries).length === 0) {
    throw ApiError.badRequest('texts must contain at least one locale entry');
  }

  return entries;
}

function normalizeDisplayOrder(raw, { required = true } = {}) {
  if (raw === undefined || raw === null) {
    if (required) {
      throw ApiError.badRequest('displayOrder is required');
    }
    return undefined;
  }

  const numeric = Number(raw);
  if (!Number.isInteger(numeric) || numeric < 0) {
    throw ApiError.badRequest('displayOrder must be a non-negative integer');
  }

  return numeric;
}

function sanitizeGenrePayload(body, { partial = false } = {}) {
  assertObject(body);
  const payload = {};

  if (!partial) {
    payload.id = normalizeId(body.id);
  } else if (body.id !== undefined) {
    throw ApiError.badRequest('id cannot be updated');
  }

  if ((!partial && body.texts === undefined) || body.texts !== undefined) {
    payload.texts = normalizeTexts(body.texts);
  }

  const displayOrder = normalizeDisplayOrder(body.displayOrder, { required: !partial });
  if (displayOrder !== undefined) {
    payload.displayOrder = displayOrder;
  }

  return payload;
}

function validateCreateGenre(req, _res, next) {
  try {
    req.body = sanitizeGenrePayload(req.body);
    next();
  } catch (error) {
    next(error);
  }
}

function validateUpdateGenre(req, _res, next) {
  try {
    req.body = sanitizeGenrePayload(req.body, { partial: true });
    if (Object.keys(req.body).length === 0) {
      throw ApiError.badRequest('At least one field must be provided to update a genre');
    }
    next();
  } catch (error) {
    next(error);
  }
}

function validateGenreIdParam(req, _res, next) {
  try {
    req.params.id = normalizeId(req.params.id);
    next();
  } catch (error) {
    next(error);
  }
}

function parseListQuery(req, _res, next) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    if (limit !== undefined) {
      if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
        throw ApiError.badRequest('limit must be an integer between 1 and 100');
      }
      req.query.limit = limit;
    }
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  validateCreateGenre,
  validateUpdateGenre,
  validateGenreIdParam,
  parseListQuery,
};
