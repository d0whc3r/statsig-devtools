import React, { useCallback, useEffect, useState } from 'react'

import { statsigOverrideApiService } from '../services/statsig-override-api'
import { LoadingSpinner } from './LoadingSpinner'

import type { StatsigConfigurationItem } from '../types'

interface ExperimentOverrideFormProps {
  experiment: StatsigConfigurationItem
  onClose: () => void
}

interface StableIdInfo {
  stableId: string | null
  userId: string | null
  source: 'stableId' | 'userId' | null
}

/**
 * Form component for creating experiment overrides
 * Allows users to override experiment group assignments using stableId or userId from localStorage
 */
export function ExperimentOverrideForm({ experiment, onClose }: ExperimentOverrideFormProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [stableIdInfo, setStableIdInfo] = useState<StableIdInfo>({
    stableId: null,
    userId: null,
    source: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingIds, setIsLoadingIds] = useState(true)

  /**
   * Get stableId and userId from localStorage of the active tab
   */
  const loadUserIdentifiers = useCallback(async () => {
    setIsLoadingIds(true)
    setError(null)

    try {
      // Get current tab to execute script
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      const tab = tabs[0]
      if (!tab?.id) {
        throw new Error('No active tab found')
      }

      // Execute script to get localStorage values
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const stableIdKeys = Object.keys(window.localStorage).filter(key => 
            key.startsWith('statsig.stable_id.')
          )
          const userIdKeys = Object.keys(window.localStorage).filter(key => 
            key.startsWith('statsig.user_id.') || key === 'statsig_user_id'
          )

          let stableId = null
          let userId = null

          // Get stableId
          if (stableIdKeys.length > 0) {
            stableId = window.localStorage.getItem(stableIdKeys[0])
          }

          // Get userId
          if (userIdKeys.length > 0) {
            userId = window.localStorage.getItem(userIdKeys[0])
          }

          return { stableId, userId }
        },
      })

      const { stableId, userId } = result[0].result || {}
       
       // Determine which identifier to use (prefer stableId)
       if (stableId) {
         setStableIdInfo({ stableId: stableId || null, userId: userId || null, source: 'stableId' })
       } else if (userId) {
         setStableIdInfo({ stableId: stableId || null, userId: userId || null, source: 'userId' })
       } else {
         setStableIdInfo({ stableId: null, userId: null, source: null })
       }
    } catch (err) {
      console.error('Failed to load user identifiers:', err)
      setError(err instanceof Error ? err.message : 'Failed to load user identifiers')
      setStableIdInfo({ stableId: null, userId: null, source: null })
    } finally {
      setIsLoadingIds(false)
    }
  }, [])

  /**
   * Handle form submission to create override
   */
  const handleCreateOverride = useCallback(async () => {
    if (!selectedGroup || !stableIdInfo.source) {
      setError('Please select a group and ensure user identifier is available')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const identifierValue = stableIdInfo.source === 'stableId' 
        ? stableIdInfo.stableId 
        : stableIdInfo.userId

      if (!identifierValue) {
        throw new Error('User identifier not available')
      }

      // Create override using Statsig's API
      await statsigOverrideApiService.createExperimentOverride({
        experimentName: experiment.name,
        userId: stableIdInfo.source === 'userId' ? identifierValue : undefined,
        stableId: stableIdInfo.source === 'stableId' ? identifierValue : undefined,
        groupName: selectedGroup,
      })
      onClose()
    } catch (err) {
      console.error('Failed to create override:', err)
      setError(err instanceof Error ? err.message : 'Failed to create override')
    } finally {
      setIsLoading(false)
    }
  }, [selectedGroup, stableIdInfo, experiment.name, onClose])

  // Load user identifiers on mount
  useEffect(() => {
    loadUserIdentifiers()
  }, [loadUserIdentifiers])

  // Get available groups from experiment
  const availableGroups = experiment.groups || []

  return (
    <div className="animate-in slide-in-from-top-4 relative rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 shadow-xl backdrop-blur-sm duration-300">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute top-0 left-0 h-full w-full rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
      <div className="pointer-events-none absolute top-4 right-4 h-20 w-20 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-xl" />
      <div className="pointer-events-none absolute bottom-4 left-4 h-16 w-16 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-400/10 blur-xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Override Experiment</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="badge-experiment">{experiment.name}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="icon-button-professional h-8 w-8 text-gray-500 hover:text-gray-700"
            title="Close"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleCreateOverride(); }} className="space-y-6">
          {/* User Identifier Status */}
          <div className="space-y-2">
            <div className="block text-sm font-medium text-gray-700">User Identifier</div>
            {isLoadingIds ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <LoadingSpinner size="sm" />
                Loading user identifiers...
              </div>
            ) : stableIdInfo.source ? (
              <div className="flex items-center gap-2">
                <span className="badge-professional bg-green-100 text-green-800 border-green-200">
                  {stableIdInfo.source === 'stableId' ? 'Stable ID' : 'User ID'}
                </span>
                <span className="text-sm font-mono text-gray-500">
                   {`${(stableIdInfo.source === 'stableId' 
                     ? stableIdInfo.stableId 
                     : stableIdInfo.userId)?.substring(0, 8)}...`}
                 </span>
              </div>
            ) : (
              <div className="alert-professional alert-error p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm">No user identifier found in localStorage. Make sure Statsig is initialized on this page.</span>
                </div>
              </div>
            )}
          </div>

          {/* Group Selection */}
          <div className="space-y-2">
            <label htmlFor="group-select" className="block text-sm font-medium text-gray-700">Select Group</label>
            {availableGroups.length > 0 ? (
              <select
                id="group-select"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="input-professional w-full"
              >
                <option value="">Choose experiment group</option>
                {availableGroups.map((group) => (
                  <option key={group.name} value={group.name}>
                    {group.name} ({Math.round(group.size * 100) / 100}%)
                  </option>
                ))}
              </select>
            ) : (
              <div className="alert-professional p-3 rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-blue-700">No groups available for this experiment.</span>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="alert-professional alert-error p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!selectedGroup || !stableIdInfo.source || isLoading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating Override...
                </>
              ) : (
                'Create Override'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4 py-2"
            >
              Cancel
            </button>
          </div>

          {/* Info */}
          <div className="alert-professional p-3 rounded-lg bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-blue-700">
                This override will be applied to the current domain and will persist until removed.
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}