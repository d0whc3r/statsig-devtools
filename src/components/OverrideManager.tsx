import { useActiveTab } from '../hooks/useActiveTab'
import { logger } from '../utils/logger'
import {
  ConfirmationDialog,
  OverrideEmptyState,
  OverrideHeader,
  OverrideList,
  useOverrideManager,
} from './override-manager'

import type { OverrideManagerProps } from './override-manager'

/**
 * Main component to manage and display active storage overrides
 */
export function OverrideManager({
  overrides,
  onRemoveOverride,
  onClearAllOverrides,
  className = '',
  compact = false,
}: OverrideManagerProps) {
  const { tabInfo } = useActiveTab()
  // Debug log
  logger.info('OverrideManager rendered with overrides:', overrides.length, overrides)

  const {
    isExpanded,
    showConfirmDialog,
    handleRemoveOverride,
    handleClearAll,
    confirmClearAll,
    cancelClearAll,
    toggleExpanded,
  } = useOverrideManager(overrides, onRemoveOverride, onClearAllOverrides)

  // Show empty state if no overrides
  if (overrides.length === 0) {
    return <OverrideEmptyState className={className} />
  }

  return (
    <div className={`rounded-lg border border-gray-200 bg-white ${className}`}>
      <OverrideHeader
        overrideCount={overrides.length}
        isExpanded={isExpanded}
        compact={compact}
        onToggleExpanded={toggleExpanded}
        onClearAll={handleClearAll}
      />

      <OverrideList
        overrides={overrides}
        isExpanded={isExpanded}
        compact={compact}
        onRemoveOverride={handleRemoveOverride}
      />

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        overrideCount={overrides.length}
        onConfirm={confirmClearAll}
        onCancel={cancelClearAll}
      />
      {/* Current domain indicator for clarity in sidebar */}
      {tabInfo.domain && (
        <div className="border-t px-2 py-1 text-[10px] text-gray-500">
          Domain: <span className="font-mono">{tabInfo.domain}</span>
        </div>
      )}
    </div>
  )
}

// Re-export types and utilities for backward compatibility
export type { OverrideManagerProps } from './override-manager'
