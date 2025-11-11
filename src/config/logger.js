const util = require('node:util');
const { env } = require('./env');

const LEVELS = ['error', 'warn', 'info', 'debug'];
const levelIdx = Math.max(LEVELS.indexOf(env.logLevel), 0);

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  if (!meta) {
    return base;
  }

  const serialized =
    typeof meta === 'string' ? meta : util.inspect(meta, { depth: 5, colors: false });
  return `${base} ${serialized}`;
}

function log(level, message, meta) {
  if (LEVELS.indexOf(level) > levelIdx) {
    return;
  }

  const writer = level === 'error' ? console.error : console.log;
  writer(formatMessage(level, message, meta));
}

const logger = {
  error: (message, meta) => log('error', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  info: (message, meta) => log('info', message, meta),
  debug: (message, meta) => log('debug', message, meta),
};

module.exports = logger;
