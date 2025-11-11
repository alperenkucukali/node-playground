const { Router } = require('express');
const artistController = require('../../modules/artists/artist.controller');
const {
  validateArtistIdParam,
  validateCreateArtist,
  validateUpdateArtist,
  parseArtistListQuery,
} = require('../../modules/artists/artist.validator');

const router = Router();

router.get('/', parseArtistListQuery, artistController.listArtists);
router.post('/', validateCreateArtist, artistController.createArtist);
router.get('/:id', validateArtistIdParam, artistController.getArtist);
router.put('/:id', validateArtistIdParam, validateUpdateArtist, artistController.updateArtist);
router.patch('/:id', validateArtistIdParam, validateUpdateArtist, artistController.updateArtist);
router.delete('/:id', validateArtistIdParam, artistController.deleteArtist);

module.exports = router;
