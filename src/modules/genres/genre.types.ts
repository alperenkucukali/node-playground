export interface GenreEntity {
  id: string;
  texts: Record<string, string>;
  displayOrder: number;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenreCreateInput {
  id: string;
  texts: Record<string, string>;
  displayOrder: number;
}

export interface GenreUpdateInput {
  texts?: Record<string, string>;
  displayOrder?: number;
}

export interface GenreListParams {
  tenantId: string;
  limit?: number;
  cursor?: Record<string, unknown>;
}

export interface GenreListResult {
  items: GenreEntity[];
  lastEvaluatedKey?: Record<string, unknown>;
}

export interface GenreListQuery {
  tenantId: string;
  limit?: number;
  cursor?: string;
}

export interface GenreListResponse {
  items: GenreEntity[];
  nextCursor?: string;
}
