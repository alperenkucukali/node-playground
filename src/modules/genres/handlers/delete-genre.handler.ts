import { createHandler } from '../../../handlers/http';
import genreService from '../genre.service';
import { validateGenreId } from '../genre.validator';

export const deleteGenre = createHandler(async ({ event, tenantId }) => {
  const id = validateGenreId(event.pathParameters?.id);
  await genreService.deleteGenre(tenantId, id);

  return {
    statusCode: 204,
  };
});
