import { createHandler, parseJsonBody } from '../../../handlers/http';
import { ok } from '../../../handlers/response';
import genreService from '../genre.service';
import { validateGenreId, validateUpdateGenrePayload } from '../genre.validator';

export const updateGenre = createHandler(async ({ event, tenantId }) => {
  const id = validateGenreId(event.pathParameters?.id);
  const body = parseJsonBody(event);
  const payload = validateUpdateGenrePayload(body);
  const genre = await genreService.updateGenre(tenantId, id, payload);

  return ok(genre);
});
