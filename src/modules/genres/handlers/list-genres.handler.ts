import { createHandler } from '../../../handlers/http';
import { listOk } from '../../../handlers/response';
import genreService from '../genre.service';
import { validateGenreListQuery } from '../genre.validator';

export const listGenres = createHandler(async ({ event, tenantId }) => {
  const filters = validateGenreListQuery(event.queryStringParameters || {});
  const result = await genreService.listGenres({
    tenantId,
    limit: filters.limit,
    cursor: filters.cursor,
  });

  return listOk(result.items, result.nextCursor);
});
