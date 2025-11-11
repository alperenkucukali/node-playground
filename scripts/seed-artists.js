const { env } = require('../src/config/env');
const logger = require('../src/config/logger');
const artistService = require('../src/modules/artists/artist.service');

const SAMPLE_ARTISTS = [
  { id: 'artist-al-pacino', firstName: 'Al', lastName: 'Pacino', isActive: true },
  { id: 'artist-robert-de-niro', firstName: 'Robert', lastName: 'De Niro', isActive: true },
  { id: 'artist-emma-stone', firstName: 'Emma', lastName: 'Stone', isActive: true },
];

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};

  args.forEach((arg, idx) => {
    if (arg.startsWith('--tenant=')) {
      result.tenantId = arg.split('=')[1];
    } else if (arg === '--tenant' && args[idx + 1]) {
      result.tenantId = args[idx + 1];
    }
  });

  return result;
}

async function seedArtists() {
  const { tenantId: tenantFromArg } = parseArgs();
  const tenantId = (tenantFromArg || env.tenant.defaultId || '').trim();

  if (!tenantId) {
    throw new Error('Tenant id is required. Provide --tenant=<id> or set DEFAULT_TENANT_ID');
  }

  logger.info(`Seeding ${SAMPLE_ARTISTS.length} artists for tenant ${tenantId}`);

  for (const artist of SAMPLE_ARTISTS) {
    try {
      const created = await artistService.createArtist(tenantId, artist);
      logger.info(`Inserted artist ${created.id}`);
    } catch (error) {
      if (error.statusCode === 409) {
        logger.warn(`Artist ${artist.id} already exists, skipping`);
      } else {
        throw error;
      }
    }
  }

  logger.info('Artist seeding completed');
}

seedArtists().catch((error) => {
  logger.error('Failed to seed artists', { error });
  process.exitCode = 1;
});
