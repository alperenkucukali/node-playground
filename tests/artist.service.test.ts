import ApiError from '../src/core/api-error';
import { ArtistService } from '../src/modules/artists/artist.service';
import { ArtistRepository } from '../src/modules/artists/artist.repository';
import { ArtistEntity } from '../src/modules/artists/artist.types';

describe('ArtistService', () => {
  const tenantId = 'tenant-1';
  const locale = 'en-US';
  let repository: jest.Mocked<ArtistRepository>;
  let service: ArtistService;

  beforeEach(() => {
    repository = {
      listArtists: jest.fn(),
      findById: jest.fn(),
      createArtist: jest.fn(),
      updateArtist: jest.fn(),
      deleteArtist: jest.fn(),
    } as unknown as jest.Mocked<ArtistRepository>;

    service = new ArtistService(repository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listArtists', () => {
    it('decodes cursor before querying and returns encoded next cursor', async () => {
      const cursorObject = { PK: 'TENANT#tenant-1', SK: 'ARTIST#1' };
      const encodedCursor = Buffer.from(JSON.stringify(cursorObject)).toString('base64');
      const nextCursorObject = { PK: 'TENANT#tenant-1', SK: 'ARTIST#2' };
      const expectedNextCursor = Buffer.from(JSON.stringify(nextCursorObject)).toString('base64');
      const items: ArtistEntity[] = [
        {
          id: 'artist-1',
          firstName: 'Al',
          lastName: 'Pacino',
          isActive: true,
          tenantId,
          createdAt: 'now',
          updatedAt: 'now',
        },
      ];

      repository.listArtists.mockResolvedValue({
        items,
        lastEvaluatedKey: nextCursorObject,
      });

      const result = await service.listArtists({ tenantId, limit: 5, cursor: encodedCursor, isActive: true }, locale);

      expect(repository.listArtists).toHaveBeenCalledWith({
        tenantId,
        limit: 5,
        cursor: cursorObject,
        isActive: true,
      });
      expect(result).toEqual({ items, nextCursor: expectedNextCursor });
    });

    it('throws ApiError.badRequest when cursor token is invalid', async () => {
      await expect(service.listArtists({ tenantId, cursor: '***' }, locale)).rejects.toBeInstanceOf(ApiError);
      await expect(service.listArtists({ tenantId, cursor: '***' }, locale)).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  describe('getArtist', () => {
    it('returns artist when found', async () => {
      const artist: ArtistEntity = {
        id: 'artist-1',
        firstName: 'Al',
        lastName: 'Pacino',
        isActive: true,
        tenantId,
        createdAt: 'now',
        updatedAt: 'now',
      };
      repository.findById.mockResolvedValue(artist);

      const result = await service.getArtist(tenantId, 'artist-1', locale);

      expect(repository.findById).toHaveBeenCalledWith(tenantId, 'artist-1');
      expect(result).toBe(artist);
    });

    it('throws 404 when artist not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getArtist(tenantId, 'missing', locale)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('createArtist', () => {
    it('persists artist and returns it', async () => {
      const payload = { id: 'artist-1', firstName: 'Al', lastName: 'Pacino', isActive: true };
      const created: ArtistEntity = {
        ...payload,
        tenantId,
        createdAt: 'now',
        updatedAt: 'now',
      };
      repository.createArtist.mockResolvedValue(created);

      const result = await service.createArtist(tenantId, payload, locale);

      expect(repository.createArtist).toHaveBeenCalledWith(tenantId, payload);
      expect(result).toBe(created);
    });

    it('throws conflict when id already exists', async () => {
      repository.createArtist.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

      await expect(
        service.createArtist(tenantId, { id: 'artist-1', firstName: 'Al', lastName: 'Pacino', isActive: true }, locale),
      ).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  describe('updateArtist', () => {
    it('updates and returns latest entity', async () => {
      const updated: ArtistEntity = {
        id: 'artist-1',
        firstName: 'New',
        lastName: 'Name',
        isActive: true,
        tenantId,
        createdAt: 'before',
        updatedAt: 'after',
      };
      repository.updateArtist.mockResolvedValue(updated);

      const result = await service.updateArtist(tenantId, 'artist-1', { firstName: 'New' }, locale);

      expect(repository.updateArtist).toHaveBeenCalledWith(tenantId, 'artist-1', { firstName: 'New' });
      expect(result).toBe(updated);
    });

    it('throws not found when update fails due to missing entity', async () => {
      repository.updateArtist.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

      await expect(service.updateArtist(tenantId, 'missing', {}, locale)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('deleteArtist', () => {
    it('removes entity when exists', async () => {
      repository.deleteArtist.mockResolvedValue();

      await service.deleteArtist(tenantId, 'artist-1', locale);

      expect(repository.deleteArtist).toHaveBeenCalledWith(tenantId, 'artist-1');
    });

    it('throws not found when delete fails', async () => {
      repository.deleteArtist.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

      await expect(service.deleteArtist(tenantId, 'missing', locale)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
