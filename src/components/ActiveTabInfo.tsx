import React from 'react'

import { useActiveTab } from '../hooks/useActiveTab'

interface ActiveTabInfoProps {
  className?: string
  compact?: boolean
}

/**
 * Component to display active tab information and injection status
 */
export function ActiveTabInfo({ className = '', compact = false }: ActiveTabInfoProps) {
  const { tabInfo, isLoading } = useActiveTab()

  if (isLoading) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-gray-50 p-3 ${className}`}>
        <div className="flex items-center text-sm text-gray-600">
          <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading tab information...
        </div>
      </div>
    )
  }

  const getStatusIcon = () => {
    if (tabInfo.canInject) {
      return (
        <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    } else {
      return (
        <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      )
    }
  }

  const getStatusColor = () =>
    tabInfo.canInject ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'

  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        <div className="flex items-center">
          {getStatusIcon()}
          <span className="ml-1 font-medium">{tabInfo.canInject ? 'Ready' : 'Error'}</span>
        </div>
        {tabInfo.domain && (
          <span className="max-w-32 truncate font-mono text-gray-600" title={tabInfo.domain}>
            {tabInfo.domain}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={`rounded-lg border border-gray-200 bg-white ${className}`}>
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <span className="text-blue-600">🌐</span>
          Active Tab
        </h3>
      </div>

      <div className="space-y-3 p-4">
        {/* Injection Status */}
        <div className={`flex items-center rounded-md border p-3 ${getStatusColor()}`}>
          <div className="flex items-center">
            {getStatusIcon()}
            <div className="ml-3">
              <div className="text-sm font-medium">
                {tabInfo.canInject ? 'Override injection available' : 'Override injection not available'}
              </div>
              {tabInfo.reason && !tabInfo.canInject && <div className="mt-1 text-xs">{tabInfo.reason}</div>}
            </div>
          </div>
        </div>

        {/* Tab Details */}
        {tabInfo.url && (
          <div className="space-y-2">
            <div>
              <div className="text-xs font-medium text-gray-700">Domain:</div>
              <div className="mt-1 rounded bg-gray-50 px-2 py-1 font-mono text-sm text-gray-900">
                {tabInfo.domain || 'Unknown'}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-700">URL:</div>
              <div className="mt-1 rounded bg-gray-50 px-2 py-1 font-mono text-xs break-all text-gray-600">
                {tabInfo.url}
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!tabInfo.canInject && (
          <div className="rounded bg-gray-50 p-2 text-xs text-gray-500">
            <strong>Note:</strong> Overrides can only be applied to regular web pages. Browser internal pages,
            extensions, and some restricted sites are not supported.
            {tabInfo.reason && <div className="mt-1 font-medium text-red-600">Reason: {tabInfo.reason}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
