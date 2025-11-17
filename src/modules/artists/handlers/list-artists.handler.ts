import { createHandler } from '../../../handlers/http';
import { listOk } from '../../../handlers/response';
import artistService from '../artist.service';
import { validateArtistListQuery } from '../artist.validator';

export const listArtists = createHandler(async ({ event, tenantId }) => {
  const filters = validateArtistListQuery(event.queryStringParameters || {});
  const result = await artistService.listArtists({
    tenantId,
    limit: filters.limit,
    cursor: filters.cursor,
    isActive: filters.isActive,
  });

  return listOk(result.items, result.nextCursor);
});
