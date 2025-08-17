import { useCallback, useState } from 'react'

import { logger } from '../../utils/logger'

import type { StorageOverride } from '../../types'

/**
 * Hook to manage override manager state and operations
 */
export function useOverrideManager(
  overrides: StorageOverride[],
  onRemoveOverride: (overrideId: string) => void,
  onClearAllOverrides: () => void,
) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  /**
   * Handle removing a specific override
   */
  const handleRemoveOverride = useCallback(
    (overrideId: string) => {
      logger.info('Removing override:', overrideId)
      onRemoveOverride(overrideId)
    },
    [onRemoveOverride],
  )

  /**
   * Handle clearing all overrides
   */
  const handleClearAll = useCallback(() => {
    if (overrides.length === 0) return
    setShowConfirmDialog(true)
  }, [overrides.length])

  /**
   * Confirm clearing all overrides
   */
  const confirmClearAll = useCallback(() => {
    logger.info('Clearing all overrides')
    onClearAllOverrides()
    setShowConfirmDialog(false)
  }, [onClearAllOverrides])

  /**
   * Cancel clearing all overrides
   */
  const cancelClearAll = useCallback(() => {
    setShowConfirmDialog(false)
  }, [])

  /**
   * Toggle expanded state
   */
  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded)
  }, [isExpanded])

  return {
    isExpanded,
    showConfirmDialog,
    handleRemoveOverride,
    handleClearAll,
    confirmClearAll,
    cancelClearAll,
    toggleExpanded,
  }
}
