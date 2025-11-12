import { Router } from 'express';
import artistRoutes from './artist.routes';
import genreRoutes from './genre.routes';

const router = Router();

router.use('/genres', genreRoutes);
router.use('/artists', artistRoutes);

export default router;
