import { createHandler } from '../../../handlers/http';
import artistService from '../artist.service';
import { validateArtistId } from '../artist.validator';

export const getArtist = createHandler(async ({ event, tenantId }) => {
  const id = validateArtistId(event.pathParameters?.id);
  const artist = await artistService.getArtist(tenantId, id);

  return {
    statusCode: 200,
    body: { success: true, data: artist },
  };
});
