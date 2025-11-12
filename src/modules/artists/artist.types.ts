export interface ArtistEntity {
  id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArtistCreateInput {
  id: string;
  firstName: string;
  lastName: string;
  isActive?: boolean;
}

export interface ArtistUpdateInput {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface ArtistListParams {
  tenantId: string;
  limit?: number;
  cursor?: Record<string, unknown>;
  isActive?: boolean;
}

export interface ArtistListResult {
  items: ArtistEntity[];
  lastEvaluatedKey?: Record<string, unknown>;
}

export interface ArtistListQuery {
  tenantId: string;
  limit?: number;
  cursor?: string;
  isActive?: boolean;
}

export interface ArtistListResponse {
  items: ArtistEntity[];
  nextCursor?: string;
}
