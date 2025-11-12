import catchAsync from '../../utils/catch-async';
import artistService from './artist.service';

const listArtists = catchAsync(async (req, res) => {
  const { limit, cursor, isActive } = req.query as {
    limit?: number;
    cursor?: string;
    isActive?: boolean;
  };

  const result = await artistService.listArtists({
    tenantId: req.tenantId!,
    limit,
    cursor,
    isActive,
  });

  res.json({
    success: true,
    data: result.items,
    nextCursor: result.nextCursor,
  });
});

const getArtist = catchAsync(async (req, res) => {
  const artist = await artistService.getArtist(req.tenantId!, req.params.id);
  res.json({ success: true, data: artist });
});

const createArtist = catchAsync(async (req, res) => {
  const artist = await artistService.createArtist(req.tenantId!, req.body);
  res.status(201).json({ success: true, data: artist });
});

const updateArtist = catchAsync(async (req, res) => {
  const artist = await artistService.updateArtist(req.tenantId!, req.params.id, req.body);
  res.json({ success: true, data: artist });
});

const deleteArtist = catchAsync(async (req, res) => {
  await artistService.deleteArtist(req.tenantId!, req.params.id);
  res.status(204).send();
});

export default {
  listArtists,
  getArtist,
  createArtist,
  updateArtist,
  deleteArtist,
};
