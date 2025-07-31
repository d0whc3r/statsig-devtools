// Global type definitions for the Statsig Developer Tools extension
// This file will be expanded in later tasks

export interface StatsigConfig {
  sdkKey: string
  userId: string
  environment?: string
}

export interface FeatureFlag {
  name: string
  value: boolean
  ruleId?: string
  groupName?: string
}

export interface DynamicConfig {
  name: string
  value: Record<string, unknown>
  ruleId?: string
  groupName?: string
}

export interface Experiment {
  name: string
  groupName: string
  ruleId?: string
}
