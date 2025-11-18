import ApiError from '../src/core/api-error';
import { GenreService } from '../src/modules/genres/genre.service';
import { GenreRepository } from '../src/modules/genres/genre.repository';
import { GenreEntity } from '../src/modules/genres/genre.types';

describe('GenreService', () => {
  const tenantId = 'tenant-1';
  const locale = 'en-US';
  let repository: jest.Mocked<GenreRepository>;
  let service: GenreService;

  beforeEach(() => {
    repository = {
      listGenres: jest.fn(),
      findById: jest.fn(),
      createGenre: jest.fn(),
      updateGenre: jest.fn(),
      deleteGenre: jest.fn(),
    } as unknown as jest.Mocked<GenreRepository>;

    service = new GenreService(repository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listGenres', () => {
    it('decodes cursor before querying and returns encoded next cursor', async () => {
      const cursorObject = { id: 'abc' };
      const encodedCursor = Buffer.from(JSON.stringify(cursorObject)).toString('base64');
      const nextCursorObject = { id: 'next' };
      const expectedNextCursor = Buffer.from(JSON.stringify(nextCursorObject)).toString('base64');
      const items: GenreEntity[] = [
        {
          id: 'drama',
          texts: { en: 'Drama' },
          displayOrder: 1,
          tenantId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      repository.listGenres.mockResolvedValue({
        items,
        lastEvaluatedKey: nextCursorObject,
      });

      const result = await service.listGenres({ tenantId, limit: 5, cursor: encodedCursor }, locale);

      expect(repository.listGenres).toHaveBeenCalledWith({
        tenantId,
        limit: 5,
        cursor: cursorObject,
      });
      expect(result).toEqual({ items, nextCursor: expectedNextCursor });
    });

    it('throws ApiError.badRequest when cursor token is invalid', async () => {
      await expect(service.listGenres({ tenantId, cursor: '***' }, locale)).rejects.toBeInstanceOf(ApiError);
      await expect(service.listGenres({ tenantId, cursor: '***' }, locale)).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  describe('getGenre', () => {
    it('returns genre when found', async () => {
      const genre: GenreEntity = {
        id: 'drama',
        texts: { en: 'Drama' },
        displayOrder: 1,
        tenantId,
        createdAt: 'now',
        updatedAt: 'now',
      };
      repository.findById.mockResolvedValue(genre);

      const result = await service.getGenre(tenantId, 'drama', locale);

      expect(repository.findById).toHaveBeenCalledWith(tenantId, 'drama');
      expect(result).toBe(genre);
    });

    it('throws 404 when genre not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getGenre(tenantId, 'missing', locale)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('createGenre', () => {
    it('persists genre and returns it', async () => {
      const payload = { id: 'drama', displayOrder: 1, texts: { en: 'Drama' } };
      const created: GenreEntity = {
        ...payload,
        tenantId,
        createdAt: 'now',
        updatedAt: 'now',
      };
      repository.createGenre.mockResolvedValue(created);

      const result = await service.createGenre(tenantId, payload, locale);

      expect(repository.createGenre).toHaveBeenCalledWith(tenantId, payload);
      expect(result).toBe(created);
    });

    it('throws conflict when id already exists', async () => {
      repository.createGenre.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

      await expect(service.createGenre(tenantId, { id: 'drama', displayOrder: 1, texts: { en: 'Drama' } }, locale)).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  describe('updateGenre', () => {
    it('updates and returns latest entity', async () => {
      const updated: GenreEntity = {
        id: 'drama',
        displayOrder: 2,
        texts: { en: 'Drama' },
        tenantId,
        createdAt: 'now',
        updatedAt: 'later',
      };
      repository.updateGenre.mockResolvedValue(updated);

      const result = await service.updateGenre(tenantId, 'drama', { displayOrder: 2 }, locale);

      expect(repository.updateGenre).toHaveBeenCalledWith(tenantId, 'drama', { displayOrder: 2 });
      expect(result).toBe(updated);
    });

    it('throws not found when update fails due to missing entity', async () => {
      repository.updateGenre.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

      await expect(service.updateGenre(tenantId, 'missing', {}, locale)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('deleteGenre', () => {
    it('removes entity when exists', async () => {
      repository.deleteGenre.mockResolvedValue();

      await service.deleteGenre(tenantId, 'drama', locale);

      expect(repository.deleteGenre).toHaveBeenCalledWith(tenantId, 'drama');
    });

    it('throws not found when delete fails', async () => {
      repository.deleteGenre.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

      await expect(service.deleteGenre(tenantId, 'missing', locale)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
