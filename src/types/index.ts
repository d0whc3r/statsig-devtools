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

/**
 * Base interface for all Statsig configuration items
 */
export interface StatsigConfigurationItem {
  id?: string
  name: string
  type: 'feature_gate' | 'dynamic_config' | 'experiment'
  enabled: boolean
  rules?: ConfigurationRule[]
  defaultValue?: unknown
  salt?: string
  idType?: string
  entity?: string
  isActive?: boolean
  hasSharedParams?: boolean
  targetApps?: string[]
  lastModifierName?: string
  lastModifierID?: string
  createdTime?: number
  lastModifiedTime?: number
}

/**
 * Configuration rule interface
 */
export interface ConfigurationRule {
  name?: string
  passPercentage?: number
  conditions?: RuleCondition[]
  returnValue?: unknown
  id?: string
  salt?: string
  idType?: string
  groupName?: string
  environment?: string[] | null
}

/**
 * Rule condition interface based on Statsig SDK
 */
export interface RuleCondition {
  type: string
  targetValue: unknown
  operator?: string
  field?: string
  additionalValues?: Record<string, unknown>
}

/**
 * Type for arrays of Statsig configurations
 */
export type StatsigConfigurations = StatsigConfigurationItem[]

/**
 * Authentication state interface
 */
export interface AuthState {
  isAuthenticated: boolean
  consoleApiKey?: string
  clientSdkKey?: string
  isLoading: boolean
  error?: string
  projectName?: string
}

/**
 * API validation response interface
 */
export interface ApiValidationResponse {
  isValid: boolean
  error?: string
  projectName?: string
}
