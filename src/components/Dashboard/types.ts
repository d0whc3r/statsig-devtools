import type { DynamicConfigListItem } from '@/src/api/dynamic-configs/dynamic-configs.schema'
import type { ExperimentListItem } from '@/src/api/experiments/experiments-list.schema'
import type { GateListItem } from '@/src/api/gates/gates-list.schema'

export type StatsigGate = GateListItem
export type StatsigExperiment = ExperimentListItem
export type StatsigDynamicConfig = DynamicConfigListItem

// Override types for the new inline override system
export interface OverrideData {
  id: string
  type: 'feature_gate' | 'experiment' | 'dynamic_config'
  targetId: string
  value: unknown
  source: 'browser' | 'api'
  timestamp: string
}

export type ConfigurationType = 'feature-gates' | 'experiments' | 'dynamic-configs'
export type ConfigurationStatus = 'active' | 'inactive' | 'draft'
