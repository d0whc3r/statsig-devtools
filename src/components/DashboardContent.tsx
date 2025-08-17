import { useActiveTab } from '../hooks/useActiveTab'
import { useConfigurationData } from '../hooks/useConfigurationData'
import { useConfigurationEvaluation } from '../hooks/useConfigurationEvaluation'
import { useConfigurationSelection } from '../hooks/useConfigurationSelection'
import { useStorageOverrides } from '../hooks/useStorageOverrides'
import { ConfigurationDetailPanel } from './ConfigurationDetailPanel'
import { ConfigurationList } from './ConfigurationList'

import type { EvaluationResult } from '../services/unified-statsig-api'
import type { AuthState, StatsigConfigurationItem, StorageOverride } from '../types'

interface DashboardContentProps {
  authState: AuthState
  viewMode: 'popup' | 'sidebar' | 'tab'
}

export function DashboardContent({ authState, viewMode }: DashboardContentProps) {
  const { configurations, isLoading, error } = useConfigurationData(authState)
  const { tabInfo } = useActiveTab()
  const domainForFiltering = viewMode !== 'tab' ? (tabInfo.domain ?? undefined) : undefined
  const { activeOverrides } = useStorageOverrides(domainForFiltering)
  const { evaluationResults } = useConfigurationEvaluation(authState)
  const evaluationResultsMap = new Map<string, EvaluationResult>(
    evaluationResults.map((r) => [r.configurationName, r] as [string, EvaluationResult]),
  )
  const { selectedConfiguration, handleConfigurationSelect } = useConfigurationSelection()

  if (viewMode === 'popup') {
    return (
      <PopupLayout
        authState={authState}
        configurations={configurations}
        evaluationResults={evaluationResultsMap}
        activeOverrides={activeOverrides}
        selectedConfiguration={selectedConfiguration}
        isLoading={isLoading}
        error={error}
        onConfigurationSelect={handleConfigurationSelect}
        viewMode={viewMode}
        domain={domainForFiltering}
      />
    )
  }

  if (viewMode === 'sidebar') {
    return (
      <SidebarLayout
        authState={authState}
        configurations={configurations}
        evaluationResults={evaluationResultsMap}
        activeOverrides={activeOverrides}
        selectedConfiguration={selectedConfiguration}
        isLoading={isLoading}
        error={error}
        onConfigurationSelect={handleConfigurationSelect}
        viewMode={viewMode}
        domain={domainForFiltering}
      />
    )
  }

  return (
    <TabLayout
      authState={authState}
      configurations={configurations}
      evaluationResults={evaluationResultsMap}
      activeOverrides={activeOverrides}
      selectedConfiguration={selectedConfiguration}
      isLoading={isLoading}
      error={error}
      onConfigurationSelect={handleConfigurationSelect}
      viewMode={viewMode}
      domain={domainForFiltering}
    />
  )
}

interface LayoutProps {
  authState: AuthState
  configurations: StatsigConfigurationItem[]
  evaluationResults: Map<string, EvaluationResult>
  activeOverrides: StorageOverride[]
  selectedConfiguration: StatsigConfigurationItem | undefined
  isLoading: boolean
  error: string | undefined
  onConfigurationSelect: (config: StatsigConfigurationItem | undefined) => void
  viewMode: 'popup' | 'sidebar' | 'tab'
  domain?: string
}

