import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { env, LOG_LEVELS } from '../config/env';
import type { LogLevel } from '../config/env';
import logger from '../config/logger';
import ApiError from '../core/api-error';
import { ApiErrorResponse, ApiSuccessResponse } from '../core/types';
import { withErrorHandling } from '../core/with-error-handling';
import { CommonMessages } from '../modules/common/messages';
import { publishMetric } from '../observability/metrics';

export interface HandlerContext {
  event: APIGatewayProxyEventV2;
  tenantId: string;
  locale: string;
  requestId?: string;
}

type HandlerLogic = (context: HandlerContext) => Promise<ApiSuccessResponse<unknown>>;

const LOCALE_HEADER = 'x-culture';
const DEFAULT_LOCALE = 'en-US';

export function createHandler(logic: HandlerLogic) {
  const handler = async (event: APIGatewayProxyEventV2): Promise<ApiSuccessResponse<unknown>> => {
    const locale = resolveLocale(event);
    const tenantId = resolveTenantId(event, locale);
    const requestId = event.requestContext?.requestId;

    const response = await logic({ event, tenantId, locale, requestId });
    response.body.requestId = response.body.requestId || requestId;
    response.headers = {
      'Content-Type': 'application/json',
      ...response.headers,
    };
    return response;
  };

  const wrapped = withErrorHandling(handler, {
    onUnexpectedError: (error) =>
      logger.error('Unexpected error while handling request', { error }),
  });

  return async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const startedAt = Date.now();
    const result = await wrapped(event);
    logRequest(event, result, startedAt);
    return formatResult(event, result);
  };
}

export function parseJsonBody<T = unknown>(
  event: APIGatewayProxyEventV2,
  locale: string,
): T | undefined {
  if (!event.body) {
    return undefined;
  }

  const payload = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;

  try {
    return payload ? (JSON.parse(payload) as T) : undefined;
  } catch {
    throw new ApiError(CommonMessages.INVALID_JSON, locale);
  }
}

function resolveTenantId(event: APIGatewayProxyEventV2, locale: string): string {
  const tenantHeader = env.tenant.headerName;
  const tenantId =
    getHeader(event, tenantHeader) ||
    getHeader(event, tenantHeader.toLowerCase()) ||
    env.tenant.defaultId ||
    '';

  if (!tenantId.trim()) {
    throw new ApiError(CommonMessages.TENANT_REQUIRED, locale, { header: tenantHeader });
  }

  return tenantId.trim();
}

function resolveLocale(event: APIGatewayProxyEventV2): string {
  return getHeader(event, LOCALE_HEADER) || DEFAULT_LOCALE;
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

function formatResult(
  event: APIGatewayProxyEventV2,
  response: ApiSuccessResponse<unknown> | ApiErrorResponse,
): APIGatewayProxyResultV2 {
  const corsHeaders = buildCorsHeaders(event);
  const headers = {
    'Content-Type': 'application/json',
    ...corsHeaders,
    ...response.headers,
  };

  return {
    statusCode: response.statusCode,
    headers,
    body: JSON.stringify(response.body),
  };
}

function logRequest(
  event: APIGatewayProxyEventV2,
  response: ApiSuccessResponse<unknown> | ApiErrorResponse,
  startedAt: number,
): void {
  const body = response.body as { success?: boolean; code?: number; classId?: string } | undefined;
  const context = {
    method: event.requestContext?.http?.method,
    path: event.rawPath,
    requestId: event.requestContext?.requestId,
    tenantId: getHeader(event, env.tenant.headerName) || env.tenant.defaultId || 'unknown',
    locale: getHeader(event, LOCALE_HEADER) || DEFAULT_LOCALE,
    statusCode: response.statusCode,
    code: body?.code,
    classId: body?.classId,
    latencyMs: Date.now() - startedAt,
  };

  const level = determineLogLevel(response.statusCode, body?.success);
  if (!shouldLog(level)) {
    return;
  }

  const message =
    level === 'error'
      ? 'HTTP request completed with server error'
      : level === 'warn'
        ? 'HTTP request completed with client error'
        : 'HTTP request completed';

  if (level === 'error') {
    logger.error(message, context);
  } else if (level === 'warn') {
    logger.warn(message, context);
  } else {
    logger.info(message, context);
  }

  const dimensions = [
    { Name: 'Method', Value: String(context.method || 'UNKNOWN') },
    { Name: 'Path', Value: String(context.path || 'UNKNOWN') },
    { Name: 'StatusCode', Value: String(response.statusCode) },
    { Name: 'TenantId', Value: String(context.tenantId) },
  ];

  void publishMetric({
    name: 'ApiLatency',
    value: context.latencyMs,
    unit: 'Milliseconds',
    dimensions,
  });

  void publishMetric({
    name: 'ApiRequests',
    value: 1,
    unit: 'Count',
    dimensions,
  });
}

function determineLogLevel(statusCode: number, success?: boolean): LogLevel {
  if (statusCode >= 500) {
    return 'error';
  }
  if (statusCode >= 400 || success === false) {
    return 'warn';
  }
  return 'info';
}

function shouldLog(level: LogLevel): boolean {
  const configuredValue = typeof env.logLevel === 'string' ? env.logLevel.toLowerCase() : 'info';
  const configured = LOG_LEVELS.includes(configuredValue as LogLevel)
    ? (configuredValue as LogLevel)
    : ('info' as LogLevel);
  return LOG_LEVELS.indexOf(level) <= LOG_LEVELS.indexOf(configured);
}
