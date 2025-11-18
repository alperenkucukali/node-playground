import { ok } from '../../../core/success';
import { createHandler, parseJsonBody } from '../../../handlers/http';
import artistService from '../artist.service';
import { ArtistMessages } from '../artist.messages';
import { validateCreateArtistPayload } from '../artist.validator';

export const createArtist = createHandler(async ({ event, tenantId, locale, requestId }) => {
  const body = parseJsonBody(event, locale);
  const payload = validateCreateArtistPayload(body, locale);
  const artist = await artistService.createArtist(tenantId, payload, locale);

  return ok(ArtistMessages.CREATED, locale, artist, requestId);
});
