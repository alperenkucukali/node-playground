import ApiError from './api-error';
import { ApiErrorResponse, ApiSuccessResponse } from './types';

type LambdaHandler<TEvent> = (event: TEvent) => Promise<ApiSuccessResponse<unknown>>;

interface ErrorHandlingOptions {
  onUnexpectedError?: (error: unknown) => void;
}

export function withErrorHandling<TEvent>(
  handler: LambdaHandler<TEvent>,
  options?: ErrorHandlingOptions,
) {
  return async (event: TEvent): Promise<ApiSuccessResponse<unknown> | ApiErrorResponse> => {
    try {
      return await handler(event);
    } catch (error) {
      if (error instanceof ApiError) {
        return {
          statusCode: error.statusCode,
          body: {
            success: false,
            code: error.code,
            message: error.message,
            classId: error.classId,
            locale: error.locale,
            requestId: (event as any)?.requestContext?.requestId,
            details: error.details,
          },
        };
      }

      options?.onUnexpectedError?.(error);
      return {
        statusCode: 500,
        body: {
          success: false,
          code: 9999,
          message: 'Internal server error',
          classId: 'Unknown',
          locale: 'en-US',
          requestId: (event as any)?.requestContext?.requestId,
        },
      };
    }
  };
}
