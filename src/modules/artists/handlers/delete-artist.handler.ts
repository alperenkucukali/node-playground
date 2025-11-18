import { ok } from '../../../core/success';
import { createHandler } from '../../../handlers/http';
import artistService from '../artist.service';
import { ArtistMessages } from '../artist.messages';
import { validateArtistId } from '../artist.validator';

export const deleteArtist = createHandler(async ({ event, tenantId, locale, requestId }) => {
  const id = validateArtistId(event.pathParameters?.id, locale);
  await artistService.deleteArtist(tenantId, id, locale);

  return ok(ArtistMessages.DELETED, locale, undefined, requestId);
});
