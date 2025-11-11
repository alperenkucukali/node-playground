const ApiError = require('../../utils/api-error');
const genreRepository = require('./genre.repository');

function encodeCursor(key) {
  return key ? Buffer.from(JSON.stringify(key)).toString('base64') : undefined;
}

function decodeCursor(cursor) {
  if (!cursor) {
    return undefined;
  }

  try {
    const json = Buffer.from(cursor, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (_err) {
    throw ApiError.badRequest('Invalid cursor token');
  }
}

async function listGenres({ tenantId, limit, cursor }) {
  const decodedCursor = decodeCursor(cursor);
  const result = await genreRepository.listGenres({ tenantId, limit, cursor: decodedCursor });

  return {
    items: result.items,
    nextCursor: encodeCursor(result.lastEvaluatedKey),
  };
}

async function getGenre(tenantId, id) {
  const genre = await genreRepository.findById(tenantId, id);
  if (!genre) {
    throw ApiError.notFound(`Genre ${id} not found`);
  }
  return genre;
}

async function createGenre(tenantId, payload) {
  try {
    return await genreRepository.createGenre(tenantId, payload);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw ApiError.conflict(`Genre ${payload.id} already exists`);
    }
    throw error;
  }
}

async function updateGenre(tenantId, id, payload) {
  try {
    return await genreRepository.updateGenre(tenantId, id, payload);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw ApiError.notFound(`Genre ${id} not found`);
    }
    throw error;
  }
}

async function deleteGenre(tenantId, id) {
  try {
    await genreRepository.deleteGenre(tenantId, id);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw ApiError.notFound(`Genre ${id} not found`);
    }
    throw error;
  }
}

module.exports = {
  listGenres,
  getGenre,
  createGenre,
  updateGenre,
  deleteGenre,
};
