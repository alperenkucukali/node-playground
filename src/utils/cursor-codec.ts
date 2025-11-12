import ApiError from './api-error';

export default class CursorCodec<T extends Record<string, unknown> = Record<string, unknown>> {
  encode(value?: T | null): string | undefined {
    return value ? Buffer.from(JSON.stringify(value)).toString('base64') : undefined;
  }

  decode(cursor?: string | null): T | undefined {
    if (!cursor) {
      return undefined;
    }

    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf8')) as T;
    } catch {
      throw ApiError.badRequest('Invalid cursor token');
    }
  }
}
