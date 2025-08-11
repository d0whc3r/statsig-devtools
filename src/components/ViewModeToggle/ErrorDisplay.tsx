import React from 'react'

interface ErrorDisplayProps {
  error: string | null
}

/**
 * Component for displaying view mode toggle errors
 */
export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null

  return (
    <div className="max-w-32 truncate text-xs text-red-600" title={error}>
      {error}
    </div>
  )
}
