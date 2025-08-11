import React from 'react'

import { LoadingSpinner } from '../LoadingSpinner'

/**
 * Loading state component for configuration list
 */
export function ConfigurationLoadingState() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <LoadingSpinner size="md" />
        <p className="mt-2 text-sm text-gray-600">Loading configurations...</p>
      </div>
    </div>
  )
}
