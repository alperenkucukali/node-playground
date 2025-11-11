const TENANT_PREFIX = 'TENANT#';
const GENRE_PREFIX = 'GENRE#';
const ARTIST_PREFIX = 'ARTIST#';

const ENTITY = {
  GENRE: 'GENRE',
  ARTIST: 'ARTIST',
};

const buildTenantPk = (tenantId) => `${TENANT_PREFIX}${tenantId}`;
const buildGenreSk = (genreId) => `${GENRE_PREFIX}${genreId}`;
const buildArtistSk = (artistId) => `${ARTIST_PREFIX}${artistId}`;

module.exports = {
  ENTITY,
  buildTenantPk,
  buildGenreSk,
  buildArtistSk,
};
