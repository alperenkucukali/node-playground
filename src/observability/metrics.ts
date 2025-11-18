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
