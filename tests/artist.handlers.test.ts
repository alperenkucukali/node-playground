import { createArtist, deleteArtist, getArtist, listArtists, updateArtist } from '../src/modules/artists/handlers';
import artistService from '../src/modules/artists/artist.service';
import ApiError from '../src/core/api-error';
import { ArtistMessages } from '../src/modules/artists/artist.messages';
import { CommonMessages } from '../src/modules/common/messages';
import { ArtistEntity } from '../src/modules/artists/artist.types';
import { buildEvent, baseEvent } from './handlers.helpers';

jest.mock('../src/modules/artists/artist.service', () => ({
  __esModule: true,
  default: {
    listArtists: jest.fn(),
    getArtist: jest.fn(),
    createArtist: jest.fn(),
    updateArtist: jest.fn(),
    deleteArtist: jest.fn(),
  },
}));

const mockedArtistService = artistService as jest.Mocked<typeof artistService>;

describe('Artist handlers', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('listArtists returns localized success response with data', async () => {
    const mockArtist: ArtistEntity = {
      id: 'artist-1',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      tenantId: 'tenant-1',
      createdAt: 'now',
      updatedAt: 'now',
    };

    mockedArtistService.listArtists.mockResolvedValue({
      items: [mockArtist],
      nextCursor: 'cursor-token',
    });

    const response = await listArtists(buildEvent());

    expect(typeof response).toBe('object');
    if (typeof response !== 'object') {
      throw new Error('Expected structured response');
    }

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body!);
    expect(body).toMatchObject({
      success: true,
      code: ArtistMessages.LIST_SUCCESS.code,
      locale: 'en-US',
      requestId: baseEvent.requestContext?.requestId,
      data: {
        items: [expect.objectContaining({ id: 'artist-1' })],
        nextCursor: 'cursor-token',
      },
    });
  });

  it('listArtists surfaces service errors', async () => {
    mockedArtistService.listArtists.mockRejectedValue(new ApiError(CommonMessages.INVALID_CURSOR, 'en-US'));

    const response = await listArtists(buildEvent());
    expect(typeof response).toBe('object');
    if (typeof response !== 'object') {
      throw new Error('Expected structured response');
    }

    expect(response.statusCode).toBe(CommonMessages.INVALID_CURSOR.httpStatus);
    const body = JSON.parse(response.body!);
    expect(body).toMatchObject({
      success: false,
      code: CommonMessages.INVALID_CURSOR.code,
      classId: CommonMessages.INVALID_CURSOR.classId,
    });
  });

  it('getArtist returns artist payload', async () => {
    const mockArtist: ArtistEntity = {
      id: 'artist-1',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      tenantId: 'tenant-1',
      createdAt: 'now',
      updatedAt: 'now',
    };
    mockedArtistService.getArtist.mockResolvedValue(mockArtist);

    const response = await getArtist(
      buildEvent({
        pathParameters: { id: 'artist-1' },
      }),
    );

    expect(typeof response).toBe('object');
    if (typeof response !== 'object') {
      throw new Error('Expected structured response');
    }
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body!);
    expect(body).toMatchObject({
      success: true,
      data: mockArtist,
      code: ArtistMessages.GET_SUCCESS.code,
    });
  });

  it('createArtist returns created payload', async () => {
    const mockArtist: ArtistEntity = {
      id: 'artist-1',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      tenantId: 'tenant-1',
      createdAt: 'now',
      updatedAt: 'now',
    };
    mockedArtistService.createArtist.mockResolvedValue(mockArtist);

    const response = await createArtist(
      buildEvent({
        body: JSON.stringify({
          id: 'artist-1',
          firstName: 'John',
          lastName: 'Doe',
        }),
      }),
    );

    expect(typeof response).toBe('object');
    if (typeof response !== 'object') {
      throw new Error('Expected structured response');
    }

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body!);
    expect(body).toMatchObject({
      success: true,
      data: mockArtist,
      code: ArtistMessages.CREATED.code,
    });
  });

  it('updateArtist returns updated payload', async () => {
    const mockArtist: ArtistEntity = {
      id: 'artist-1',
      firstName: 'Jane',
      lastName: 'Doe',
      isActive: true,
      tenantId: 'tenant-1',
      createdAt: 'before',
      updatedAt: 'after',
    };
    mockedArtistService.updateArtist.mockResolvedValue(mockArtist);

    const response = await updateArtist(
      buildEvent({
        pathParameters: { id: 'artist-1' },
        body: JSON.stringify({ firstName: 'Jane' }),
      }),
    );

    expect(typeof response).toBe('object');
    if (typeof response !== 'object') {
      throw new Error('Expected structured response');
    }
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body!);
    expect(body).toMatchObject({
      success: true,
      data: mockArtist,
      code: ArtistMessages.UPDATED.code,
    });
  });

  it('deleteArtist returns success envelope', async () => {
    mockedArtistService.deleteArtist.mockResolvedValue();
    const response = await deleteArtist(
      buildEvent({
        pathParameters: { id: 'artist-1' },
      }),
    );

    expect(typeof response).toBe('object');
    if (typeof response !== 'object') {
      throw new Error('Expected structured response');
    }
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body!);
    expect(body).toMatchObject({
      success: true,
      code: ArtistMessages.DELETED.code,
    });
  });
});
