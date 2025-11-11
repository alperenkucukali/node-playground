const { Router } = require('express');
const genreRoutes = require('./genre.routes');
const artistRoutes = require('./artist.routes');

const router = Router();

router.use('/genres', genreRoutes);
router.use('/artists', artistRoutes);

module.exports = router;
