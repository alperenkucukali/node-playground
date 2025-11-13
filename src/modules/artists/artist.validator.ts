import { Joi, validateSchema } from '../../utils/validation';
import { ArtistCreateInput, ArtistUpdateInput } from './artist.types';

const ID_PATTERN = /^[a-z0-9_-]+$/i;

const idSchema = Joi.string()
  .trim()
  .min(1)
  .pattern(ID_PATTERN)
  .messages({
    'string.base': 'id is required and must be a non-empty string',
    'string.empty': 'id is required and must be a non-empty string',
    'string.pattern.base': 'id may include letters, numbers, underscores, or hyphens',
  });

const nameSchema = (field: string, required: boolean) =>
  (required ? Joi.string().required() : Joi.string())
    .trim()
    .min(1)
    .messages({
      'string.base': `${field} must be a non-empty string`,
      'string.empty': `${field} must be a non-empty string`,
      'any.required': `${field} is required`,
    });

const isActiveSchema = Joi.boolean().messages({
  'boolean.base': 'isActive must be a boolean',
});

const createArtistSchema = Joi.object({
  id: idSchema.required(),
  firstName: nameSchema('firstName', true),
  lastName: nameSchema('lastName', true),
  isActive: isActiveSchema.default(true),
});

const updateArtistSchema = Joi.object({
  firstName: nameSchema('firstName', false),
  lastName: nameSchema('lastName', false),
  isActive: isActiveSchema,
  id: Joi.any()
    .forbidden()
    .messages({
      'any.unknown': 'id cannot be updated',
      'any.forbidden': 'id cannot be updated',
    }),
})
  .custom((value, helpers) => {
    if (value.firstName === undefined && value.lastName === undefined && value.isActive === undefined) {
      return helpers.error('any.custom', { message: 'At least one field must be provided to update an artist' });
    }
    return value;
  })
  .messages({
    'object.base': 'Request body must be a JSON object',
  });

const artistIdParamSchema = Joi.object({
  id: idSchema.required(),
}).unknown(true);

const artistListQuerySchema = Joi.object({
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
  isActive: Joi.boolean()
    .truthy('true')
    .truthy('TRUE')
    .truthy('True')
    .falsy('false')
    .falsy('FALSE')
    .falsy('False')
    .messages({
      'boolean.base': 'isActive must be true or false',
    }),
}).unknown(true);

export function validateArtistId(id: unknown): string {
  const result = validateSchema(artistIdParamSchema, { id }, { allowUnknown: true });
  return result.id;
}

export function validateCreateArtistPayload(payload: unknown): ArtistCreateInput {
  return validateSchema(createArtistSchema, payload);
}

export function validateUpdateArtistPayload(payload: unknown): ArtistUpdateInput {
  return validateSchema(updateArtistSchema, payload, { allowUnknown: true });
}

export function validateArtistListQuery(query: unknown): { limit?: number; cursor?: string; isActive?: boolean } {
  return validateSchema(artistListQuerySchema, query, { allowUnknown: true });
}
