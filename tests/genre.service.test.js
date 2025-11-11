jest.mock('../src/modules/genres/genre.repository', () => ({
  listGenres: jest.fn(),
  findById: jest.fn(),
  createGenre: jest.fn(),
  updateGenre: jest.fn(),
  deleteGenre: jest.fn(),
}));

const genreRepository = require('../src/modules/genres/genre.repository');
const genreService = require('../src/modules/genres/genre.service');
const ApiError = require('../src/utils/api-error');

describe('GenreService', () => {
  const tenantId = 'tenant-1';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listGenres', () => {
    it('decodes cursor before querying and returns encoded next cursor', async () => {
      const cursorObject = { id: 'abc' };
      const encodedCursor = Buffer.from(JSON.stringify(cursorObject)).toString('base64');
      const nextCursorObject = { id: 'next' };
      const expectedNextCursor = Buffer.from(JSON.stringify(nextCursorObject)).toString('base64');
      const items = [{ id: 'drama' }];

      genreRepository.listGenres.mockResolvedValue({
        items,
        lastEvaluatedKey: nextCursorObject,
      });

      const result = await genreService.listGenres({ tenantId, limit: 5, cursor: encodedCursor });

      expect(genreRepository.listGenres).toHaveBeenCalledWith({
        tenantId,
        limit: 5,
        cursor: cursorObject,
      });
      expect(result).toEqual({ items, nextCursor: expectedNextCursor });
    });

    it('throws ApiError.badRequest when cursor token is invalid', async () => {
      await expect(genreService.listGenres({ tenantId, cursor: '***' })).rejects.toBeInstanceOf(ApiError);
      await expect(genreService.listGenres({ tenantId, cursor: '***' })).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  describe('getGenre', () => {
    it('returns genre when found', async () => {
      const genre = { id: 'drama' };
      genreRepository.findById.mockResolvedValue(genre);

      const result = await genreService.getGenre(tenantId, 'drama');

      expect(genreRepository.findById).toHaveBeenCalledWith(tenantId, 'drama');
      expect(result).toBe(genre);
    });

    it('throws 404 when genre not found', async () => {
      genreRepository.findById.mockResolvedValue(null);

      await expect(genreService.getGenre(tenantId, 'missing')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('createGenre', () => {
    it('persists genre and returns it', async () => {
      const payload = { id: 'drama' };
      genreRepository.createGenre.mockResolvedValue(payload);

      const result = await genreService.createGenre(tenantId, payload);

      expect(genreRepository.createGenre).toHaveBeenCalledWith(tenantId, payload);
      expect(result).toBe(payload);
    });

    it('throws conflict when id already exists', async () => {
      genreRepository.createGenre.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

      await expect(genreService.createGenre(tenantId, { id: 'drama' })).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  describe('updateGenre', () => {
    it('updates and returns latest entity', async () => {
      const updated = { id: 'drama', displayOrder: 2 };
      genreRepository.updateGenre.mockResolvedValue(updated);

      const result = await genreService.updateGenre(tenantId, 'drama', { displayOrder: 2 });

      expect(genreRepository.updateGenre).toHaveBeenCalledWith(tenantId, 'drama', { displayOrder: 2 });
      expect(result).toBe(updated);
    });

    it('throws not found when update fails due to missing entity', async () => {
      genreRepository.updateGenre.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

      await expect(genreService.updateGenre(tenantId, 'missing', {})).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('deleteGenre', () => {
    it('removes entity when exists', async () => {
      genreRepository.deleteGenre.mockResolvedValue();

      await genreService.deleteGenre(tenantId, 'drama');

      expect(genreRepository.deleteGenre).toHaveBeenCalledWith(tenantId, 'drama');
    });

    it('throws not found when delete fails', async () => {
      genreRepository.deleteGenre.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

      await expect(genreService.deleteGenre(tenantId, 'missing')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
