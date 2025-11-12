import ApiError from '../../utils/api-error';
import CursorCodec from '../../utils/cursor-codec';
import artistRepository, { ArtistRepository } from './artist.repository';
import {
  ArtistCreateInput,
  ArtistEntity,
  ArtistListQuery,
  ArtistListResponse,
  ArtistUpdateInput,
} from './artist.types';

export class ArtistService {
  private readonly cursorCodec = new CursorCodec<Record<string, unknown>>();

  constructor(private readonly repository: ArtistRepository) {}

  async listArtists(params: ArtistListQuery): Promise<ArtistListResponse> {
    const decodedCursor = this.cursorCodec.decode(params.cursor);
    const result = await this.repository.listArtists({
      tenantId: params.tenantId,
      limit: params.limit,
      cursor: decodedCursor,
      isActive: params.isActive,
    });

    return {
      items: result.items,
      nextCursor: this.cursorCodec.encode(result.lastEvaluatedKey),
    };
  }

  async getArtist(tenantId: string, id: string): Promise<ArtistEntity> {
    const artist = await this.repository.findById(tenantId, id);
    if (!artist) {
      throw ApiError.notFound(`Artist ${id} not found`);
    }
    return artist;
  }

  async createArtist(tenantId: string, payload: ArtistCreateInput): Promise<ArtistEntity> {
    try {
      return await this.repository.createArtist(tenantId, payload);
    } catch (error: any) {
      if (error?.name === 'ConditionalCheckFailedException') {
        throw ApiError.conflict(`Artist ${payload.id} already exists`);
      }
      throw error;
    }
  }

  async updateArtist(tenantId: string, id: string, payload: ArtistUpdateInput): Promise<ArtistEntity> {
    try {
      return await this.repository.updateArtist(tenantId, id, payload);
    } catch (error: any) {
      if (error?.name === 'ConditionalCheckFailedException') {
        throw ApiError.notFound(`Artist ${id} not found`);
      }
      throw error;
    }
  }

  async deleteArtist(tenantId: string, id: string): Promise<void> {
    try {
      await this.repository.deleteArtist(tenantId, id);
    } catch (error: any) {
      if (error?.name === 'ConditionalCheckFailedException') {
        throw ApiError.notFound(`Artist ${id} not found`);
      }
      throw error;
    }
  }
}

const artistService = new ArtistService(artistRepository);
export default artistService;
