import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { env } from './env';

const dynamoClient = new DynamoDBClient({
  region: env.aws.region,
  endpoint: env.aws.dynamoEndpoint || undefined,
  credentials: env.aws.credentials,
});

const documentClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: true,
  },
});

export { dynamoClient, documentClient };
