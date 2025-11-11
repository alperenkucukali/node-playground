const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { env } = require('./env');

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

module.exports = {
  dynamoClient,
  documentClient,
};
