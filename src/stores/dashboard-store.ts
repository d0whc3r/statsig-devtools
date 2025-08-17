import { createSelectivelyPersistedStore } from './store-helpers'

import type { DynamicConfigListItem } from '../api/dynamic-configs/dynamic-configs.schema'
import type { ExperimentListItem } from '../api/experiments/experiments-list.schema'
import type { GateListItem } from '../api/gates/gates-list.schema'
import type { DynamicConfigDto, ExternalExperimentDto, ExternalGateDto } from '../client/types.gen'

export interface TabInfo {
  id: number
  url: string
  domain: string
  title: string
}

export interface ConnectionStatus {
  isReady: boolean
  error?: string
  lastChecked: number
}

export interface DashboardState {
  // Tab information
  activeTab: TabInfo | null

  // Connection status
  connectionStatus: ConnectionStatus

  // Data counts
  gatesCount: number
  experimentsCount: number
  dynamicConfigsCount: number

  // Data lists (using types from API schemas)
  gates: GateListItem[]
  experiments: ExperimentListItem[]
  dynamicConfigs: DynamicConfigListItem[]

  // Loading states
  isLoadingGates: boolean
  isLoadingExperiments: boolean
  isLoadingDynamicConfigs: boolean

  // Selected items for details view (using full types for details)
  selectedGate: ExternalGateDto | null
  selectedExperiment: ExternalExperimentDto | null
  selectedDynamicConfig: DynamicConfigDto | null

  // View state
  currentView: 'overview' | 'gates' | 'experiments' | 'dynamicConfigs' | 'details'
}

export interface DashboardActions {
  // Tab management
  setActiveTab: (tab: TabInfo | null) => void

  // Connection management
  setConnectionStatus: (status: ConnectionStatus) => void

  // Data management (using types from API schemas)
  setGates: (gates: GateListItem[]) => void
  setExperiments: (experiments: ExperimentListItem[]) => void
  setDynamicConfigs: (configs: DynamicConfigListItem[]) => void

  // Loading states
  setIsLoadingGates: (loading: boolean) => void
  setIsLoadingExperiments: (loading: boolean) => void
  setIsLoadingDynamicConfigs: (loading: boolean) => void

  // Selection management (using full types for details)
  selectGate: (gate: ExternalGateDto | null) => void
  selectExperiment: (experiment: ExternalExperimentDto | null) => void
  selectDynamicConfig: (config: DynamicConfigDto | null) => void

  // View management
  setCurrentView: (view: DashboardState['currentView']) => void

  // Combined actions
  reset: () => void
}

export type DashboardStore = DashboardState & DashboardActions

const initialState: DashboardState = {
  activeTab: null,
  connectionStatus: {
    isReady: false,
    lastChecked: 0,
  },
  gatesCount: 0,
  experimentsCount: 0,
  dynamicConfigsCount: 0,
  gates: [],
  experiments: [],
  dynamicConfigs: [],
  isLoadingGates: false,
  isLoadingExperiments: false,
  isLoadingDynamicConfigs: false,
  selectedGate: null,
  selectedExperiment: null,
  selectedDynamicConfig: null,
  currentView: 'overview',
}

export const useDashboardStore = createSelectivelyPersistedStore<DashboardStore>(
  (set) => ({
    ...initialState,

    setActiveTab: (tab) =>
      set((state) => {
        state.activeTab = tab
      }),

    setConnectionStatus: (status) =>
      set((state) => {
        state.connectionStatus = status
      }),

    setGates: (gates) =>
      set((state) => {
        state.gates = gates
        state.gatesCount = gates.length
      }),

    setExperiments: (experiments) =>
      set((state) => {
        state.experiments = experiments
        state.experimentsCount = experiments.length
      }),

    setDynamicConfigs: (configs) =>
      set((state) => {
        state.dynamicConfigs = configs
        state.dynamicConfigsCount = configs.length
      }),

    setIsLoadingGates: (loading) =>
      set((state) => {
        state.isLoadingGates = loading
      }),

    setIsLoadingExperiments: (loading) =>
      set((state) => {
        state.isLoadingExperiments = loading
      }),

    setIsLoadingDynamicConfigs: (loading) =>
      set((state) => {
        state.isLoadingDynamicConfigs = loading
      }),

    selectGate: (gate) =>
      set((state) => {
        state.selectedGate = gate
        state.selectedExperiment = null
        state.selectedDynamicConfig = null
        state.currentView = gate ? 'details' : 'overview'
      }),

    selectExperiment: (experiment) =>
      set((state) => {
        state.selectedExperiment = experiment
        state.selectedGate = null
        state.selectedDynamicConfig = null
        state.currentView = experiment ? 'details' : 'overview'
      }),

    selectDynamicConfig: (config) =>
      set((state) => {
        state.selectedDynamicConfig = config
        state.selectedGate = null
        state.selectedExperiment = null
        state.currentView = config ? 'details' : 'overview'
      }),

    setCurrentView: (view) =>
      set((state) => {
        state.currentView = view
      }),

    reset: () =>
      set((state) => {
        Object.assign(state, initialState)
      }),
  }),
  'dashboard-store',
  (state) => ({
    activeTab: state.activeTab,
    connectionStatus: state.connectionStatus,
    gatesCount: state.gatesCount,
    experimentsCount: state.experimentsCount,
    dynamicConfigsCount: state.dynamicConfigsCount,
    gates: state.gates,
    experiments: state.experiments,
    dynamicConfigs: state.dynamicConfigs,
    isLoadingGates: state.isLoadingGates,
    isLoadingExperiments: state.isLoadingExperiments,
    isLoadingDynamicConfigs: state.isLoadingDynamicConfigs,
    selectedGate: state.selectedGate,
    selectedExperiment: state.selectedExperiment,
    selectedDynamicConfig: state.selectedDynamicConfig,
    currentView: state.currentView,
  }),
  1,
)
