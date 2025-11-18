import { ok } from '../../../core/success';
import { createHandler } from '../../../handlers/http';
import artistService from '../artist.service';
import { ArtistMessages } from '../artist.messages';
import { validateArtistListQuery } from '../artist.validator';

export const listArtists = createHandler(async ({ event, tenantId, locale, requestId }) => {
  const filters = validateArtistListQuery(event.queryStringParameters || {}, locale);
  const result = await artistService.listArtists(
    {
      tenantId,
      limit: filters.limit,
      cursor: filters.cursor,
      isActive: filters.isActive,
    },
    locale,
  );

  return ok(
    ArtistMessages.LIST_SUCCESS,
    locale,
    {
      items: result.items,
      nextCursor: result.nextCursor,
    },
    requestId,
  );
});
