import { createHandler, parseJsonBody } from '../../../handlers/http';
import genreService from '../genre.service';
import { validateCreateGenrePayload } from '../genre.validator';

export const createGenre = createHandler(async ({ event, tenantId }) => {
  const body = parseJsonBody(event);
  const payload = validateCreateGenrePayload(body);
  const genre = await genreService.createGenre(tenantId, payload);

  return {
    statusCode: 201,
    body: { success: true, data: genre },
  };
});
