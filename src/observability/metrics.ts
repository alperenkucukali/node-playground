import {
  CloudWatchClient,
  PutMetricDataCommand,
  PutMetricDataCommandInput,
} from '@aws-sdk/client-cloudwatch';
import { env } from '../config/env';
import logger from '../config/logger';

const client = new CloudWatchClient({ region: env.aws.region });

interface MetricOptions {
  name: string;
  value: number;
  unit: 'Count' | 'Milliseconds';
  dimensions?: { Name: string; Value: string }[];
}

export async function publishMetric(options: MetricOptions): Promise<void> {
  if (!env.observability.metricsEnabled) {
    return;
  }

  const params: PutMetricDataCommandInput = {
    Namespace: env.observability.metricsNamespace,
    MetricData: [
      {
        MetricName: options.name,
        Unit: options.unit,
        Value: options.value,
        Dimensions: options.dimensions?.slice(0, 10),
        Timestamp: new Date(),
      },
    ],
  };

  try {
    await client.send(new PutMetricDataCommand(params));
  } catch (error) {
    logger.debug('Failed to publish CloudWatch metric', { error });
  }
}

export const metrics = {
  recordRequestSuccess(
    latencyMs: number,
    statusCode: number,
    method: string,
    path: string,
    tenantId: string,
  ) {
    const dimensions = buildDimensions(statusCode, method, path, tenantId);
    void publishMetric({
      name: 'ApiLatency',
      value: latencyMs,
      unit: 'Milliseconds',
      dimensions,
    });
    void publishMetric({
      name: 'ApiRequests',
      value: 1,
      unit: 'Count',
      dimensions,
    });
  },
  recordRequestError(statusCode: number, method: string, path: string, tenantId: string) {
    const dimensions = buildDimensions(statusCode, method, path, tenantId);
    void publishMetric({
      name: 'ApiErrors',
      value: 1,
      unit: 'Count',
      dimensions,
    });
  },
};

function buildDimensions(
  statusCode: number,
  method: string,
  path: string,
  tenantId: string,
): { Name: string; Value: string }[] {
  return [
    { Name: 'StatusCode', Value: String(statusCode) },
    { Name: 'Method', Value: method || 'UNKNOWN' },
    { Name: 'Path', Value: path || 'UNKNOWN' },
    { Name: 'TenantId', Value: tenantId || 'unknown' },
  ];
}
