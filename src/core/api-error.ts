import { MessageDefinition, getI18nKey } from './messages';
import { translator } from './translator';

export default class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: number;
  public readonly classId: string;
  public readonly locale: string;
  public readonly details?: unknown;
  public readonly isOperational = true;

  constructor(def: MessageDefinition, locale: string, details?: unknown) {
    const key = getI18nKey(def);
    const message = translator.translate(key, locale);
    super(message);

    this.statusCode = def.httpStatus;
    this.code = def.code;
    this.classId = def.classId;
    this.locale = locale;
    this.details = details;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
