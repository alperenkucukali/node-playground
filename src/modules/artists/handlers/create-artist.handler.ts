import { createHandler, parseJsonBody } from '../../../handlers/http';
import artistService from '../artist.service';
import { validateCreateArtistPayload } from '../artist.validator';

export const createArtist = createHandler(async ({ event, tenantId }) => {
  const body = parseJsonBody(event);
  const payload = validateCreateArtistPayload(body);
  const artist = await artistService.createArtist(tenantId, payload);

  return {
    statusCode: 201,
    body: { success: true, data: artist },
  };
});
