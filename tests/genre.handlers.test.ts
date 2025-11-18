import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { listGenres, getGenre, createGenre, updateGenre, deleteGenre } from '../src/modules/genres/handlers';
import genreService from '../src/modules/genres/genre.service';
import ApiError from '../src/core/api-error';
import { CommonMessages } from '../src/modules/common/messages';
import { GenreMessages } from '../src/modules/genres/genre.messages';
import { GenreEntity } from '../src/modules/genres/genre.types';
import { buildEvent, baseEvent } from './handlers.helpers';

jest.mock('../src/modules/genres/genre.service', () => ({
  __esModule: true,
  default: {
    listGenres: jest.fn(),
    getGenre: jest.fn(),
    createGenre: jest.fn(),
    updateGenre: jest.fn(),
    deleteGenre: jest.fn(),
  },
}));

const mockedGenreService = genreService as jest.Mocked<typeof genreService>;

describe('Genre handlers', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('listGenres returns localized success response with data', async () => {
    const mockGenre: GenreEntity = {
      id: 'drama',
      texts: { en: 'Drama' },
      displayOrder: 1,
      tenantId: 'tenant-1',
      createdAt: 'now',
      updatedAt: 'now',
    };

    mockedGenreService.listGenres.mockResolvedValue({
      items: [mockGenre],
      nextCursor: 'cursor-token',
    });

    const response = await listGenres(buildEvent());

    expect(typeof response).toBe('object');
    if (typeof response !== 'object') {
      throw new Error('Expected structured response');
    }
    expect(response.statusCode).toBe(200);
    expect(mockedGenreService.listGenres).toHaveBeenCalledWith(
      { tenantId: 'tenant-1', limit: undefined, cursor: undefined },
      'en-US',
    );

    const body = JSON.parse(response.body!);
    expect(body).toMatchObject({
      success: true,
      code: GenreMessages.LIST_SUCCESS.code,
      classId: GenreMessages.LIST_SUCCESS.classId,
      locale: 'en-US',
      requestId: baseEvent.requestContext?.requestId,
      data: {
        items: [expect.objectContaining({ id: 'drama' })],
        nextCursor: 'cursor-token',
      },
    });
  });

  it('listGenres surfaces ApiError from service layer', async () => {
    mockedGenreService.listGenres.mockRejectedValue(new ApiError(CommonMessages.INVALID_CURSOR, 'en-US'));

    const response = await listGenres(buildEvent());

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
      locale: 'en-US',
    });
  });

  it('getGenre returns genre payload', async () => {
    const mockGenre: GenreEntity = {
      id: 'drama',
      texts: { en: 'Drama' },
      displayOrder: 1,
      tenantId: 'tenant-1',
      createdAt: 'now',
      updatedAt: 'now',
    };
    mockedGenreService.getGenre.mockResolvedValue(mockGenre);

    const response = await getGenre(
      buildEvent({
        pathParameters: { id: 'drama' },
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
      data: mockGenre,
      code: GenreMessages.GET_SUCCESS.code,
    });
  });

  it('createGenre returns created payload', async () => {
    const mockGenre: GenreEntity = {
      id: 'drama',
      texts: { en: 'Drama' },
      displayOrder: 1,
      tenantId: 'tenant-1',
      createdAt: 'now',
      updatedAt: 'now',
    };
    mockedGenreService.createGenre.mockResolvedValue(mockGenre);

    const response = await createGenre(
      buildEvent({
        body: JSON.stringify({ id: 'drama', texts: { en: 'Drama' }, displayOrder: 1 }),
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
      data: mockGenre,
      code: GenreMessages.CREATED.code,
    });
  });

  it('updateGenre returns updated payload', async () => {
    const mockGenre: GenreEntity = {
      id: 'drama',
      texts: { en: 'Drama' },
      displayOrder: 1,
      tenantId: 'tenant-1',
      createdAt: 'now',
      updatedAt: 'later',
    };
    mockedGenreService.updateGenre.mockResolvedValue(mockGenre);

    const response = await updateGenre(
      buildEvent({
        pathParameters: { id: 'drama' },
        body: JSON.stringify({ displayOrder: 1 }),
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
      data: mockGenre,
      code: GenreMessages.UPDATED.code,
    });
  });

  it('deleteGenre returns success envelope without data', async () => {
    mockedGenreService.deleteGenre.mockResolvedValue();

    const response = await deleteGenre(
      buildEvent({
        pathParameters: { id: 'drama' },
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
      code: GenreMessages.DELETED.code,
    });
  });
});
