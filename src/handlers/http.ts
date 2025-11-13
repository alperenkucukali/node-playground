import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { env } from '../config/env';
import logger from '../config/logger';
import ApiError from '../utils/api-error';

export interface HandlerContext {
  event: APIGatewayProxyEventV2;
  tenantId: string;
}

export interface HandlerResponse {
  statusCode: number;
  body?: unknown;
  headers?: Record<string, string>;
}

type HandlerLogic = (context: HandlerContext) => Promise<HandlerResponse>;

export function createHandler(logic: HandlerLogic) {
  return async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
      const tenantId = resolveTenantId(event);
      const response = await logic({ event, tenantId });
      return formatSuccess(event, response);
    } catch (error) {
      return formatError(event, error);
    }
  };
}

export function parseJsonBody<T = unknown>(event: APIGatewayProxyEventV2): T | undefined {
  if (!event.body) {
    return undefined;
  }

  const payload = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;

  try {
    return payload ? (JSON.parse(payload) as T) : undefined;
  } catch {
    throw ApiError.badRequest('Request body must be valid JSON');
  }
}

function resolveTenantId(event: APIGatewayProxyEventV2): string {
  const tenantHeader = env.tenant.headerName;
  const tenantId =
    getHeader(event, tenantHeader) ||
    getHeader(event, tenantHeader.toLowerCase()) ||
    env.tenant.defaultId ||
    '';

  if (!tenantId.trim()) {
    throw ApiError.badRequest(`Tenant id is required. Provide header ${tenantHeader}`);
  }

  return tenantId.trim();
}

function getHeader(event: APIGatewayProxyEventV2, name: string): string | undefined {
  if (!event.headers) {
    return undefined;
  }

  const normalizedName = name.toLowerCase();
  for (const [key, value] of Object.entries(event.headers)) {
    if (key.toLowerCase() === normalizedName) {
      return value || undefined;
    }
  }
  return undefined;
}

function buildCorsHeaders(event: APIGatewayProxyEventV2): Record<string, string> {
  const allowedOrigins = env.corsOrigins.length ? env.corsOrigins : ['*'];
  const requestOrigin = getHeader(event, 'origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };

  if (allowedOrigins.includes('*')) {
    headers['Access-Control-Allow-Origin'] = requestOrigin || '*';
  } else if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    headers['Access-Control-Allow-Origin'] = requestOrigin;
  }

  return headers;
}

function formatSuccess(event: APIGatewayProxyEventV2, response: HandlerResponse): APIGatewayProxyResultV2 {
  const { statusCode, body, headers } = response;
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...buildCorsHeaders(event),
    ...headers,
  };

  return {
    statusCode,
    headers: finalHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

function formatError(event: APIGatewayProxyEventV2, error: unknown): APIGatewayProxyResultV2 {
  const apiError = error instanceof ApiError ? error : ApiError.internal();

  if (!(error instanceof ApiError)) {
    logger.error('Unexpected error while handling request', { error });
  }

  const payload = {
    success: false,
    message: apiError.message,
    details: apiError.details,
  };

  return {
    statusCode: apiError.statusCode || 500,
    headers: {
      'Content-Type': 'application/json',
      ...buildCorsHeaders(event),
    },
    body: JSON.stringify(payload),
  };
}
