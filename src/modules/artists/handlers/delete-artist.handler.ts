import { createHandler } from '../../../handlers/http';
import { noContent } from '../../../handlers/response';
import artistService from '../artist.service';
import { validateArtistId } from '../artist.validator';

export const deleteArtist = createHandler(async ({ event, tenantId }) => {
  const id = validateArtistId(event.pathParameters?.id);
  await artistService.deleteArtist(tenantId, id);

  return noContent();
});
