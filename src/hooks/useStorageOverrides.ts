import { useCallback, useEffect, useState } from 'react'

import { errorHandler } from '../services/error-handler'
import { storageInjectionService } from '../services/storage-injection'

import type { StorageOverride } from '../services/statsig-integration'

/**
 * Custom hook for managing storage overrides
 */
export const useStorageOverrides = () => {
  const [activeOverrides, setActiveOverrides] = useState<StorageOverride[]>([])

  /**
   * Load active overrides from storage
   */
  const loadActiveOverrides = useCallback(async () => {
    try {
      const overrides = await storageInjectionService.getActiveOverrides()
      setActiveOverrides(overrides)
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

  return {
    activeOverrides,
    createOverride,
    removeOverride,
    clearAllOverrides,
    refreshOverrides: loadActiveOverrides,
  }
}
