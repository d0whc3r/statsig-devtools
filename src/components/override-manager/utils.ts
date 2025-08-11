import type { StorageOverride } from '../../services/statsig-integration'

/**
 * Get override type icon
 */
export const getOverrideIcon = (type: string): string => {
  switch (type) {
    case 'localStorage':
      return '💾'
    case 'sessionStorage':
      return '🔄'
    case 'cookie':
      return '🍪'
    default:
      return '⚙️'
  }
}

/**
 * Get override type color classes
 */
export const getOverrideColor = (type: string): string => {
  switch (type) {
    case 'localStorage':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'sessionStorage':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'cookie':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Generate override ID
 */
export const getOverrideId = (override: StorageOverride, index: number): string => {
  const extendedOverride = override as StorageOverride & { id?: string }
  return extendedOverride.id || `${override.type}:${override.key}:${override.domain || 'default'}:${index}`
}

/**
 * Truncate value for display
 */
export const truncateValue = (value: unknown, maxLength: number): string => {
  if (typeof value === 'string') {
    return value.length > maxLength ? `${value.substring(0, maxLength)}...` : value
  }
  return JSON.stringify(value)
}
