export interface BaseResponseBody {
  success: boolean;
  code: number;
  message: string;
  classId: string;
  locale: string;
  requestId?: string;
}

export interface SuccessResponseBody<T> extends BaseResponseBody {
  success: true;
  data?: T;
}

export interface ErrorResponseBody extends BaseResponseBody {
  success: false;
  details?: unknown;
}

export type ApiSuccessResponse<T> = {
  statusCode: number;
  headers?: Record<string, string>;
  body: SuccessResponseBody<T>;
};

export type ApiErrorResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: ErrorResponseBody;
};
