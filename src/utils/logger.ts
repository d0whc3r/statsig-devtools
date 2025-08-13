/* eslint-disable no-console */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  level: LogLevel
  enabledInProduction: boolean
}

export class Logger {
  private config: LoggerConfig = {
    level: 'debug',
    enabledInProduction: false,
  }
  private defaultScope: string

  constructor(defaultScope = 'APP') {
    this.defaultScope = defaultScope
  }

  private shouldLog(level: LogLevel): boolean {
    // Always log errors
    if (level === 'error') return true

    // In production, only log if explicitly enabled
    if (import.meta.env.PROD && !this.config.enabledInProduction) {
      return false
    }

    // Check log level hierarchy
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.config.level)
    const messageLevelIndex = levels.indexOf(level)

    return messageLevelIndex >= currentLevelIndex
  }

  private formatMessage(level: LogLevel, scope: string, message: string): string {
    const timestamp = new Intl.DateTimeFormat('en-GB', {
      timeStyle: 'medium',
    }).format(new Date())
    const levelUpper = level.toUpperCase().padEnd(5)
    return `[${timestamp}] ${levelUpper} [${scope}] ${message}`
  }

  private logInternal(level: LogLevel, scope: string, message: string, ...args: unknown[]): void {
    if (!this.shouldLog(level)) return

    const formattedMessage = this.formatMessage(level, scope, message)

    switch (level) {
      case 'debug':
        console.debug(formattedMessage, ...args)
        break
      case 'info':
        console.info(formattedMessage, ...args)
        break
      case 'warn':
        console.warn(formattedMessage, ...args)
        break
      case 'error':
        console.error(formattedMessage, ...args)
        break
    }
  }

  /**
   * Generic log method that accepts level as parameter
   */
  log(level: LogLevel, message: string, ...args: unknown[]): void
  log(message: string, ...args: unknown[]): void
  log(levelOrMessage: LogLevel | string, messageOrFirstArg?: string, ...args: unknown[]): void {
    if (typeof levelOrMessage === 'string') {
      // Called as logger.log(message, ...args) - defaults to 'info'
      this.logInternal('info', this.defaultScope, levelOrMessage, messageOrFirstArg, ...args)
    } else {
      // Called as logger.log(level, message, ...args)
      if (messageOrFirstArg) {
        this.logInternal(levelOrMessage, this.defaultScope, messageOrFirstArg, ...args)
      }
    }
  }

  debug(message: string, ...args: unknown[]): void {
    this.logInternal('debug', this.defaultScope, message, ...args)
  }

  info(message: string, ...args: unknown[]): void {
    this.logInternal('info', this.defaultScope, message, ...args)
  }

  warn(message: string, ...args: unknown[]): void {
    this.logInternal('warn', this.defaultScope, message, ...args)
  }

  error(message: string, ...args: unknown[]): void {
    this.logInternal('error', this.defaultScope, message, ...args)
  }

  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }
  }
}
