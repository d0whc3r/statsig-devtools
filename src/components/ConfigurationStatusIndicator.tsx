import React from 'react'

import { getStatusIconPath, getStatusIndicatorClass, getStatusText } from '../utils/configuration-formatters'

import type { EvaluationResult } from '../services/statsig-integration'

interface ConfigurationStatusIndicatorProps {
  result?: EvaluationResult
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

/**
 * Status indicator component for configuration evaluation results
 */
export const ConfigurationStatusIndicator: React.FC<ConfigurationStatusIndicatorProps> = ({
  result,
  size = 'md',
  showText = true,
}) => {
  const iconSizeClass = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size]

  const statusClass = getStatusIndicatorClass(result?.passed)
  const statusText = getStatusText(result?.passed)
  const iconPath = getStatusIconPath(result?.passed)

  return (
    <span className={statusClass}>
      <svg className={iconSizeClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
      </svg>
      {showText && statusText}
    </span>
  )
}
