import { ok } from '../../../core/success';
import { createHandler, parseJsonBody } from '../../../handlers/http';
import genreService from '../genre.service';
import { GenreMessages } from '../genre.messages';
import { validateGenreId, validateUpdateGenrePayload } from '../genre.validator';

export const updateGenre = createHandler(async ({ event, tenantId, locale, requestId }) => {
  const id = validateGenreId(event.pathParameters?.id, locale);
  const body = parseJsonBody(event, locale);
  const payload = validateUpdateGenrePayload(body, locale);
  const genre = await genreService.updateGenre(tenantId, id, payload, locale);

  return ok(GenreMessages.UPDATED, locale, genre, requestId);
});
