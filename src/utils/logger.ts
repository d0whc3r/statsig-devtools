/**
 * Development logger utility
 * Only logs in development mode to avoid console statements in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  /**
   * Create a scoped logger with a prefix
   */
  scope(prefix: string): ScopedLogger {
    return new ScopedLogger(this, prefix)
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }

  /**
   * Log info message (development only)
   */
  info(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, ...args)
    }
  }

  /**
   * Log warning message (development only)
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(`[WARN] ${message}`, ...args)
    }
  }

  /**
   * Log error message (always logged)
   */
  error(message: string, ...args: unknown[]): void {
    // Always log errors, even in production
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, ...args)
  }

  /**
   * Log with custom level or simple message
   */
  log(levelOrMessage: LogLevel | string, messageOrArg?: string, ...args: unknown[]): void {
    if (typeof levelOrMessage === 'string' && messageOrArg === undefined) {
      // Simple log call: log(message)
      this.info(levelOrMessage, ...args)
    } else if (typeof levelOrMessage === 'string' && typeof messageOrArg === 'string') {
      // Level-based log call: log(level, message, ...args)
      const level = levelOrMessage as LogLevel
      const message = messageOrArg
      switch (level) {
        case 'debug':
          this.debug(message, ...args)
          break
        case 'info':
          this.info(message, ...args)
          break
        case 'warn':
          this.warn(message, ...args)
          break
        case 'error':
          this.error(message, ...args)
          break
        default:
          this.info(levelOrMessage, messageOrArg, ...args)
      }
    } else {
      // Fallback to info
      this.info(String(levelOrMessage), messageOrArg, ...args)
    }
  }
}

/**
 * Scoped logger with prefix
 */
class ScopedLogger {
  constructor(
    private logger: Logger,
    private prefix: string,
  ) {}

  debug(message: string, ...args: unknown[]): void {
    this.logger.debug(`[${this.prefix}] ${message}`, ...args)
  }

  info(message: string, ...args: unknown[]): void {
    this.logger.info(`[${this.prefix}] ${message}`, ...args)
  }

  warn(message: string, ...args: unknown[]): void {
    this.logger.warn(`[${this.prefix}] ${message}`, ...args)
  }

  error(message: string, ...args: unknown[]): void {
    this.logger.error(`[${this.prefix}] ${message}`, ...args)
  }

  log(message: string, ...args: unknown[]): void {
    this.logger.info(`[${this.prefix}] ${message}`, ...args)
  }
}

export const logger = new Logger()
export type { LogLevel, ScopedLogger }
