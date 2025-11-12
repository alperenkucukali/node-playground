import { NextFunction, Request, Response } from 'express';
import ApiError from '../../utils/api-error';
import { GenreCreateInput, GenreUpdateInput } from './genre.types';

const ID_PATTERN = /^[a-z0-9_-]+$/;

type MutableGenreCreateInput = GenreCreateInput & Partial<GenreUpdateInput>;
type MutableGenreUpdateInput = GenreUpdateInput;

function assertObject(payload: unknown): asserts payload is Record<string, unknown> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw ApiError.badRequest('Request body must be a JSON object');
  }
}

function normalizeId(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw ApiError.badRequest('id is required and must be a non-empty string');
  }

  const normalized = raw.trim().toLowerCase();
  if (!ID_PATTERN.test(normalized)) {
    throw ApiError.badRequest('id may contain lowercase letters, numbers, underscores, or hyphens');
  }

  return normalized;
}

function normalizeTexts(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw ApiError.badRequest('texts must be an object of locale -> text values');
  }

  const entries = Object.entries(raw).reduce<Record<string, string>>((acc, [locale, text]) => {
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

function normalizeDisplayOrder(raw: unknown, { required = true } = {}): number | undefined {
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

function sanitizeGenrePayload(body: unknown): GenreCreateInput;
function sanitizeGenrePayload(body: unknown, options: { partial: true }): GenreUpdateInput;
function sanitizeGenrePayload(
  body: unknown,
  options: { partial?: boolean } = {},
): GenreCreateInput | GenreUpdateInput {
  const { partial = false } = options;
  assertObject(body);

  if (!partial) {
    const payload: MutableGenreCreateInput = {
      id: normalizeId(body.id),
      texts: normalizeTexts(body.texts),
      displayOrder: normalizeDisplayOrder(body.displayOrder, { required: true })!,
    };
    return payload;
  }

  const payload: MutableGenreUpdateInput = {};

  if (body.id !== undefined) {
    throw ApiError.badRequest('id cannot be updated');
  }

  if (body.texts !== undefined) {
    payload.texts = normalizeTexts(body.texts);
  }

  const displayOrder = normalizeDisplayOrder(body.displayOrder, { required: false });
  if (displayOrder !== undefined) {
    payload.displayOrder = displayOrder;
  }

  return payload;
}

export function validateCreateGenre(req: Request, _res: Response, next: NextFunction): void {
  try {
    req.body = sanitizeGenrePayload(req.body);
    next();
  } catch (error) {
    next(error);
  }
}

export function validateUpdateGenre(req: Request, _res: Response, next: NextFunction): void {
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

export function validateGenreIdParam(req: Request, _res: Response, next: NextFunction): void {
  try {
    req.params.id = normalizeId(req.params.id);
    next();
  } catch (error) {
    next(error);
  }
}

export function parseListQuery(req: Request, _res: Response, next: NextFunction): void {
  try {
    const limit = req.query.limit !== undefined ? Number(req.query.limit) : undefined;
    if (limit !== undefined) {
      if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
        throw ApiError.badRequest('limit must be an integer between 1 and 100');
      }
      req.query.limit = limit as any;
    }
    next();
  } catch (error) {
    next(error);
  }
}
