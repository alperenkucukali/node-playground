import Joi, { Schema, ValidationOptions } from 'joi';
import ApiError from './api-error';

const DEFAULT_OPTIONS: ValidationOptions = {
  abortEarly: false,
  stripUnknown: true,
  convert: true,
};

export function validateSchema<T>(schema: Schema<T>, payload: unknown, options?: ValidationOptions): T {
  const { value, error } = schema.validate(payload, { ...DEFAULT_OPTIONS, ...options });

  if (error) {
    const detail = error.details[0];
    const message =
      (detail?.context as { message?: string } | undefined)?.message || detail?.message || 'Validation failed';
    throw ApiError.badRequest(message);
  }

  return value as T;
}

export { Joi };
