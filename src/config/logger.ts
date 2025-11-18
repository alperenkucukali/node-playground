import { env, LogLevel, LOG_LEVELS } from './env';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

class Logger {
  private readonly currentLevelIndex: number;

  constructor(private readonly level: LogLevel = 'info') {
    this.currentLevelIndex = Math.max(LOG_LEVELS.indexOf(level), 0);
  }

  private log(level: LogLevel, message: string, meta?: unknown): void {
    if (LOG_LEVELS.indexOf(level) > this.currentLevelIndex) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (meta !== undefined) {
      if (meta && typeof meta === 'object') {
        Object.assign(entry, meta);
      } else {
        entry.details = meta;
      }
    }

    const serialized = JSON.stringify(entry);
    const writer = level === 'error' ? console.error : console.log;
    writer(serialized);
  }

  error(message: string, meta?: unknown): void {
    this.log('error', message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.log('warn', message, meta);
  }

  info(message: string, meta?: unknown): void {
    this.log('info', message, meta);
  }

  debug(message: string, meta?: unknown): void {
    this.log('debug', message, meta);
  }
}

const logger = new Logger(env.logLevel);

export { logger };
export default logger;
