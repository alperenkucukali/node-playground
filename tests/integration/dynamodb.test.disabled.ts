import {
  CreateTableCommand,
  DeleteTableCommand,
  ListTablesCommand,
  waitUntilTableExists,
  waitUntilTableNotExists,
} from '@aws-sdk/client-dynamodb';
import { env } from '../../src/config/env';
import { dynamoClient } from '../../src/config/dynamodb';
import genreRepository from '../../src/modules/genres/genre.repository';
import artistRepository from '../../src/modules/artists/artist.repository';
import { GenreCreateInput } from '../../src/modules/genres/genre.types';
import { ArtistCreateInput } from '../../src/modules/artists/artist.types';

const TABLE_NAME = env.aws.tables.catalog;
const DISPLAY_ORDER_INDEX = 'DisplayOrderIndex';
const TEST_TENANT = 'integration-tenant';
const IS_LOCAL_ENDPOINT =
  Boolean(env.aws.dynamoEndpoint) &&
  /localhost|127\.0\.0\.1/i.test(env.aws.dynamoEndpoint as string);
const ALLOW_INTEGRATION_TESTS = false; // Toggle to true when you explicitly want to run these suites.
const SHOULD_ATTEMPT = ALLOW_INTEGRATION_TESTS && IS_LOCAL_ENDPOINT;

async function resetTable(): Promise<void> {
  await deleteTableIfExists();
  await createTable();
}

async function deleteTableIfExists(): Promise<void> {
  try {
    await dynamoClient.send(
      new DeleteTableCommand({
        TableName: TABLE_NAME,
      }),
    );
    await waitUntilTableNotExists(
      { client: dynamoClient, maxWaitTime: 60 },
      { TableName: TABLE_NAME },
    );
  } catch (error: any) {
    if (error?.name !== 'ResourceNotFoundException') {
      throw error;
    }
  }
}

async function createTable(): Promise<void> {
  await dynamoClient.send(
    new CreateTableCommand({
      TableName: TABLE_NAME,
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
          Projection: { ProjectionType: 'ALL' },
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    }),
  );

  await waitUntilTableExists({ client: dynamoClient, maxWaitTime: 60 }, { TableName: TABLE_NAME });
}

async function isDynamoReachable(): Promise<boolean> {
  try {
    await dynamoClient.send(new ListTablesCommand({ Limit: 1 }));
    return true;
  } catch (error) {
    console.warn('DynamoDB Local is not reachable. Ensure dynamodb-local is running.', error);
    throw new Error('DynamoDB Local is not reachable; aborting integration tests.');
  }
}

let dynamoReady = false;

const describeIntegration = SHOULD_ATTEMPT ? describe : describe.skip;

beforeAll(async () => {
  if (!SHOULD_ATTEMPT) {
    console.warn(
      'DynamoDB integration tests are disabled. Flip ALLOW_INTEGRATION_TESTS=true in tests/integration/dynamodb.test.disabled.ts when you explicitly want to run them locally.',
    );
    return;
  }
  dynamoReady = await isDynamoReachable();
  if (!dynamoReady) {
    console.warn('DynamoDB Local is not reachable; skipping integration suites.');
    return;
  }
  await resetTable();
});

afterEach(async () => {
  if (!SHOULD_ATTEMPT || !dynamoReady) {
    return;
  }
  await resetTable();
});

afterAll(async () => {
  if (!SHOULD_ATTEMPT || !dynamoReady) {
    return;
  }
  await deleteTableIfExists();
});

function uniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

describeIntegration('GenreRepository integration', () => {
  it('creates, finds, and lists genres', async () => {
    if (!dynamoReady) {
      return;
    }

    const input: GenreCreateInput = {
      id: uniqueId('genre'),
      texts: { en: 'Integration Genre' },
      displayOrder: 1,
    };

    const created = await genreRepository.createGenre(TEST_TENANT, input);
    expect(created).toMatchObject({ id: input.id, texts: input.texts });

    const found = await genreRepository.findById(TEST_TENANT, input.id);
    expect(found).not.toBeNull();
    expect(found).toMatchObject({ id: input.id, texts: input.texts });

    const list = await genreRepository.listGenres({ tenantId: TEST_TENANT, limit: 10 });
    expect(list.items.map((item) => item.id)).toContain(input.id);
  });
});

describeIntegration('ArtistRepository integration', () => {
  it('creates, updates, and deletes artists', async () => {
    if (!dynamoReady) {
      return;
    }

    const input: ArtistCreateInput = {
      id: uniqueId('artist'),
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
    };

    const created = await artistRepository.createArtist(TEST_TENANT, input);
    expect(created).toMatchObject({
      id: input.id,
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
    });

    const updated = await artistRepository.updateArtist(TEST_TENANT, input.id, {
      firstName: 'Jane',
    });
    expect(updated).toMatchObject({ id: input.id, firstName: 'Jane' });

    await artistRepository.deleteArtist(TEST_TENANT, input.id);
    const afterDelete = await artistRepository.findById(TEST_TENANT, input.id);
    expect(afterDelete).toBeNull();
  });
});
