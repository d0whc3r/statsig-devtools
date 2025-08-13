import { useState } from 'react'

interface DevToolsInfoProps {
  className?: string
}

export function DevToolsInfo({ className = '' }: DevToolsInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className={`rounded-lg border border-blue-200 bg-blue-50 p-3 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-left text-sm font-medium text-blue-900 hover:text-blue-700"
      >
        <span className="flex items-center gap-2">🔧 Development Tools</span>
        <span className="text-blue-600">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2 text-xs text-blue-800">
          <div>
            <strong>React DevTools:</strong> Open browser DevTools → React tab
          </div>
          <div>
            <strong>Redux DevTools:</strong> Open browser DevTools → Redux tab
          </div>
          <div>
            <strong>Available Stores:</strong>
            <ul className="mt-1 ml-4 space-y-1">
              <li>• auth-store (authentication state)</li>
              <li>• configuration-store (Statsig configs)</li>
              <li>• override-store (storage overrides)</li>
              <li>• ui-store (UI state)</li>
            </ul>
          </div>
          <div>
            <strong>Console Access:</strong> <code>window.statsigStores</code>
          </div>
          <div className="border-t border-blue-200 pt-2">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.statsigStores) {
                  console.log('🏪 Current store states:', window.statsigStores.getAllStoreStates())
                }
              }}
              className="text-blue-600 underline hover:text-blue-800"
            >
              Log all store states to console
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
