import React from 'react'

interface ConfigurationErrorStateProps {
  error: string
}

/**
 * Error state component for configuration list
 */
export function ConfigurationErrorState({ error }: ConfigurationErrorStateProps) {
  return (
    <div className="p-4">
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading configurations</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
