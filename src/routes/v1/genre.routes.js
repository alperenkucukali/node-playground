const { Router } = require('express');
const genreController = require('../../modules/genres/genre.controller');
const {
  validateCreateGenre,
  validateUpdateGenre,
  validateGenreIdParam,
  parseListQuery,
} = require('../../modules/genres/genre.validator');

const router = Router();

router.get('/', parseListQuery, genreController.listGenres);
router.post('/', validateCreateGenre, genreController.createGenre);

router.get('/:id', validateGenreIdParam, genreController.getGenre);
router.put('/:id', validateGenreIdParam, validateUpdateGenre, genreController.updateGenre);
router.patch('/:id', validateGenreIdParam, validateUpdateGenre, genreController.updateGenre);
router.delete('/:id', validateGenreIdParam, genreController.deleteGenre);

module.exports = router;
