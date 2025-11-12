import { NextFunction, Request, Response } from 'express';
import { Joi, validateSchema } from '../../utils/validation';

const ID_PATTERN = /^[a-z0-9_-]+$/;

const idSchema = Joi.string()
  .trim()
  .min(1)
  .pattern(ID_PATTERN)
  .lowercase()
  .messages({
    'string.base': 'id is required and must be a non-empty string',
    'string.empty': 'id is required and must be a non-empty string',
    'string.pattern.base': 'id may contain lowercase letters, numbers, underscores, or hyphens',
  });

const textsSchema = Joi.object()
  .custom((value, helpers) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return helpers.error('any.custom', { message: 'texts must be an object of locale -> text values' });
    }

    const entries: Record<string, string> = {};

    for (const [locale, text] of Object.entries(value)) {
      if (typeof locale !== 'string' || !locale.trim()) {
        return helpers.error('any.custom', { message: 'texts keys must be non-empty locale codes' });
      }

      if (typeof text !== 'string' || !text.trim()) {
        return helpers.error('any.custom', { message: `texts.${locale} must be a non-empty string` });
      }

      entries[locale.trim().toLowerCase()] = text.trim();
    }

    if (Object.keys(entries).length === 0) {
      return helpers.error('any.custom', { message: 'texts must contain at least one locale entry' });
    }

    return entries;
  })
  .messages({
    'object.base': 'texts must be an object of locale -> text values',
  });

const displayOrderSchema = Joi.number()
  .integer()
  .min(0)
  .messages({
    'number.base': 'displayOrder must be a non-negative integer',
    'number.integer': 'displayOrder must be a non-negative integer',
    'number.min': 'displayOrder must be a non-negative integer',
  });

const createGenreSchema = Joi.object({
  id: idSchema.required(),
  texts: textsSchema.required(),
  displayOrder: displayOrderSchema.required().messages({ 'any.required': 'displayOrder is required' }),
});

const updateGenreSchema = Joi.object({
  texts: textsSchema,
  displayOrder: displayOrderSchema,
  id: Joi.any()
    .forbidden()
    .messages({
      'any.unknown': 'id cannot be updated',
      'any.forbidden': 'id cannot be updated',
    }),
})
  .custom((value, helpers) => {
    if (value.texts === undefined && value.displayOrder === undefined) {
      return helpers.error('any.custom', { message: 'At least one field must be provided to update a genre' });
    }
    return value;
  })
  .messages({
    'object.base': 'Request body must be a JSON object',
  });

const listQuerySchema = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .messages({
      'number.base': 'limit must be an integer between 1 and 100',
      'number.integer': 'limit must be an integer between 1 and 100',
      'number.min': 'limit must be an integer between 1 and 100',
      'number.max': 'limit must be an integer between 1 and 100',
    }),
  cursor: Joi.string().trim(),
}).unknown(true);

const genreIdParamSchema = Joi.object({
  id: idSchema.required(),
}).unknown(true);

export function validateCreateGenre(req: Request, _res: Response, next: NextFunction): void {
  try {
    req.body = validateSchema(createGenreSchema, req.body);
    next();
  } catch (error) {
    next(error);
  }
}

export function validateUpdateGenre(req: Request, _res: Response, next: NextFunction): void {
  try {
    req.body = validateSchema(updateGenreSchema, req.body, { allowUnknown: true });
    next();
  } catch (error) {
    next(error);
  }
}

export function validateGenreIdParam(req: Request, _res: Response, next: NextFunction): void {
  try {
    const { id } = validateSchema(genreIdParamSchema, req.params, { allowUnknown: true });
    req.params.id = id;
    next();
  } catch (error) {
    next(error);
  }
}

export function parseListQuery(req: Request, _res: Response, next: NextFunction): void {
  try {
    const result = validateSchema(listQuerySchema, req.query, { allowUnknown: true });
    req.query.limit = result.limit as any;
    req.query.cursor = result.cursor as any;
    next();
  } catch (error) {
    next(error);
  }
}
