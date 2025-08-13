import { useAuthStore as getAuthStore } from './stores/auth-store'

import type { CreateClientConfig } from './client/client/types.gen'

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  auth: () => getAuthStore().consoleApiKey ?? '',
})
