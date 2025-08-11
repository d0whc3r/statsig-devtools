import { OverrideItem } from './OverrideItem'

import type { OverrideListProps } from './types'

/**
 * List component that renders all override items
 */
export function OverrideList({ overrides, isExpanded, compact, onRemoveOverride }: OverrideListProps) {
  if (!isExpanded) return null

  return (
    <div className={`custom-scrollbar space-y-2 overflow-y-auto ${compact ? 'max-h-32 p-2' : 'max-h-48 p-3'}`}>
      {overrides.map((override, index) => (
        <OverrideItem
          key={`${override.type}:${override.key}:${override.domain || 'default'}:${index}`}
          override={override}
          index={index}
          compact={compact}
          onRemove={onRemoveOverride}
        />
      ))}
    </div>
  )
}
