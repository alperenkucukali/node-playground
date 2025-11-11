const { env } = require('../src/config/env');
const logger = require('../src/config/logger');
const genreService = require('../src/modules/genres/genre.service');

const SAMPLE_GENRES = [
  { id: 'drama', texts: { en: 'Drama', tr: 'Dram' }, displayOrder: 1 },
  { id: 'action', texts: { en: 'Action', tr: 'Aksiyon' }, displayOrder: 2 },
  { id: 'comedy', texts: { en: 'Comedy', tr: 'Komedi' }, displayOrder: 3 },
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

async function seedGenres() {
  const { tenantId: tenantFromArg } = parseArgs();
  const tenantId = (tenantFromArg || env.tenant.defaultId || '').trim();

  if (!tenantId) {
    throw new Error('Tenant id is required. Provide --tenant=<id> or set DEFAULT_TENANT_ID');
  }

  logger.info(`Seeding ${SAMPLE_GENRES.length} genres for tenant ${tenantId}`);

  for (const genre of SAMPLE_GENRES) {
    try {
      const created = await genreService.createGenre(tenantId, genre);
      logger.info(`Inserted genre ${created.id}`);
    } catch (error) {
      if (error.statusCode === 409) {
        logger.warn(`Genre ${genre.id} already exists, skipping`);
      } else {
        throw error;
      }
    }
  }

  logger.info('Genre seeding completed');
}

seedGenres().catch((error) => {
  logger.error('Failed to seed genres', { error });
  process.exitCode = 1;
});
