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
import { buildArtistSk, buildTenantPk, ENTITY } from '../common/dynamo-keys';
import { buildUpdateExpression } from '../common/dynamo/update-expression';
import {
  ArtistCreateInput,
  ArtistEntity,
  ArtistListParams,
  ArtistListResult,
  ArtistUpdateInput,
} from './artist.types';

export class ArtistRepository {
  private readonly tableName = env.aws.tables.catalog;

  constructor(private readonly client: DynamoDBDocumentClient = documentClientInstance) {}

  private fromDbModel(item?: Record<string, any> | null): ArtistEntity | null {
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

  async listArtists(params: ArtistListParams): Promise<ArtistListResult> {
    const query: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :skPrefix)',
      ExpressionAttributeNames: {
        '#pk': 'PK',
        '#sk': 'SK',
      },
      ExpressionAttributeValues: {
        ':pk': buildTenantPk(params.tenantId),
        ':skPrefix': 'ARTIST#',
      },
      Limit: params.limit,
      ExclusiveStartKey: params.cursor as QueryCommandInput['ExclusiveStartKey'],
    };

    if (typeof params.isActive === 'boolean') {
      query.FilterExpression = '#isActive = :isActive';
      query.ExpressionAttributeNames = {
        ...query.ExpressionAttributeNames,
        '#isActive': 'IsActive',
      };
      query.ExpressionAttributeValues = {
        ...query.ExpressionAttributeValues,
        ':isActive': params.isActive,
      };
    }

    const result = await this.client.send(new QueryCommand(query));

    const items =
      result.Items?.map((item) => this.fromDbModel(item)).filter((item): item is ArtistEntity => !!item) || [];

    return {
      items,
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  }

  async findById(tenantId: string, id: string): Promise<ArtistEntity | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: buildTenantPk(tenantId),
          SK: buildArtistSk(id),
        },
      }),
    );

    return this.fromDbModel(result.Item);
  }

  async createArtist(tenantId: string, entity: ArtistCreateInput): Promise<ArtistEntity> {
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

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item,
        ConditionExpression: 'attribute_not_exists(PK)',
      }),
    );

    const model = this.fromDbModel(item);
    if (!model) {
      throw new Error('Failed to create artist');
    }
    return model;
  }

  async updateArtist(tenantId: string, id: string, updates: ArtistUpdateInput): Promise<ArtistEntity> {
    const update = buildUpdateExpression(
      [
        { key: 'firstName', attributeName: 'FirstName', value: updates.firstName },
        { key: 'lastName', attributeName: 'LastName', value: updates.lastName },
        { key: 'isActive', attributeName: 'IsActive', value: updates.isActive },
      ],
      'No updates provided',
    );

    const result = await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          PK: buildTenantPk(tenantId),
          SK: buildArtistSk(id),
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
      throw new Error('Failed to update artist');
    }
    return model;
  }

  async deleteArtist(tenantId: string, id: string): Promise<void> {
    await this.client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          PK: buildTenantPk(tenantId),
          SK: buildArtistSk(id),
        },
        ConditionExpression: 'attribute_exists(PK)',
      }),
    );
  }
}

const artistRepository = new ArtistRepository();
export default artistRepository;
