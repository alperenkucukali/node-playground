import { ok } from '../../../core/success';
import { createHandler } from '../../../handlers/http';
import genreService from '../genre.service';
import { GenreMessages } from '../genre.messages';
import { validateGenreId } from '../genre.validator';

export const deleteGenre = createHandler(async ({ event, tenantId, locale, requestId }) => {
  const id = validateGenreId(event.pathParameters?.id, locale);
  await genreService.deleteGenre(tenantId, id, locale);

  return ok(GenreMessages.DELETED, locale, undefined, requestId);
});
