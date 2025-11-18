import { APIGatewayProxyEventV2 } from 'aws-lambda';

export const baseEvent: APIGatewayProxyEventV2 = {
  version: '2.0',
  routeKey: 'GET /resource',
  rawPath: '/api/v1/resource',
  rawQueryString: '',
  headers: {
    'x-tenant-id': 'tenant-1',
    'x-culture': 'en-US',
  },
  requestContext: {
    accountId: '123456789012',
    apiId: 'api-id',
    domainName: 'example.com',
    domainPrefix: 'example',
    http: {
      method: 'GET',
      path: '/api/v1/resource',
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'jest',
    },
    requestId: 'req-123',
    routeKey: 'GET /resource',
    stage: '$default',
    time: '12/Mar/2024:19:03:58 +0000',
    timeEpoch: Date.now(),
  },
  isBase64Encoded: false,
};

export function buildEvent(
  overrides: Partial<APIGatewayProxyEventV2> = {},
): APIGatewayProxyEventV2 {
  return {
    ...baseEvent,
    ...overrides,
    headers: {
      ...baseEvent.headers,
      ...(overrides.headers || {}),
    },
    requestContext: {
      ...baseEvent.requestContext,
      ...(overrides.requestContext || {}),
      http: {
        ...baseEvent.requestContext!.http!,
        ...(overrides.requestContext?.http || {}),
      },
    },
  };
}
