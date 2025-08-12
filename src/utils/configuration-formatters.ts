/**
 * Utility functions for formatting configuration data
 */

/**
 * Format operator for display
 */
export const formatOperator = (operator: string): string => {
  const operatorMap: Record<string, string> = {
    eq: 'equals',
    neq: 'not equals',
    gt: 'greater than',
    gte: 'greater than or equal',
    lt: 'less than',
    lte: 'less than or equal',
    contains: 'contains',
    not_contains: 'does not contain',
    in: 'is in',
    not_in: 'is not in',
    any: 'any',
  }
  return operatorMap[operator] || operator
}

/**
 * Format condition type for display
 */
export const formatConditionType = (type: string): string => {
  const typeMap: Record<string, string> = {
    user_id: 'User ID',
    email: 'Email',
    country: 'Country',
    locale: 'Locale',
    app_version: 'App Version',
    custom: 'Custom Field',
    user_bucket: 'User Bucket',
    environment_tier: 'Environment Tier',
    passes_gate: 'Passes Gate',
    fails_gate: 'Fails Gate',
    time: 'Time',
    environment: 'Environment',
    user_agent: 'User Agent',
    ip_address: 'IP Address',
    statsig_environment: 'Statsig Environment',
  }
  return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

/**
 * Format configuration type name for display
 */
export const formatTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    feature_gate: 'Feature Gate',
    experiment: 'Experiment',
    dynamic_config: 'Dynamic Config',
    autotune: 'Autotune',
    layer: 'Layer',
  }
  return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

/**
 * Format value for display based on type
 */
export const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return 'null'
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number') {
    return value.toString()
  }

  if (Array.isArray(value)) {
    return `[${value.map(formatValue).join(', ')}]`
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return '[Object]'
    }
  }

  return String(value)
}

/**
 * Get type badge class for configuration type
 */
export const getTypeBadgeClass = (type: string): string => {
  const classMap: Record<string, string> = {
    feature_gate: 'badge-feature-gate',
    experiment: 'badge-experiment',
    dynamic_config: 'badge-dynamic-config',
    autotune: 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-orange-200',
    layer: 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200',
  }
  return classMap[type] || 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200'
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text
  }
  return `${text.substring(0, maxLength)}...`
}

/**
 * Format percentage value
 */
export const formatPercentage = (value: number): string => `${(value * 100).toFixed(1)}%`

/**
 * Format timestamp for display
 */
export const formatTimestamp = (timestamp: number | string): string => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

/**
 * Get status indicator class based on evaluation result
 */
export const getStatusIndicatorClass = (passed?: boolean): string => {
  if (passed === undefined) {
    return 'status-badge status-badge-pending'
  }
  return passed ? 'status-badge status-badge-success' : 'status-badge status-badge-error'
}

/**
 * Get status text based on evaluation result
 */
export const getStatusText = (passed?: boolean): string => {
  if (passed === undefined) {
    return 'Pending'
  }
  return passed ? 'Pass' : 'Fail'
}

/**
 * Get status icon path based on evaluation result
 */
export const getStatusIconPath = (passed?: boolean): string => {
  if (passed === undefined) {
    return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
  }
  return passed ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'
}
