import { RefreshCw, User } from 'lucide-react'
import { useState } from 'react'

import { ScriptStatusBadge } from '@/src/components/ScriptStatusBadge/ScriptStatusBadge'
import { Badge } from '@/src/components/ui/Badge/Badge'
import { Button } from '@/src/components/ui/Button/Button'
import {
  type ConfigurationType,
  ConfigurationTypeSelect,
} from '@/src/components/ui/ConfigurationTypeSelect/ConfigurationTypeSelect'
import { Loading } from '@/src/components/ui/Loading/Loading'
import { useApiOverrides } from '@/src/hooks/useApiOverrides'
import { useStatsigData } from '@/src/hooks/useStatsigData'
import { useViewMode } from '@/src/hooks/useViewMode'
import { cn } from '@/src/utils/cn'
import { Logger } from '@/src/utils/logger'

import { FeatureGatesWindow } from '../FeatureGates/FetureGatesWindow'
import { DynamicConfigsTab } from './DynamicConfigsTab'
import { ExperimentsTab } from './ExperimentsTab'

const logger = new Logger('Dashboard')

// Main Dashboard Component
export function Dashboard() {
  const { viewMode } = useViewMode()
  const {
    gates,
    experiments,
    dynamicConfigs,
    isLoadingGates,
    isLoadingExperiments,
    isLoadingDynamicConfigs,
    refreshData,
  } = useStatsigData()
  const {
    overrides: apiOverrides,
    applyGateOverride,
    applyExperimentOverride,
    removeGateOverride,
    removeExperimentOverride,
    isAuthenticated,
    getCurrentUserIdentifier,
  } = useApiOverrides()

  const [localOverrides, setLocalOverrides] = useState<OverrideData[]>([])
  const [activeTab, setActiveTab] = useState<ConfigurationType>('feature-gates')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshData()
      logger.info('Data refreshed successfully with cache invalidation')
    } catch (error) {
      logger.error('Error refreshing data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleOverride = async (
    id: string,
    value: unknown,
    source: 'browser' | 'api',
    type: 'feature_gate' | 'experiment' | 'dynamic_config',
  ) => {
    if (source === 'api') {
      // Handle API overrides
      if (value === null) {
        // Remove override
        const currentUserId = getCurrentUserIdentifier()
        if (type === 'feature_gate') {
          await removeGateOverride(id, id, currentUserId ?? undefined)
        } else if (type === 'experiment') {
          await removeExperimentOverride(id, id, currentUserId ?? undefined)
        }
        logger.info(`Removed ${type} override for ${id} via API`)
      } else {
        // Apply override
        const currentUserId = getCurrentUserIdentifier()
        if (type === 'feature_gate') {
          await applyGateOverride(id, id, value as boolean, currentUserId ?? undefined)
        } else if (type === 'experiment') {
          await applyExperimentOverride(id, id, value as string, currentUserId ?? undefined)
        }
        logger.info(`Applied ${type} override for ${id}:`, value, `via API`)
      }

      // Refresh data to show updated state (this will invalidate cache)
      await refreshData()
    } else {
      // Handle browser overrides
      const newOverride: OverrideData = {
        id: `override_${Date.now()}`,
        type,
        targetId: id,
        value,
        source,
        timestamp: new Date().toISOString(),
      }

      setLocalOverrides((prev) => [...prev, newOverride])

      // Simulate storing override
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`statsig_override_${id}`, JSON.stringify(value))
      }

      logger.info(`Applied ${type} override for ${id}:`, value, `via ${source}`)
    }
  }

  const containerClasses = cn('space-y-6', {
    'p-2': viewMode === 'popup',
    'p-4': viewMode === 'tab',
    'p-1': viewMode === 'sidebar',
  })

  // Show loading state
  if (isLoadingGates || isLoadingExperiments || isLoadingDynamicConfigs || isRefreshing) {
    const loadingText = isRefreshing ? 'Refreshing configurations...' : 'Loading configurations...'
    return <Loading text={loadingText} />
  }

  // Show message if no data is available
  const hasData = Boolean(gates.length || experiments.length || dynamicConfigs.length)
  if (!hasData) {
    return (
      <div className={containerClasses}>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No configurations found</p>
            <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={cn('mr-2 h-3 w-3', { 'animate-spin': isRefreshing })} />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const totalOverrides = localOverrides.length + apiOverrides.length

  return (
    <div className={containerClasses}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScriptStatusBadge />
          {isAuthenticated && (
            <Badge variant="default" className="text-xs">
              API Connected
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {totalOverrides} overrides
            {apiOverrides.length > 0 && (
              <span className="text-xs text-blue-600 dark:text-blue-400">({apiOverrides.length} API)</span>
            )}
          </Badge>
          <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="h-6 px-2">
            <RefreshCw className={cn('h-3 w-3', { 'animate-spin': isRefreshing })} />
          </Button>
        </div>
      </div>

      {/* User Info Panel - Show in tab and sidebar views */}
      {/* {(viewMode === 'tab' || viewMode === 'sidebar') && (
        <div className="mb-4">
          <UserInfoPanel />
        </div>
      )} */}

      <div className="mb-6">
        <ConfigurationTypeSelect
          value={activeTab}
          onValueChange={setActiveTab}
          className={cn({
            'max-w-[180px]': viewMode === 'popup',
            'max-w-[200px]': viewMode === 'sidebar' || viewMode === 'tab',
          })}
        />
      </div>

      <div>
        {activeTab === 'feature-gates' && (
          <FeatureGatesWindow
            gates={gates}
            onOverride={(id, value, source) => handleOverride(id, value, source, 'feature_gate')}
          />
        )}

        {activeTab === 'experiments' && (
          <ExperimentsTab
            experiments={experiments}
            onOverride={(id, value, source) => handleOverride(id, value, source, 'experiment')}
          />
        )}

        {activeTab === 'dynamic-configs' && (
          <DynamicConfigsTab
            configs={dynamicConfigs}
            onOverride={(id, value, source) => handleOverride(id, value, source, 'dynamic_config')}
          />
        )}
      </div>
    </div>
  )
}
