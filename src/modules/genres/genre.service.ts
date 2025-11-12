import ApiError from '../../utils/api-error';
import CursorCodec from '../../utils/cursor-codec';
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

  async listGenres(params: GenreListQuery): Promise<GenreListResponse> {
    const decodedCursor = this.cursorCodec.decode(params.cursor);
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

  async getGenre(tenantId: string, id: string): Promise<GenreEntity> {
    const genre = await this.repository.findById(tenantId, id);
    if (!genre) {
      throw ApiError.notFound(`Genre ${id} not found`);
    }
    return genre;
  }

  async createGenre(tenantId: string, payload: GenreCreateInput): Promise<GenreEntity> {
    try {
      return await this.repository.createGenre(tenantId, payload);
    } catch (error: any) {
      if (error?.name === 'ConditionalCheckFailedException') {
        throw ApiError.conflict(`Genre ${payload.id} already exists`);
      }
      throw error;
    }
  }

  async updateGenre(tenantId: string, id: string, payload: GenreUpdateInput): Promise<GenreEntity> {
    try {
      return await this.repository.updateGenre(tenantId, id, payload);
    } catch (error: any) {
      if (error?.name === 'ConditionalCheckFailedException') {
        throw ApiError.notFound(`Genre ${id} not found`);
      }
      throw error;
    }
  }

  async deleteGenre(tenantId: string, id: string): Promise<void> {
    try {
      await this.repository.deleteGenre(tenantId, id);
    } catch (error: any) {
      if (error?.name === 'ConditionalCheckFailedException') {
        throw ApiError.notFound(`Genre ${id} not found`);
      }
      throw error;
    }
  }
}

const genreService = new GenreService(genreRepository);
export default genreService;
