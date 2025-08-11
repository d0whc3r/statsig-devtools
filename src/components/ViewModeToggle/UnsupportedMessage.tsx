import React from 'react'

interface UnsupportedMessageProps {
  className?: string
}

/**
 * Component for displaying unsupported sidebar message
 */
export function UnsupportedMessage({ className = '' }: UnsupportedMessageProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs text-gray-500">Sidebar not supported</span>
    </div>
  )
}
