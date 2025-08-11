import { useConfigurationData } from '../hooks/useConfigurationData'
import { useConfigurationEvaluation } from '../hooks/useConfigurationEvaluation'
import { useConfigurationSelection } from '../hooks/useConfigurationSelection'
import { useStorageOverrides } from '../hooks/useStorageOverrides'
import { ConfigurationDetailPanel } from './ConfigurationDetailPanel'
import { ConfigurationList } from './ConfigurationList'

import type { EvaluationResult, StorageOverride } from '../services/statsig-integration'
import type { AuthState, StatsigConfigurationItem } from '../types'

interface DashboardContentProps {
  authState: AuthState
  viewMode: 'popup' | 'sidebar' | 'tab'
}

export function DashboardContent({ authState, viewMode }: DashboardContentProps) {
  const { configurations, isLoading, error } = useConfigurationData(authState)
  const { activeOverrides } = useStorageOverrides()
  const { evaluationResults } = useConfigurationEvaluation(authState, configurations, activeOverrides)
  const { selectedConfiguration, handleConfigurationSelect } = useConfigurationSelection()

  if (viewMode === 'popup') {
    return (
      <PopupLayout
        authState={authState}
        configurations={configurations}
        evaluationResults={evaluationResults}
        activeOverrides={activeOverrides}
        selectedConfiguration={selectedConfiguration}
        isLoading={isLoading}
        error={error}
        onConfigurationSelect={handleConfigurationSelect}
        viewMode={viewMode}
      />
    )
  }

  if (viewMode === 'sidebar') {
    return (
      <SidebarLayout
        authState={authState}
        configurations={configurations}
        evaluationResults={evaluationResults}
        activeOverrides={activeOverrides}
        selectedConfiguration={selectedConfiguration}
        isLoading={isLoading}
        error={error}
        onConfigurationSelect={handleConfigurationSelect}
        viewMode={viewMode}
      />
    )
  }

  return (
    <TabLayout
      authState={authState}
      configurations={configurations}
      evaluationResults={evaluationResults}
      activeOverrides={activeOverrides}
      selectedConfiguration={selectedConfiguration}
      isLoading={isLoading}
      error={error}
      onConfigurationSelect={handleConfigurationSelect}
      viewMode={viewMode}
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
        <div className="flex-shrink-0 border-t border-gray-200 bg-white">
          <ConfigurationDetailPanel
            authState={authState}
            configuration={selectedConfiguration}
            compact
            onClose={() => onConfigurationSelect(undefined)}
            allowOverrides
          />
        </div>
      )}
    </div>
  )
}

// Read-only layout for sidebar - no overrides allowed
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
  } = props

  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      {/* Read-only Mode Banner */}
      <div className="flex-shrink-0 border-b border-blue-200 bg-blue-50 px-4 py-2">
        <div className="flex items-center gap-2 text-sm text-blue-800">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">Read-only mode</span>
          <span className="text-blue-600">- Use popup mode to create overrides</span>
        </div>
      </div>

      {/* Configuration List - Takes remaining space when no selection */}
      <div className={`overflow-y-auto bg-gray-50 ${selectedConfiguration ? 'flex-1' : 'flex-1'}`}>
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

      {/* Read-only Rule Detail - Fixed height when visible */}
      {selectedConfiguration && (
        <div className="flex-shrink-0 border-t border-gray-200 bg-white" style={{ height: '40vh', minHeight: '300px' }}>
          <ConfigurationDetailPanel
            authState={authState}
            configuration={selectedConfiguration}
            compact={false}
            onClose={() => onConfigurationSelect(undefined)}
            allowOverrides={false}
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
  } = props

  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      {/* Read-only Mode Banner */}
      <div className="border-b border-purple-200 bg-purple-50 px-6 py-3">
        <div className="flex items-center gap-3 text-sm text-purple-800">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">Read-only mode</span>
          <span className="text-purple-600">- Use popup mode to create and manage overrides</span>
        </div>
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
