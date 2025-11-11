jest.mock('../src/modules/artists/artist.repository', () => ({
  listArtists: jest.fn(),
  findById: jest.fn(),
  createArtist: jest.fn(),
  updateArtist: jest.fn(),
  deleteArtist: jest.fn(),
}));

const artistRepository = require('../src/modules/artists/artist.repository');
const artistService = require('../src/modules/artists/artist.service');
const ApiError = require('../src/utils/api-error');

describe('ArtistService', () => {
  const tenantId = 'tenant-1';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listArtists', () => {
    it('handles cursor encoding/decoding and forwards filters', async () => {
      const cursorObject = { PK: 'TENANT#tenant-1', SK: 'ARTIST#1' };
      const encoded = Buffer.from(JSON.stringify(cursorObject)).toString('base64');
      const nextCursor = { PK: 'TENANT#tenant-1', SK: 'ARTIST#2' };
      const expectedNext = Buffer.from(JSON.stringify(nextCursor)).toString('base64');

      artistRepository.listArtists.mockResolvedValue({
        items: [{ id: 'a1' }],
        lastEvaluatedKey: nextCursor,
      });

      const result = await artistService.listArtists({
        tenantId,
        cursor: encoded,
        limit: 10,
        isActive: true,
      });

      expect(artistRepository.listArtists).toHaveBeenCalledWith({
        tenantId,
        cursor: cursorObject,
        limit: 10,
        isActive: true,
      });
      expect(result).toEqual({
        items: [{ id: 'a1' }],
        nextCursor: expectedNext,
      });
    });

    it('throws bad request when cursor is invalid', async () => {
      await expect(
        artistService.listArtists({ tenantId, cursor: 'invalid' }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe('getArtist', () => {
    it('returns artist when found', async () => {
      const artist = { id: 'a1' };
      artistRepository.findById.mockResolvedValue(artist);

      const result = await artistService.getArtist(tenantId, 'a1');

      expect(artistRepository.findById).toHaveBeenCalledWith(tenantId, 'a1');
      expect(result).toBe(artist);
    });

    it('throws not found when missing', async () => {
      artistRepository.findById.mockResolvedValue(null);

      await expect(artistService.getArtist(tenantId, 'missing')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('createArtist', () => {
    it('persists and returns artist', async () => {
      const payload = { id: 'a1' };
      artistRepository.createArtist.mockResolvedValue(payload);

      const result = await artistService.createArtist(tenantId, payload);

      expect(artistRepository.createArtist).toHaveBeenCalledWith(tenantId, payload);
      expect(result).toBe(payload);
    });

    it('throws conflict on duplicate id', async () => {
      artistRepository.createArtist.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

      await expect(artistService.createArtist(tenantId, { id: 'a1' })).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  describe('updateArtist', () => {
    it('updates existing artist', async () => {
      const updated = { id: 'a1', firstName: 'Jane' };
      artistRepository.updateArtist.mockResolvedValue(updated);

      const result = await artistService.updateArtist(tenantId, 'a1', { firstName: 'Jane' });

      expect(artistRepository.updateArtist).toHaveBeenCalledWith(tenantId, 'a1', { firstName: 'Jane' });
      expect(result).toBe(updated);
    });

    it('throws not found when ConditionalCheck fails', async () => {
      artistRepository.updateArtist.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

      await expect(artistService.updateArtist(tenantId, 'missing', {})).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('deleteArtist', () => {
    it('removes artist', async () => {
      artistRepository.deleteArtist.mockResolvedValue();

      await artistService.deleteArtist(tenantId, 'a1');

      expect(artistRepository.deleteArtist).toHaveBeenCalledWith(tenantId, 'a1');
    });

    it('throws not found when delete fails', async () => {
      artistRepository.deleteArtist.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

      await expect(artistService.deleteArtist(tenantId, 'missing')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
