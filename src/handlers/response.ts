import { HandlerResponse } from './http';

interface SuccessBody<T> {
  success: true;
  data: T;
  nextCursor?: string;
}

export function ok<T>(data: T): HandlerResponse {
  return {
    statusCode: 200,
    body: {
      success: true,
      data,
    },
  };
}

export function created<T>(data: T): HandlerResponse {
  return {
    statusCode: 201,
    body: {
      success: true,
      data,
    },
  };
}

export function listOk<T>(items: T[], nextCursor?: string): HandlerResponse {
  const body: SuccessBody<T[]> = {
    success: true,
    data: items,
    nextCursor,
  };

  return {
    statusCode: 200,
    body,
  };
}

export function noContent(): HandlerResponse {
  return {
    statusCode: 204,
  };
}
