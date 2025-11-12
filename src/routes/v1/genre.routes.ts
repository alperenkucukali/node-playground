import { Router } from 'express';
import genreController from '../../modules/genres/genre.controller';
import {
  parseListQuery,
  validateCreateGenre,
  validateGenreIdParam,
  validateUpdateGenre,
} from '../../modules/genres/genre.validator';

const router = Router();

router.get('/', parseListQuery, genreController.listGenres);
router.post('/', validateCreateGenre, genreController.createGenre);

router.get('/:id', validateGenreIdParam, genreController.getGenre);
router.put('/:id', validateGenreIdParam, validateUpdateGenre, genreController.updateGenre);
router.patch('/:id', validateGenreIdParam, validateUpdateGenre, genreController.updateGenre);
router.delete('/:id', validateGenreIdParam, genreController.deleteGenre);

export default router;
