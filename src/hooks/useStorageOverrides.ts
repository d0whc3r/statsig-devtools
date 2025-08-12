import { useCallback, useEffect, useMemo, useState } from 'react'

import { errorHandler } from '../services/error-handler'
import { storageInjectionService } from '../services/storage-injection'
import { browserAPI } from '../utils/browser-api'
import { useActiveTab } from './useActiveTab'

import type { StorageOverride } from '../services/statsig-integration'

/**
 * Custom hook for managing storage overrides
 */
export const useStorageOverrides = (domainOverride?: string) => {
  const [allOverrides, setAllOverrides] = useState<StorageOverride[]>([])
  const { tabInfo } = useActiveTab()

  /**
   * Load active overrides from storage
   */
  const loadActiveOverrides = useCallback(async () => {
    try {
      const overrides = await storageInjectionService.getActiveOverrides()
      setAllOverrides(overrides)
    } catch (err) {
      errorHandler.handleError(err, 'Loading active overrides')
    }
  }, [])

  /**
   * Create a new override
   */
  const createOverride = useCallback(
    async (override: StorageOverride) => {
      try {
        await storageInjectionService.createOverride(override)
        await loadActiveOverrides() // Refresh the list
      } catch (err) {
        errorHandler.handleError(err, 'Creating override')
        throw err // Re-throw to allow component to handle UI feedback
      }
    },
    [loadActiveOverrides],
  )

  /**
   * Remove an override
   */
  const removeOverride = useCallback(
    async (overrideId: string) => {
      try {
        await storageInjectionService.removeOverride(overrideId)
        await loadActiveOverrides() // Refresh the list
      } catch (err) {
        errorHandler.handleError(err, 'Removing override')
        throw err // Re-throw to allow component to handle UI feedback
      }
    },
    [loadActiveOverrides],
  )

  /**
   * Clear all overrides
   */
  const clearAllOverrides = useCallback(async () => {
    try {
      await storageInjectionService.clearAllOverrides()
      await loadActiveOverrides() // Refresh the list
    } catch (err) {
      errorHandler.handleError(err, 'Clearing all overrides')
      throw err // Re-throw to allow component to handle UI feedback
    }
  }, [loadActiveOverrides])

  /**
   * Load overrides on mount
   */
  useEffect(() => {
    loadActiveOverrides()
  }, [loadActiveOverrides])

  // Refresh overrides when domain changes (sidebar open while switching tabs)
  useEffect(() => {
    // Only react when domain is available
    const effectiveDomain = domainOverride ?? tabInfo.domain
    if (effectiveDomain) {
      loadActiveOverrides()
    }
  }, [domainOverride, tabInfo.domain, loadActiveOverrides])

  /**
   * Sync across components/windows: listen to storage changes
   */
  useEffect(() => {
    const handleStorageChange = (
      changes: Record<string, { newValue?: unknown; oldValue?: unknown }>,
      areaName: string,
    ) => {
      if (areaName !== 'local') return
      if (!Object.prototype.hasOwnProperty.call(changes, 'statsig_active_overrides')) return
      const next = (changes['statsig_active_overrides']?.newValue as StorageOverride[]) || []
      setAllOverrides(next)
    }

    try {
      browserAPI.storage.onChanged.addListener(handleStorageChange)
    } catch {
      // Ignore if not available in test env
    }

    return () => {
      try {
        browserAPI.storage.onChanged.removeListener(handleStorageChange)
      } catch {
        // no-op
      }
    }
  }, [])

  /**
   * Filter overrides by current tab domain (when available)
   * - Cookie overrides: match by domain when present
   * - Storage overrides: show when no domain (applies to current origin context)
   */
  const overridesForCurrentTab = useMemo(() => {
    const currentDomain = (domainOverride ?? tabInfo.domain) || ''
    if (!currentDomain) return []

    const matchesDomain = (overrideDomain?: string): boolean => {
      if (!overrideDomain) return false
      // Allow subdomain matching: currentDomain endsWith overrideDomain or includes for simple cases
      return (
        currentDomain === overrideDomain ||
        currentDomain.endsWith(`.${overrideDomain}`) ||
        currentDomain.includes(overrideDomain)
      )
    }

    return allOverrides.filter((ov) => {
      // Always require domain match when present
      if (ov.domain) return matchesDomain(ov.domain)

      // For legacy overrides without domain, hide them to avoid cross-domain leakage
      return false
    })
  }, [allOverrides, domainOverride, tabInfo.domain])

  return {
    allOverrides,
    activeOverrides: overridesForCurrentTab,
    createOverride,
    removeOverride,
    clearAllOverrides,
    refreshOverrides: loadActiveOverrides,
  }
}
