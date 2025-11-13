import { createHandler } from '../../../handlers/http';
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

  return {
    statusCode: 200,
    body: {
      success: true,
      data: result.items,
      nextCursor: result.nextCursor,
    },
  };
});
