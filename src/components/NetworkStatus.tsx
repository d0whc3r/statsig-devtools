import React, { useEffect, useState } from 'react'

import { retryManager } from '../services/retry-manager'

import type { NetworkStatus as NetworkStatusType } from '../services/retry-manager'

interface NetworkStatusProps {
  showDetails?: boolean
  className?: string
}

/**
 * Network status component with retry queue information
 */
export function NetworkStatus({ showDetails = false, className = '' }: NetworkStatusProps) {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatusType>(retryManager.getNetworkStatus())
  const [retryQueueStatus, setRetryQueueStatus] = useState(retryManager.getRetryQueueStatus())
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const updateStatus = () => {
      setNetworkStatus(retryManager.getNetworkStatus())
      setRetryQueueStatus(retryManager.getRetryQueueStatus())
    }

    // Listen for network status changes
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    // Update status periodically
    const interval = setInterval(updateStatus, 5000)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
      clearInterval(interval)
    }
  }, [])

  const totalQueuedOperations = Object.values(retryQueueStatus).reduce((sum, count) => sum + count, 0)

  const getStatusColor = () => {
    if (!networkStatus.isOnline) return 'text-red-500'
    if (totalQueuedOperations > 0) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getStatusIcon = () => {
    if (!networkStatus.isOnline) {
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636l-12.728 12.728m0 0L5.636 18.364m12.728-12.728L18.364 18.364M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.635 2.25 12 6.615 2.25 12 2.25z"
          />
        </svg>
      )
    }

    if (totalQueuedOperations > 0) {
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    }

    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )
  }

  const getStatusText = () => {
    if (!networkStatus.isOnline) {
      return 'Offline'
    }
    if (totalQueuedOperations > 0) {
      return `${totalQueuedOperations} queued`
    }
    return 'Online'
  }

  const formatLastOnlineTime = () => {
    if (!networkStatus.lastOnlineTime) return 'Unknown'

    const lastOnline = new Date(networkStatus.lastOnlineTime)
    const now = new Date()
    const diffMs = now.getTime() - lastOnline.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className={`h-2 w-2 rounded-full ${networkStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-xs text-gray-500">{getStatusText()}</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors hover:bg-gray-100 ${getStatusColor()}`}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 z-10 mt-1 w-64 rounded-md border border-gray-200 bg-white p-3 shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Network Status</span>
              <div className={`flex items-center gap-1 ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="text-sm">{networkStatus.isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>

            {!networkStatus.isOnline && networkStatus.lastOnlineTime && (
              <div className="text-xs text-gray-500">Last online: {formatLastOnlineTime()}</div>
            )}

            {totalQueuedOperations > 0 && (
              <div className="border-t border-gray-200 pt-2">
                <div className="mb-1 text-sm font-medium text-gray-700">Retry Queue</div>
                <div className="space-y-1">
                  {Object.entries(retryQueueStatus).map(
                    ([queueName, count]) =>
                      count > 0 && (
                        <div key={queueName} className="flex justify-between text-xs">
                          <span className="text-gray-600">{queueName}</span>
                          <span className="text-gray-500">{count} operations</span>
                        </div>
                      ),
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500">Operations will retry when connection is restored</div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-2">
              <button
                onClick={() => {
                  // Force refresh network status
                  setNetworkStatus(retryManager.getNetworkStatus())
                  setRetryQueueStatus(retryManager.getRetryQueueStatus())
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Refresh Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowDropdown(false)
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close dropdown"
        />
      )}
    </div>
  )
}

/**
 * Simple network indicator for minimal display
 */
export function NetworkIndicator({ className = '' }: { className?: string }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine)

    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-xs text-gray-500">{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  )
}
