const catchAsync = require('../../utils/catch-async');
const genreService = require('./genre.service');

const listGenres = catchAsync(async (req, res) => {
  const result = await genreService.listGenres({
    tenantId: req.tenantId,
    limit: req.query.limit,
    cursor: req.query.cursor,
  });

  res.json({
    success: true,
    data: result.items,
    nextCursor: result.nextCursor,
  });
});

const getGenre = catchAsync(async (req, res) => {
  const genre = await genreService.getGenre(req.tenantId, req.params.id);
  res.json({ success: true, data: genre });
});

const createGenre = catchAsync(async (req, res) => {
  const genre = await genreService.createGenre(req.tenantId, req.body);
  res.status(201).json({ success: true, data: genre });
});

const updateGenre = catchAsync(async (req, res) => {
  const genre = await genreService.updateGenre(req.tenantId, req.params.id, req.body);
  res.json({ success: true, data: genre });
});

const deleteGenre = catchAsync(async (req, res) => {
  await genreService.deleteGenre(req.tenantId, req.params.id);
  res.status(204).send();
});

module.exports = {
  listGenres,
  getGenre,
  createGenre,
  updateGenre,
  deleteGenre,
};
