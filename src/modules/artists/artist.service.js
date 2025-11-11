const ApiError = require('../../utils/api-error');
const artistRepository = require('./artist.repository');

function encodeCursor(key) {
  return key ? Buffer.from(JSON.stringify(key)).toString('base64') : undefined;
}

function decodeCursor(cursor) {
  if (!cursor) {
    return undefined;
  }

  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
  } catch (_err) {
    throw ApiError.badRequest('Invalid cursor token');
  }
}

async function listArtists({ tenantId, limit, cursor, isActive }) {
  const decodedCursor = decodeCursor(cursor);
  const result = await artistRepository.listArtists({
    tenantId,
    limit,
    cursor: decodedCursor,
    isActive,
  });

  return {
    items: result.items,
    nextCursor: encodeCursor(result.lastEvaluatedKey),
  };
}

async function getArtist(tenantId, id) {
  const artist = await artistRepository.findById(tenantId, id);
  if (!artist) {
    throw ApiError.notFound(`Artist ${id} not found`);
  }
  return artist;
}

async function createArtist(tenantId, payload) {
  try {
    return await artistRepository.createArtist(tenantId, payload);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw ApiError.conflict(`Artist ${payload.id} already exists`);
    }
    throw error;
  }
}

async function updateArtist(tenantId, id, payload) {
  try {
    return await artistRepository.updateArtist(tenantId, id, payload);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw ApiError.notFound(`Artist ${id} not found`);
    }
    throw error;
  }
}

async function deleteArtist(tenantId, id) {
  try {
    await artistRepository.deleteArtist(tenantId, id);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw ApiError.notFound(`Artist ${id} not found`);
    }
    throw error;
  }
}

module.exports = {
  listArtists,
  getArtist,
  createArtist,
  updateArtist,
  deleteArtist,
};
