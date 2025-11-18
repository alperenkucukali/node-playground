import { MessageDefinition, getI18nKey } from './messages';
import { translator } from './translator';
import { ApiSuccessResponse } from './types';

export function ok<T>(
  def: MessageDefinition,
  locale: string,
  data?: T,
  requestId?: string,
  headers: Record<string, string> = {},
): ApiSuccessResponse<T> {
  const key = getI18nKey(def);
  const message = translator.translate(key, locale);

  return {
    statusCode: def.httpStatus,
    headers,
    body: {
      success: true,
      code: def.code,
      message,
      classId: def.classId,
      locale,
      requestId,
      data,
    },
  };
}
