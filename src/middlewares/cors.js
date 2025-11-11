const { env } = require('../config/env');

function cors(req, res, next) {
  const origins = env.corsOrigins.length ? env.corsOrigins : ['*'];
  const origin = req.get('origin');

  if (origins.includes('*') || origins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
}

module.exports = cors;
