import { ok } from '../../../core/success';
import { createHandler, parseJsonBody } from '../../../handlers/http';
import genreService from '../genre.service';
import { GenreMessages } from '../genre.messages';
import { validateCreateGenrePayload } from '../genre.validator';

export const createGenre = createHandler(async ({ event, tenantId, locale, requestId }) => {
  const body = parseJsonBody(event, locale);
  const payload = validateCreateGenrePayload(body, locale);
  const genre = await genreService.createGenre(tenantId, payload, locale);

  return ok(GenreMessages.CREATED, locale, genre, requestId);
});
