import { ok } from '../../../core/success';
import { createHandler, parseJsonBody } from '../../../handlers/http';
import artistService from '../artist.service';
import { ArtistMessages } from '../artist.messages';
import { validateArtistId, validateUpdateArtistPayload } from '../artist.validator';

export const updateArtist = createHandler(async ({ event, tenantId, locale, requestId }) => {
  const id = validateArtistId(event.pathParameters?.id, locale);
  const body = parseJsonBody(event, locale);
  const payload = validateUpdateArtistPayload(body, locale);
  const artist = await artistService.updateArtist(tenantId, id, payload, locale);

  return ok(ArtistMessages.UPDATED, locale, artist, requestId);
});
