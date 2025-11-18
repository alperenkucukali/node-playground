import ApiError from '../../core/api-error';
import CursorCodec from '../../utils/cursor-codec';
import { CommonMessages } from '../common/messages';
import { GenreMessages } from './genre.messages';
import genreRepository, { GenreRepository } from './genre.repository';
import {
  GenreCreateInput,
  GenreEntity,
  GenreListQuery,
  GenreListResponse,
  GenreUpdateInput,
} from './genre.types';

export class GenreService {
  private readonly cursorCodec = new CursorCodec<Record<string, unknown>>();

  constructor(private readonly repository: GenreRepository) {}

  async listGenres(params: GenreListQuery, locale: string): Promise<GenreListResponse> {
    const decodedCursor = this.cursorCodec.decode(
      params.cursor,
      () => new ApiError(CommonMessages.INVALID_CURSOR, locale),
    );
    const result = await this.repository.listGenres({
      tenantId: params.tenantId,
      limit: params.limit,
      cursor: decodedCursor,
    });

    return {
      items: result.items,
      nextCursor: this.cursorCodec.encode(result.lastEvaluatedKey),
    };
  }

  async getGenre(tenantId: string, id: string, locale: string): Promise<GenreEntity> {
    const genre = await this.repository.findById(tenantId, id);
    if (!genre) {
      throw new ApiError(GenreMessages.NOT_FOUND, locale, { id });
    }
    return genre;
  }

  async createGenre(
    tenantId: string,
    payload: GenreCreateInput,
    locale: string,
  ): Promise<GenreEntity> {
    try {
      return await this.repository.createGenre(tenantId, payload);
    } catch (error: any) {
      if (error?.name === 'ConditionalCheckFailedException') {
        throw new ApiError(GenreMessages.ALREADY_EXISTS, locale, { id: payload.id });
      }
      throw error;
    }
  }

  async updateGenre(
    tenantId: string,
    id: string,
    payload: GenreUpdateInput,
    locale: string,
  ): Promise<GenreEntity> {
    try {
      return await this.repository.updateGenre(tenantId, id, payload);
    } catch (error: any) {
      if (error?.name === 'ConditionalCheckFailedException') {
        throw new ApiError(GenreMessages.NOT_FOUND, locale, { id });
      }
      throw error;
    }
  }

  async deleteGenre(tenantId: string, id: string, locale: string): Promise<void> {
    try {
      await this.repository.deleteGenre(tenantId, id);
    } catch (error: any) {
      if (error?.name === 'ConditionalCheckFailedException') {
        throw new ApiError(GenreMessages.NOT_FOUND, locale, { id });
      }
      throw error;
    }
  }
}

const genreService = new GenreService(genreRepository);
export default genreService;
