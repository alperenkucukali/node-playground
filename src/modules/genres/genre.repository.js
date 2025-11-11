const {
  PutCommand,
  GetCommand,
  DeleteCommand,
  UpdateCommand,
  QueryCommand,
} = require('@aws-sdk/lib-dynamodb');
const { documentClient } = require('../../config/dynamodb');
const { env } = require('../../config/env');
const { buildTenantPk, buildGenreSk, ENTITY } = require('../common/dynamo-keys');

const TABLE_NAME = env.aws.tables.catalog;
const DISPLAY_ORDER_INDEX = 'DisplayOrderIndex';

function fromDbModel(item) {
  if (!item) {
    return null;
  }

  return {
    id: item.GenreId,
    texts: item.Texts,
    displayOrder: item.DisplayOrder,
    tenantId: item.TenantId,
    createdAt: item.CreatedAt,
    updatedAt: item.UpdatedAt,
  };
}

async function listGenres({ tenantId, limit, cursor } = {}) {
  const params = {
    TableName: TABLE_NAME,
    IndexName: DISPLAY_ORDER_INDEX,
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames: {
      '#pk': 'PK',
      '#entityType': 'EntityType',
    },
    ExpressionAttributeValues: {
      ':pk': buildTenantPk(tenantId),
      ':entityType': ENTITY.GENRE,
    },
    FilterExpression: '#entityType = :entityType',
    Limit: limit,
    ExclusiveStartKey: cursor || undefined,
  };

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
        SK: buildGenreSk(id),
      },
    }),
  );

  return fromDbModel(result.Item);
}

async function createGenre(tenantId, entity) {
  const now = new Date().toISOString();
  const item = {
    PK: buildTenantPk(tenantId),
    SK: buildGenreSk(entity.id),
    EntityType: ENTITY.GENRE,
    GenreId: entity.id,
    Texts: entity.texts,
    DisplayOrder: entity.displayOrder,
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

async function updateGenre(tenantId, id, updates) {
  const expressions = [];
  const names = { '#updatedAt': 'UpdatedAt' };
  const values = { ':updatedAt': new Date().toISOString() };

  expressions.push('#updatedAt = :updatedAt');

  if (updates.texts !== undefined) {
    expressions.push('#texts = :texts');
    names['#texts'] = 'Texts';
    values[':texts'] = updates.texts;
  }

  if (updates.displayOrder !== undefined) {
    expressions.push('#displayOrder = :displayOrder');
    names['#displayOrder'] = 'DisplayOrder';
    values[':displayOrder'] = updates.displayOrder;
  }

  if (expressions.length === 1) {
    throw new Error('No updates provided');
  }

  const result = await documentClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildTenantPk(tenantId),
        SK: buildGenreSk(id),
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

async function deleteGenre(tenantId, id) {
  await documentClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildTenantPk(tenantId),
        SK: buildGenreSk(id),
      },
      ConditionExpression: 'attribute_exists(PK)',
    }),
  );
}

module.exports = {
  listGenres,
  findById,
  createGenre,
  updateGenre,
  deleteGenre,
};
