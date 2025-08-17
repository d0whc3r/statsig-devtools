import { useAuthStore as getAuthStore } from '../stores/auth.store'
import { Logger } from '../utils/logger'

import type { CreateClientConfig } from '../client/client/types.gen'

const logger = new Logger('HttpClient')

export const createClientConfig: CreateClientConfig = (config) => {
  logger.info('Creating client config', {
    hasApiKey: !!getAuthStore.getState().consoleApiKey,
    isAuthenticated: getAuthStore.getState().isAuthenticated,
    apiKeyLength: getAuthStore.getState().consoleApiKey?.length,
  })

  return {
    ...config,
    auth: () => {
      const currentApiKey = getAuthStore.getState().consoleApiKey
      logger.info('Auth function called', {
        hasApiKey: !!currentApiKey,
        apiKeyLength: currentApiKey?.length,
      })
      return currentApiKey ?? ''
    },
  }
}
