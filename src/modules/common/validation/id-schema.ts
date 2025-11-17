import { Joi } from '../../../utils/validation';

export interface IdSchemaOptions {
  pattern: RegExp;
  lowercase?: boolean;
  patternMessage: string;
}

export function createIdSchema(options: IdSchemaOptions) {
  const { pattern, lowercase, patternMessage } = options;

  let schema = Joi.string()
    .trim()
    .min(1)
    .pattern(pattern)
    .messages({
      'string.base': 'id is required and must be a non-empty string',
      'string.empty': 'id is required and must be a non-empty string',
      'string.pattern.base': patternMessage,
    });

  if (lowercase) {
    schema = schema.lowercase();
  }

  return schema;
}
