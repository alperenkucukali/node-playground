import { createHandler, parseJsonBody } from '../../../handlers/http';
import artistService from '../artist.service';
import { validateArtistId, validateUpdateArtistPayload } from '../artist.validator';

export const updateArtist = createHandler(async ({ event, tenantId }) => {
  const id = validateArtistId(event.pathParameters?.id);
  const body = parseJsonBody(event);
  const payload = validateUpdateArtistPayload(body);
  const artist = await artistService.updateArtist(tenantId, id, payload);

  return {
    statusCode: 200,
    body: { success: true, data: artist },
  };
});
