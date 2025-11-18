import ApiError from '../../core/api-error';
import CursorCodec from '../../utils/cursor-codec';
import { CommonMessages } from '../common/messages';
import { ArtistMessages } from './artist.messages';
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

  async listArtists(params: ArtistListQuery, locale: string): Promise<ArtistListResponse> {
    const decodedCursor = this.cursorCodec.decode(params.cursor, () => new ApiError(CommonMessages.INVALID_CURSOR, locale));
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

  async getArtist(tenantId: string, id: string, locale: string): Promise<ArtistEntity> {
    const artist = await this.repository.findById(tenantId, id);
    if (!artist) {
      throw new ApiError(ArtistMessages.NOT_FOUND, locale, { id });
    }
    return artist;
  }

  async createArtist(tenantId: string, payload: ArtistCreateInput, locale: string): Promise<ArtistEntity> {
    try {
      return await this.repository.createArtist(tenantId, payload);
    } catch (error: any) {
      if (error?.name === 'ConditionalCheckFailedException') {
        throw new ApiError(ArtistMessages.ALREADY_EXISTS, locale, { id: payload.id });
      }
      throw error;
    }
  }

  async updateArtist(tenantId: string, id: string, payload: ArtistUpdateInput, locale: string): Promise<ArtistEntity> {
    try {
      return await this.repository.updateArtist(tenantId, id, payload);
    } catch (error: any) {
      if (error?.name === 'ConditionalCheckFailedException') {
        throw new ApiError(ArtistMessages.NOT_FOUND, locale, { id });
      }
      throw error;
    }
  }

  async deleteArtist(tenantId: string, id: string, locale: string): Promise<void> {
    try {
      await this.repository.deleteArtist(tenantId, id);
    } catch (error: any) {
      if (error?.name === 'ConditionalCheckFailedException') {
        throw new ApiError(ArtistMessages.NOT_FOUND, locale, { id });
      }
      throw error;
    }
  }
}

const artistService = new ArtistService(artistRepository);
export default artistService;