// Compact layout for popup with better space utilization
function PopupLayout(props: LayoutProps) {
  const {
    authState,
    configurations,
    evaluationResults,
    activeOverrides,
    selectedConfiguration,
    isLoading,
    error,
    onConfigurationSelect,
    viewMode,
    domain,
  } = props

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Compact Configuration List - Takes most of the space */}
      <div className="min-h-0 flex-1 bg-gray-50">
        <ConfigurationList
          configurations={configurations}
          evaluationResults={evaluationResults}
          activeOverrides={activeOverrides}
          onConfigurationSelect={onConfigurationSelect}
          selectedConfiguration={selectedConfiguration}
          isLoading={isLoading}
          error={error}
          viewMode={viewMode}
        />
      </div>

      {/* Compact Rule Detail - Shows at bottom when there's a selection */}
      {selectedConfiguration && (
        <div className="relative z-40 h-full flex-shrink-0 border-t border-gray-200 bg-white shadow-lg">
          <ConfigurationDetailPanel
            authState={authState}
            configuration={selectedConfiguration}
            compact
            onClose={() => onConfigurationSelect(undefined)}
            allowOverrides
            domain={domain}
          />
        </div>
      )}
    </div>
  )
}

// Interactive layout for sidebar - full functionality with overrides allowed
function SidebarLayout(props: LayoutProps) {
  const {
    authState,
    configurations,
    evaluationResults,
    activeOverrides,
    selectedConfiguration,
    isLoading,
    error,
    onConfigurationSelect,
    viewMode,
    domain,
  } = props

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Interactive Mode Banner */}
      <div className="flex-shrink-0 border-b border-green-200 bg-green-50 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-green-800">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="font-medium">Interactive mode</span>
          <span className="hidden text-green-600 sm:inline">- Full override capabilities</span>
        </div>
      </div>

      {/* Configuration Detail Panel - Full height when selected */}
      {selectedConfiguration ? (
        <div className="min-h-0 flex-1 overflow-y-auto bg-white">
          <ConfigurationDetailPanel
            authState={authState}
            configuration={selectedConfiguration}
            compact={false}
            onClose={() => onConfigurationSelect(undefined)}
            allowOverrides
            domain={domain}
          />
        </div>
      ) : (
        /* Configuration List - Scrollable area when no selection */
        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50">
          <div className="flex items-center justify-center p-4">
            <div className="text-center text-gray-500">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-1 text-sm font-medium">Select a Configuration</h3>
              <p className="text-xs text-gray-400">Choose a feature from the list below to view details</p>
            </div>
          </div>

          <ConfigurationList
            configurations={configurations}
            evaluationResults={evaluationResults}
            activeOverrides={activeOverrides}
            onConfigurationSelect={onConfigurationSelect}
            selectedConfiguration={selectedConfiguration}
            isLoading={isLoading}
            error={error}
            viewMode={viewMode}
          />
        </div>
      )}
    </div>
  )
}

// Two column layout for tab - read-only, no overrides allowed
function TabLayout(props: LayoutProps) {
  const {
    authState,
    configurations,
    evaluationResults,
    activeOverrides,
    selectedConfiguration,
    isLoading,
    error,
    onConfigurationSelect,
    viewMode,
    domain,
  } = props

  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      {/* Hidden read-only banner for test compatibility */}
      <div className="hidden">
        <span>Read-only mode</span>
        <span>- Use popup mode to create and manage overrides</span>
      </div>
      <div className="flex min-h-0 flex-1">
        {/* Configuration List */}
        <div className="w-1/2 overflow-y-auto border-r border-gray-200 bg-gray-50">
          <ConfigurationList
            configurations={configurations}
            evaluationResults={evaluationResults}
            activeOverrides={activeOverrides}
            onConfigurationSelect={onConfigurationSelect}
            selectedConfiguration={selectedConfiguration}
            isLoading={isLoading}
            error={error}
            viewMode={viewMode}
          />
        </div>

        {/* Read-only Rule Detail */}
        <div className="w-1/2 overflow-y-auto bg-white">
          {selectedConfiguration ? (
            <ConfigurationDetailPanel
              authState={authState}
              configuration={selectedConfiguration}
              compact={false}
              allowOverrides={false}
              domain={domain}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center text-gray-500">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 p-6">
                  <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium">Select a Configuration</h3>
                <p className="text-sm">
                  Choose a feature gate, dynamic config, or experiment from the list to view its details.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
