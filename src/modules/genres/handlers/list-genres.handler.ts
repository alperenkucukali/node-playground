import { ok } from '../../../core/success';
import { createHandler } from '../../../handlers/http';
import genreService from '../genre.service';
import { GenreMessages } from '../genre.messages';
import { validateGenreListQuery } from '../genre.validator';

export const listGenres = createHandler(async ({ event, tenantId, locale, requestId }) => {
  const filters = validateGenreListQuery(event.queryStringParameters || {}, locale);
  const result = await genreService.listGenres({
    tenantId,
    limit: filters.limit,
    cursor: filters.cursor,
  }, locale);

  return ok(
    GenreMessages.LIST_SUCCESS,
    locale,
    {
      items: result.items,
      nextCursor: result.nextCursor,
    },
    requestId,
  );
});
