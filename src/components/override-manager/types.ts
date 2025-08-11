import type { StorageOverride } from '../../services/statsig-integration'

export interface OverrideManagerProps {
  overrides: StorageOverride[]
  onRemoveOverride: (overrideId: string) => void
  onClearAllOverrides: () => void
  className?: string
  compact?: boolean
}

export interface OverrideItemProps {
  override: StorageOverride
  index: number
  compact: boolean
  onRemove: (overrideId: string) => void
}

export interface OverrideHeaderProps {
  overrideCount: number
  isExpanded: boolean
  compact: boolean
  onToggleExpanded: () => void
  onClearAll: () => void
}

export interface OverrideEmptyStateProps {
  className?: string
}

export interface ConfirmationDialogProps {
  isOpen: boolean
  overrideCount: number
  onConfirm: () => void
  onCancel: () => void
}

export interface OverrideListProps {
  overrides: StorageOverride[]
  isExpanded: boolean
  compact: boolean
  onRemoveOverride: (overrideId: string) => void
}

export type OverrideType = 'localStorage' | 'sessionStorage' | 'cookie'

export interface ExtendedStorageOverride extends StorageOverride {
  id?: string
  featureName?: string
  featureType?: string
}
