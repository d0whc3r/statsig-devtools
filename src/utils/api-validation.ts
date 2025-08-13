import { Company } from '@/src/client/sdk.gen'
import { Logger } from '@/src/utils/logger'

const logger = new Logger('API-Validation')

export async function validateConsoleApiKey(apiKey: string): Promise<[string | null, boolean]> {
  try {
    const response = await Company.getConsoleV1Company({
      auth: () => apiKey,
    })

    if (response.response.ok) {
      return [null, true]
    }

    let errorMessage = 'Invalid API key'
    if (response.response.status === 401) {
      errorMessage = 'Invalid API key. Please check your key and try again.'
    } else if (response.response.status === 403) {
      errorMessage = 'API key does not have sufficient permissions.'
    } else if (response.response.status >= 500) {
      errorMessage = 'Server error. Please try again later.'
    }

    return [errorMessage, false]
  } catch (error: unknown) {
    logger.error('API key validation failed:', error)
    if (error instanceof Error) {
      return [error.message, false]
    }

    return ['An unexpected error occurred. Please try again.', false]
  }
}
