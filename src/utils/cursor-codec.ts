export default class CursorCodec<T extends Record<string, unknown> = Record<string, unknown>> {
  encode(value?: T | null): string | undefined {
    return value ? Buffer.from(JSON.stringify(value)).toString('base64') : undefined;
  }

  decode(cursor?: string | null, onInvalid?: () => Error): T | undefined {
    if (!cursor) {
      return undefined;
    }

    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf8')) as T;
    } catch {
      if (onInvalid) {
        throw onInvalid();
      }
      throw new Error('Invalid cursor token');
    }
  }
}
