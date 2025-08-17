import { Logger } from '@/src/utils/logger'

export abstract class BaseApiService {
  protected logger: Logger

  constructor(serviceName: string) {
    this.logger = new Logger(serviceName)
  }

  protected handleApiError(error: unknown, context: string, additionalData?: Record<string, unknown>) {
    this.logger.error(`Failed to ${context}`, { ...additionalData, error })
  }

  protected handleParseError(error: unknown, context: string, additionalData?: Record<string, unknown>) {
    this.logger.error(`Failed to parse ${context} response (Zod validation error)`, { ...additionalData, error })
  }
}
