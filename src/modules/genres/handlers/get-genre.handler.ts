import { createHandler } from '../../../handlers/http';
import genreService from '../genre.service';
import { validateGenreId } from '../genre.validator';

export const getGenre = createHandler(async ({ event, tenantId }) => {
  const id = validateGenreId(event.pathParameters?.id);
  const genre = await genreService.getGenre(tenantId, id);

  return {
    statusCode: 200,
    body: { success: true, data: genre },
  };
});
