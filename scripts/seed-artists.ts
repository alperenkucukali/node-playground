import { env } from '../src/config/env';
import logger from '../src/config/logger';
import artistService from '../src/modules/artists/artist.service';
import { ArtistCreateInput } from '../src/modules/artists/artist.types';

const SAMPLE_ARTISTS: ArtistCreateInput[] = [
  { id: 'artist-al-pacino', firstName: 'Al', lastName: 'Pacino', isActive: true },
  { id: 'artist-robert-de-niro', firstName: 'Robert', lastName: 'De Niro', isActive: true },
  { id: 'artist-emma-stone', firstName: 'Emma', lastName: 'Stone', isActive: true },
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

async function seedArtists(): Promise<void> {
  const { tenantId: tenantFromArg } = parseArgs();
  const tenantId = (tenantFromArg || env.tenant.defaultId || '').trim();
  const locale = 'en-US';

  if (!tenantId) {
    throw new Error('Tenant id is required. Provide --tenant=<id> or set DEFAULT_TENANT_ID');
  }

  logger.info(`Seeding ${SAMPLE_ARTISTS.length} artists for tenant ${tenantId}`);

  for (const artist of SAMPLE_ARTISTS) {
    try {
      const created = await artistService.createArtist(tenantId, artist, locale);
      logger.info(`Inserted artist ${created.id}`);
    } catch (error) {
      if ((error as { statusCode?: number } | undefined)?.statusCode === 409) {
        logger.warn(`Artist ${artist.id} already exists, skipping`);
      } else {
        throw error;
      }
    }
  }

  logger.info('Artist seeding completed');
}

seedArtists().catch((error) => {
  logger.error({ error }, 'Failed to seed artists');
  process.exitCode = 1;
});
