import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { env } from '../config/env';
import logger from '../config/logger';
import ApiError from '../core/api-error';
import { ApiErrorResponse, ApiSuccessResponse } from '../core/types';
import { withErrorHandling } from '../core/with-error-handling';
import { CommonMessages } from '../modules/common/messages';

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
    onUnexpectedError: (error) => logger.error('Unexpected error while handling request', { error }),
  });

  return async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const result = await wrapped(event);
    return formatResult(event, result);
  };
}

export function parseJsonBody<T = unknown>(event: APIGatewayProxyEventV2, locale: string): T | undefined {
  if (!event.body) {
    return undefined;
  }

  const payload = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;

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
