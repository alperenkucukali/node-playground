import { Router } from 'express';
import artistController from '../../modules/artists/artist.controller';
import {
  parseArtistListQuery,
  validateArtistIdParam,
  validateCreateArtist,
  validateUpdateArtist,
} from '../../modules/artists/artist.validator';

const router = Router();

router.get('/', parseArtistListQuery, artistController.listArtists);
router.post('/', validateCreateArtist, artistController.createArtist);
router.get('/:id', validateArtistIdParam, artistController.getArtist);
router.put('/:id', validateArtistIdParam, validateUpdateArtist, artistController.updateArtist);
router.patch('/:id', validateArtistIdParam, validateUpdateArtist, artistController.updateArtist);
router.delete('/:id', validateArtistIdParam, artistController.deleteArtist);

export default router;
