import React, { useCallback, useEffect, useState } from 'react'

import { localOverrideService } from '../services/local-override.service'
import { logger } from '../utils/logger'
import { LoadingSpinner } from './LoadingSpinner'

import type { LocalExperimentOverride } from '../services/local-override.service'
import type { StatsigConfigurationItem } from '../types'

interface StatsigUIProps {
  configurations: StatsigConfigurationItem[]
  isLoading: boolean
  onRefresh: () => void
}

/**
 * Main Statsig UI component that displays configurations and overrides
 */
export function StatsigUI({ configurations, isLoading, onRefresh }: StatsigUIProps) {
  const [activeOverrides, setActiveOverrides] = useState<LocalExperimentOverride[]>([])
  const [isLoadingOverrides, setIsLoadingOverrides] = useState(false)

  /**
   * Load active overrides from the local override service
   */
  const loadActiveOverrides = useCallback(async () => {
    setIsLoadingOverrides(true)
    try {
      const overrides = localOverrideService.getActiveOverrides()
      setActiveOverrides(overrides)
    } catch (error) {
      logger.error('Failed to load active overrides:', error)
    } finally {
      setIsLoadingOverrides(false)
    }
  }, [])

  /**
   * Handle removing an override
   */
  const handleRemoveOverride = useCallback(
    async (override: LocalExperimentOverride) => {
      try {
        const response = await localOverrideService.removeExperimentOverride(
          override.experimentName,
          override.userId,
          override.stableId,
        )

        if (response.success) {
          logger.info(`Successfully removed override for ${override.experimentName}`)
          await loadActiveOverrides() // Refresh the list
        } else {
          logger.error(`Failed to remove override: ${response.message}`)
        }
      } catch (error) {
        logger.error('Error removing override:', error)
      }
    },
    [loadActiveOverrides],
  )

  /**
   * Handle clearing all overrides
   */
  const handleClearAllOverrides = useCallback(async () => {
    try {
      await localOverrideService.clearAllOverrides()
      logger.info('Successfully cleared all overrides')
      await loadActiveOverrides() // Refresh the list
    } catch (error) {
      logger.error('Error clearing all overrides:', error)
    }
  }, [loadActiveOverrides])

  // Load overrides on component mount
  useEffect(() => {
    loadActiveOverrides()
  }, [loadActiveOverrides])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Loading Statsig configurations...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Overrides Section */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-lg font-medium text-gray-900">Active Local Overrides</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadActiveOverrides}
              disabled={isLoadingOverrides}
              className="rounded bg-blue-50 px-3 py-1 text-sm text-blue-600 hover:bg-blue-100 disabled:opacity-50"
            >
              {isLoadingOverrides ? 'Loading...' : 'Refresh'}
            </button>
            {activeOverrides.length > 0 && (
              <button
                onClick={handleClearAllOverrides}
                className="rounded bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          {activeOverrides.length === 0 ? (
            <p className="py-4 text-center text-gray-500">No active overrides</p>
          ) : (
            <div className="space-y-2">
              {activeOverrides.map((override, index) => (
                <OverrideItem
                  key={`${override.experimentName}-${override.userId || override.stableId || 'default'}-${index}`}
                  override={override}
                  onRemove={() => handleRemoveOverride(override)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Configurations Section */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-lg font-medium text-gray-900">Statsig Configurations</h3>
          <button onClick={onRefresh} className="rounded bg-blue-50 px-3 py-1 text-sm text-blue-600 hover:bg-blue-100">
            Refresh
          </button>
        </div>

        <div className="p-4">
          {configurations.length === 0 ? (
            <p className="py-4 text-center text-gray-500">No configurations found</p>
          ) : (
            <div className="space-y-2">
              {configurations.map((config, index) => (
                <ConfigurationItem
                  key={`${config.name}-${index}`}
                  configuration={config}
                  hasOverride={localOverrideService.hasOverrides(config.name)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Component to display a single override item
 */
interface OverrideItemProps {
  override: LocalExperimentOverride
  onRemove: () => void
}

function OverrideItem({ override, onRemove }: OverrideItemProps) {
  const formatTimestamp = (timestamp: number) => new Date(timestamp).toLocaleString()

  const getIdentifier = () =>
    override.userId ? `User: ${override.userId}` : override.stableId ? `Stable ID: ${override.stableId}` : 'Default'

  return (
    <div className="flex items-center justify-between rounded border bg-gray-50 p-3">
      <div className="flex-1">
        <div className="flex items-center space-x-4">
          <span className="font-medium text-gray-900">{override.experimentName}</span>
          <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">{override.groupName}</span>
          <span className="text-sm text-gray-500">{getIdentifier()}</span>
        </div>
        <div className="mt-1 text-xs text-gray-400">Created: {formatTimestamp(override.timestamp)}</div>
      </div>
      <button onClick={onRemove} className="rounded bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100">
        Remove
      </button>
    </div>
  )
}

/**
 * Component to display a single configuration item
 */
interface ConfigurationItemProps {
  configuration: StatsigConfigurationItem
  hasOverride: boolean
}

function ConfigurationItem({ configuration, hasOverride }: ConfigurationItemProps) {
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'experiment':
        return 'bg-purple-100 text-purple-800'
      case 'feature_gate':
        return 'bg-blue-100 text-blue-800'
      case 'dynamic_config':
        return 'bg-green-100 text-green-800'
      case 'layer':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex items-center justify-between rounded border bg-gray-50 p-3">
      <div className="flex-1">
        <div className="flex items-center space-x-4">
          <span className="font-medium text-gray-900">{configuration.name}</span>
          <span className={`rounded px-2 py-1 text-xs ${getTypeColor(configuration.type)}`}>{configuration.type}</span>
          {hasOverride && (
            <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">Override Active</span>
          )}
        </div>
        {configuration.entity && <div className="mt-1 text-sm text-gray-500">Entity: {configuration.entity}</div>}
      </div>
      <div className="text-sm text-gray-400">ID: {configuration.id || 'N/A'}</div>
    </div>
  )
}
