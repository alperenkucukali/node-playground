import util from 'node:util';
import { env } from './env';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

class Logger {
  private static readonly LEVELS: LogLevel[] = ['error', 'warn', 'info', 'debug'];
  private readonly currentLevelIndex: number;

  constructor(private readonly level: LogLevel = 'info') {
    this.currentLevelIndex = Math.max(Logger.LEVELS.indexOf(level), 0);
  }

  private format(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (meta === undefined) {
      return base;
    }

    const serialized =
      typeof meta === 'string' ? meta : util.inspect(meta, { depth: 5, colors: false });
    return `${base} ${serialized}`;
  }

  private log(level: LogLevel, message: string, meta?: unknown): void {
    if (Logger.LEVELS.indexOf(level) > this.currentLevelIndex) {
      return;
    }

    const writer = level === 'error' ? console.error : console.log;
    writer(this.format(level, message, meta));
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

const logger = new Logger(env.logLevel as LogLevel);

export { logger };
export default logger;
