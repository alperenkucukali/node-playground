const {
  PutCommand,
  GetCommand,
  DeleteCommand,
  UpdateCommand,
  QueryCommand,
} = require('@aws-sdk/lib-dynamodb');
const { documentClient } = require('../../config/dynamodb');
const { env } = require('../../config/env');
const { buildTenantPk, buildArtistSk, ENTITY } = require('../common/dynamo-keys');

const TABLE_NAME = env.aws.tables.catalog;

function fromDbModel(item) {
  if (!item) {
    return null;
  }

  return {
    id: item.ArtistId,
    firstName: item.FirstName,
    lastName: item.LastName,
    isActive: item.IsActive,
    tenantId: item.TenantId,
    createdAt: item.CreatedAt,
    updatedAt: item.UpdatedAt,
  };
}

async function listArtists({ tenantId, limit, cursor, isActive } = {}) {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :skPrefix)',
    ExpressionAttributeNames: {
      '#pk': 'PK',
      '#sk': 'SK',
    },
    ExpressionAttributeValues: {
      ':pk': buildTenantPk(tenantId),
      ':skPrefix': 'ARTIST#',
    },
    Limit: limit,
    ExclusiveStartKey: cursor || undefined,
  };

  if (typeof isActive === 'boolean') {
    params.FilterExpression = '#isActive = :isActive';
    params.ExpressionAttributeNames['#isActive'] = 'IsActive';
    params.ExpressionAttributeValues[':isActive'] = isActive;
  }

  const result = await documentClient.send(new QueryCommand(params));

  return {
    items: (result.Items || []).map(fromDbModel),
    lastEvaluatedKey: result.LastEvaluatedKey,
  };
}

async function findById(tenantId, id) {
  const result = await documentClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildTenantPk(tenantId),
        SK: buildArtistSk(id),
      },
    }),
  );

  return fromDbModel(result.Item);
}

async function createArtist(tenantId, entity) {
  const now = new Date().toISOString();
  const item = {
    PK: buildTenantPk(tenantId),
    SK: buildArtistSk(entity.id),
    EntityType: ENTITY.ARTIST,
    ArtistId: entity.id,
    FirstName: entity.firstName,
    LastName: entity.lastName,
    IsActive: entity.isActive ?? true,
    TenantId: tenantId,
    CreatedAt: now,
    UpdatedAt: now,
  };

  await documentClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: 'attribute_not_exists(PK)',
    }),
  );

  return fromDbModel(item);
}

async function updateArtist(tenantId, id, updates) {
  const expressions = [];
  const names = { '#updatedAt': 'UpdatedAt' };
  const values = { ':updatedAt': new Date().toISOString() };

  expressions.push('#updatedAt = :updatedAt');

  if (updates.firstName !== undefined) {
    expressions.push('#firstName = :firstName');
    names['#firstName'] = 'FirstName';
    values[':firstName'] = updates.firstName;
  }

  if (updates.lastName !== undefined) {
    expressions.push('#lastName = :lastName');
    names['#lastName'] = 'LastName';
    values[':lastName'] = updates.lastName;
  }

  if (updates.isActive !== undefined) {
    expressions.push('#isActive = :isActive');
    names['#isActive'] = 'IsActive';
    values[':isActive'] = updates.isActive;
  }

  if (expressions.length === 1) {
    throw new Error('No updates provided');
  }

  const result = await documentClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildTenantPk(tenantId),
        SK: buildArtistSk(id),
      },
      UpdateExpression: `SET ${expressions.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ConditionExpression: 'attribute_exists(PK)',
      ReturnValues: 'ALL_NEW',
    }),
  );

  return fromDbModel(result.Attributes);
}

async function deleteArtist(tenantId, id) {
  await documentClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildTenantPk(tenantId),
        SK: buildArtistSk(id),
      },
      ConditionExpression: 'attribute_exists(PK)',
    }),
  );
}

module.exports = {
  listArtists,
  findById,
  createArtist,
  updateArtist,
  deleteArtist,
};
