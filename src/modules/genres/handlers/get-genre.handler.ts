import { createHandler } from '../../../handlers/http';
import { ok } from '../../../handlers/response';
import genreService from '../genre.service';
import { validateGenreId } from '../genre.validator';

export const getGenre = createHandler(async ({ event, tenantId }) => {
  const id = validateGenreId(event.pathParameters?.id);
  const genre = await genreService.getGenre(tenantId, id);

  return ok(genre);
});
