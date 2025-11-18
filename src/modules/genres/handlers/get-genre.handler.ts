import { ok } from '../../../core/success';
import { createHandler } from '../../../handlers/http';
import genreService from '../genre.service';
import { GenreMessages } from '../genre.messages';
import { validateGenreId } from '../genre.validator';

export const getGenre = createHandler(async ({ event, tenantId, locale, requestId }) => {
  const id = validateGenreId(event.pathParameters?.id, locale);
  const genre = await genreService.getGenre(tenantId, id, locale);

  return ok(GenreMessages.GET_SUCCESS, locale, genre, requestId);
});
