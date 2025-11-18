import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { documentClient as documentClientInstance } from '../../config/dynamodb';
import { env } from '../../config/env';
import { buildGenreSk, buildTenantPk, ENTITY } from '../common/dynamo-keys';
import { buildUpdateExpression } from '../common/dynamo/update-expression';
import {
  GenreCreateInput,
  GenreEntity,
  GenreListParams,
  GenreListResult,
  GenreUpdateInput,
} from './genre.types';

export class GenreRepository {
  private readonly tableName = env.aws.tables.catalog;
  private readonly displayOrderIndex = 'DisplayOrderIndex';

  constructor(private readonly client: DynamoDBDocumentClient = documentClientInstance) {}

  private fromDbModel(item?: Record<string, any> | null): GenreEntity | null {
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

  async listGenres(params: GenreListParams): Promise<GenreListResult> {
    const query: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: this.displayOrderIndex,
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: {
        '#pk': 'PK',
        '#entityType': 'EntityType',
      },
      ExpressionAttributeValues: {
        ':pk': buildTenantPk(params.tenantId),
        ':entityType': ENTITY.GENRE,
      },
      FilterExpression: '#entityType = :entityType',
      Limit: params.limit,
      ExclusiveStartKey: params.cursor as QueryCommandInput['ExclusiveStartKey'],
    };

    const result = await this.client.send(new QueryCommand(query));

    const items =
      result.Items?.map((item) => this.fromDbModel(item)).filter(
        (item): item is GenreEntity => !!item,
      ) || [];

    return {
      items,
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  }

  async findById(tenantId: string, id: string): Promise<GenreEntity | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: buildTenantPk(tenantId),
          SK: buildGenreSk(id),
        },
      }),
    );

    return this.fromDbModel(result.Item);
  }

  async createGenre(tenantId: string, entity: GenreCreateInput): Promise<GenreEntity> {
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

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item,
        ConditionExpression: 'attribute_not_exists(PK)',
      }),
    );

    const model = this.fromDbModel(item);
    if (!model) {
      throw new Error('Failed to create genre');
    }
    return model;
  }

  async updateGenre(tenantId: string, id: string, updates: GenreUpdateInput): Promise<GenreEntity> {
    const update = buildUpdateExpression(
      [
        { key: 'texts', attributeName: 'Texts', value: updates.texts },
        { key: 'displayOrder', attributeName: 'DisplayOrder', value: updates.displayOrder },
      ],
      'No updates provided',
    );

    const result = await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          PK: buildTenantPk(tenantId),
          SK: buildGenreSk(id),
        },
        UpdateExpression: update.expression,
        ExpressionAttributeNames: update.names,
        ExpressionAttributeValues: update.values,
        ConditionExpression: 'attribute_exists(PK)',
        ReturnValues: 'ALL_NEW',
      }),
    );

    const model = this.fromDbModel(result.Attributes);
    if (!model) {
      throw new Error('Failed to update genre');
    }
    return model;
  }

  async deleteGenre(tenantId: string, id: string): Promise<void> {
    await this.client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          PK: buildTenantPk(tenantId),
          SK: buildGenreSk(id),
        },
        ConditionExpression: 'attribute_exists(PK)',
      }),
    );
  }
}

const genreRepository = new GenreRepository();
export default genreRepository;
