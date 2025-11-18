import { CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { env } from '../src/config/env';
import logger from '../src/config/logger';
import { dynamoClient } from '../src/config/dynamodb';

const DISPLAY_ORDER_INDEX = 'DisplayOrderIndex';

async function ensureTable(): Promise<void> {
  const client = dynamoClient;
  const tableName = env.aws.tables.catalog;

  try {
    await client.send(
      new DescribeTableCommand({
        TableName: tableName,
      }),
    );

    logger.info(`Table ${tableName} already exists, skipping creation`);
    return;
  } catch (error) {
    if ((error as { name?: string } | undefined)?.name !== 'ResourceNotFoundException') {
      throw error;
    }
  }

  await client.send(
    new CreateTableCommand({
      TableName: tableName,
      AttributeDefinitions: [
        { AttributeName: 'PK', AttributeType: 'S' },
        { AttributeName: 'SK', AttributeType: 'S' },
        { AttributeName: 'DisplayOrder', AttributeType: 'N' },
      ],
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },
        { AttributeName: 'SK', KeyType: 'RANGE' },
      ],
      LocalSecondaryIndexes: [
        {
          IndexName: DISPLAY_ORDER_INDEX,
          KeySchema: [
            { AttributeName: 'PK', KeyType: 'HASH' },
            { AttributeName: 'DisplayOrder', KeyType: 'RANGE' },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    }),
  );

  logger.info(`Table ${tableName} created successfully with DisplayOrderIndex`);
}

ensureTable().catch((error) => {
  logger.error({ error }, 'Failed to create catalog table');
  process.exitCode = 1;
});
