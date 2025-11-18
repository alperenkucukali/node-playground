import { env } from '../src/config/env';
import logger from '../src/config/logger';
import genreService from '../src/modules/genres/genre.service';
import { GenreCreateInput } from '../src/modules/genres/genre.types';

const SAMPLE_GENRES: GenreCreateInput[] = [
  { id: 'drama', texts: { en: 'Drama', tr: 'Dram' }, displayOrder: 1 },
  { id: 'action', texts: { en: 'Action', tr: 'Aksiyon' }, displayOrder: 2 },
  { id: 'comedy', texts: { en: 'Comedy', tr: 'Komedi' }, displayOrder: 3 },
];

interface SeedArgs {
  tenantId?: string;
}

function parseArgs(): SeedArgs {
  const args = process.argv.slice(2);
  const result: SeedArgs = {};

  args.forEach((arg, idx) => {
    if (arg.startsWith('--tenant=')) {
      result.tenantId = arg.split('=')[1];
    } else if (arg === '--tenant' && args[idx + 1]) {
      result.tenantId = args[idx + 1];
    }
  });

  return result;
}

async function seedGenres(): Promise<void> {
  const { tenantId: tenantFromArg } = parseArgs();
  const tenantId = (tenantFromArg || env.tenant.defaultId || '').trim();
  const locale = 'en-US';

  if (!tenantId) {
    throw new Error('Tenant id is required. Provide --tenant=<id> or set DEFAULT_TENANT_ID');
  }

  logger.info(`Seeding ${SAMPLE_GENRES.length} genres for tenant ${tenantId}`);

  for (const genre of SAMPLE_GENRES) {
    try {
      const created = await genreService.createGenre(tenantId, genre, locale);
      logger.info(`Inserted genre ${created.id}`);
    } catch (error) {
      if ((error as { statusCode?: number } | undefined)?.statusCode === 409) {
        logger.warn(`Genre ${genre.id} already exists, skipping`);
      } else {
        throw error;
      }
    }
  }

  logger.info('Genre seeding completed');
}

seedGenres().catch((error) => {
  logger.error({ error }, 'Failed to seed genres');
  process.exitCode = 1;
});
