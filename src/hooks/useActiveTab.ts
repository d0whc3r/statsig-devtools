import { useCallback, useEffect, useState } from 'react'

import { storageInjectionService } from '../services/storage-injection'

/**
 * Interface for active tab information
 */
export interface ActiveTabInfo {
  url: string | null
  domain: string | null
  canInject: boolean
  reason?: string
}

/**
 * Custom hook for getting active tab information
 */
export const useActiveTab = () => {
  const [tabInfo, setTabInfo] = useState<ActiveTabInfo>({
    url: null,
    domain: null,
    canInject: false,
  })
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Load active tab information
   */
  const loadTabInfo = useCallback(async () => {
    setIsLoading(true)
    try {
      const [url, domain, canInjectResult] = await Promise.all([
        storageInjectionService.getCurrentTabUrl(),
        storageInjectionService.getCurrentTabDomain(),
        storageInjectionService.canInjectStorage(),
      ])

      setTabInfo({
        url,
        domain,
        canInject: canInjectResult.canInject,
        reason: canInjectResult.reason,
      })
    } catch {
      setTabInfo({
        url: null,
        domain: null,
        canInject: false,
        reason: 'Failed to get tab information',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Refresh tab information
   */
  const refreshTabInfo = useCallback(() => {
    setIsLoading(true)
    loadTabInfo()
  }, [loadTabInfo])

  /**
   * Load tab info on mount
   */
  useEffect(() => {
    loadTabInfo()
  }, [loadTabInfo])

  return {
    tabInfo,
    isLoading,
    refreshTabInfo,
  }
}
