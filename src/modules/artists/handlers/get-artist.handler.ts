import { ok } from '../../../core/success';
import { createHandler } from '../../../handlers/http';
import artistService from '../artist.service';
import { ArtistMessages } from '../artist.messages';
import { validateArtistId } from '../artist.validator';

export const getArtist = createHandler(async ({ event, tenantId, locale, requestId }) => {
  const id = validateArtistId(event.pathParameters?.id, locale);
  const artist = await artistService.getArtist(tenantId, id, locale);

  return ok(ArtistMessages.GET_SUCCESS, locale, artist, requestId);
});
