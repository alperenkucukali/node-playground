import { NextFunction, Request, Response } from 'express';
import ApiError from '../../utils/api-error';
import { ArtistCreateInput, ArtistUpdateInput } from './artist.types';

const ID_PATTERN = /^[a-z0-9_-]+$/i;

type MutableArtistCreateInput = ArtistCreateInput;
type MutableArtistUpdateInput = ArtistUpdateInput;

function assertBodyObject(body: unknown): asserts body is Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw ApiError.badRequest('Request body must be a JSON object');
  }
}

function normalizeId(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw ApiError.badRequest('id is required and must be a non-empty string');
  }

  const normalized = value.trim();
  if (!ID_PATTERN.test(normalized)) {
    throw ApiError.badRequest('id may include letters, numbers, underscores, or hyphens');
  }

  return normalized;
}

function normalizeName(field: string, value: unknown, { required }: { required: boolean }): string | undefined {
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

function normalizeIsActive(value: unknown, { required = false } = {}): boolean | undefined {
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

function sanitizeArtistPayload(body: unknown): ArtistCreateInput;
function sanitizeArtistPayload(body: unknown, options: { partial: true }): ArtistUpdateInput;
function sanitizeArtistPayload(
  body: unknown,
  options: { partial?: boolean } = {},
): ArtistCreateInput | ArtistUpdateInput {
  const { partial = false } = options;
  assertBodyObject(body);

  if (!partial) {
    const payload: MutableArtistCreateInput = {
      id: normalizeId(body.id),
      firstName: normalizeName('firstName', body.firstName, { required: true })!,
      lastName: normalizeName('lastName', body.lastName, { required: true })!,
      isActive: normalizeIsActive(body.isActive, { required: false }) ?? true,
    };
    return payload;
  }

  const payload: MutableArtistUpdateInput = {};

  if (body.id !== undefined) {
    throw ApiError.badRequest('id cannot be updated');
  }

  const firstName = normalizeName('firstName', body.firstName, { required: false });
  if (firstName !== undefined) {
    payload.firstName = firstName;
  }

  const lastName = normalizeName('lastName', body.lastName, { required: false });
  if (lastName !== undefined) {
    payload.lastName = lastName;
  }

  const isActive = normalizeIsActive(body.isActive, { required: false });
  if (isActive !== undefined) {
    payload.isActive = isActive;
  }

  return payload;
}

export function validateArtistIdParam(req: Request, _res: Response, next: NextFunction): void {
  try {
    req.params.id = normalizeId(req.params.id);
    next();
  } catch (error) {
    next(error);
  }
}

export function validateCreateArtist(req: Request, _res: Response, next: NextFunction): void {
  try {
    req.body = sanitizeArtistPayload(req.body);
    next();
  } catch (error) {
    next(error);
  }
}

export function validateUpdateArtist(req: Request, _res: Response, next: NextFunction): void {
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

export function parseArtistListQuery(req: Request, _res: Response, next: NextFunction): void {
  try {
    if (req.query.limit !== undefined) {
      const limit = Number(req.query.limit);
      if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
        throw ApiError.badRequest('limit must be an integer between 1 and 100');
      }
      req.query.limit = limit as any;
    }

    if (req.query.isActive !== undefined) {
      const raw = String(req.query.isActive).toLowerCase();
      if (!['true', 'false'].includes(raw)) {
        throw ApiError.badRequest('isActive must be true or false');
      }
      req.query.isActive = (raw === 'true') as any;
    }

    next();
  } catch (error) {
    next(error);
  }
}
