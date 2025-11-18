import { listGenres } from '../../src/modules/genres/handlers';
import genreService from '../../src/modules/genres/genre.service';
import ApiError from '../../src/core/api-error';
import { GenreMessages } from '../../src/modules/genres/genre.messages';
import { CommonMessages } from '../../src/modules/common/messages';
import { buildEvent } from '../handlers.helpers';

type SuccessContract<T> = {
  success: true;
  code: number;
  message: string;
  classId: string;
  locale: string;
  requestId: string;
  data: T;
};

type ErrorContract = {
  success: false;
  code: number;
  message: string;
  classId: string;
  locale: string;
  requestId: string;
};

jest.mock('../../src/modules/genres/genre.service', () => ({
  __esModule: true,
  default: {
    listGenres: jest.fn(),
  },
}));

const mockedGenreService = genreService as jest.Mocked<typeof genreService>;

function assertSuccessContract<T>(body: any): asserts body is SuccessContract<T> {
  expect(body).toMatchObject({
    success: true,
    code: expect.any(Number),
    message: expect.any(String),
    classId: expect.any(String),
    locale: expect.any(String),
    requestId: expect.any(String),
  });
}

function assertErrorContract(body: any): asserts body is ErrorContract {
  expect(body).toMatchObject({
    success: false,
    code: expect.any(Number),
    message: expect.any(String),
    classId: expect.any(String),
    locale: expect.any(String),
    requestId: expect.any(String),
  });
}

describe('API contract', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('matches success contract for listGenres handler', async () => {
    mockedGenreService.listGenres.mockResolvedValue({ items: [], nextCursor: undefined });

    const response = await listGenres(buildEvent());
    expect(typeof response).toBe('object');
    if (typeof response !== 'object') {
      throw new Error('Expected structured response');
    }

    const body = JSON.parse(response.body!);
    assertSuccessContract(body);
    expect(body.code).toBe(GenreMessages.LIST_SUCCESS.code);
  });

  it('matches error contract for listGenres handler failures', async () => {
    mockedGenreService.listGenres.mockRejectedValue(
      new ApiError(CommonMessages.INVALID_CURSOR, 'en-US'),
    );

    const response = await listGenres(buildEvent());
    if (typeof response !== 'object') {
      throw new Error('Expected structured response');
    }

    const body = JSON.parse(response.body!);
    assertErrorContract(body);
    expect(body.code).toBe(CommonMessages.INVALID_CURSOR.code);
  });
});
