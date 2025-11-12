const TENANT_PREFIX = 'TENANT#';
const GENRE_PREFIX = 'GENRE#';
const ARTIST_PREFIX = 'ARTIST#';

export const ENTITY = {
  GENRE: 'GENRE',
  ARTIST: 'ARTIST',
} as const;

export type EntityType = (typeof ENTITY)[keyof typeof ENTITY];

export const buildTenantPk = (tenantId: string): string => `${TENANT_PREFIX}${tenantId}`;
export const buildGenreSk = (genreId: string): string => `${GENRE_PREFIX}${genreId}`;
export const buildArtistSk = (artistId: string): string => `${ARTIST_PREFIX}${artistId}`;
