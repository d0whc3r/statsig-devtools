/**
 * Types for content script functionality
 */

import type { StorageOverride } from '../../src/services/statsig-integration'

/**
 * Statsig SDK interface
 */
export interface StatsigSDK {
  checkGate: (gateName: string, user?: Record<string, unknown>) => boolean
  getConfig: (configName: string, user?: Record<string, unknown>) => { value: unknown }
  getExperiment: (experimentName: string, user?: Record<string, unknown>) => unknown
}

/**
 * Statsig override data stored in window
 */
export interface StatsigOverrideData {
  value: unknown
  type: string
  timestamp: number
}

/**
 * Extended window interface for Statsig functionality
 */
export interface StatsigWindow {
  statsigOverrides?: Record<string, StatsigOverrideData>
  statsigCookieResult?: Record<string, string>
  Statsig?: StatsigSDK
}

/**
 * Message types for content script communication
 */
export type ContentScriptMessage =
  | { type: 'SET_STORAGE_OVERRIDE'; override: StorageOverride }
  | { type: 'REMOVE_STORAGE_OVERRIDE'; override: StorageOverride }
  | { type: 'GET_STORAGE_VALUE'; key: string; storageType: string }
  | { type: 'CLEAR_ALL_OVERRIDES' }
  | { type: 'GET_COOKIES' }
  | { type: 'PING' }

/**
 * Response types for content script operations
 */
export interface ContentScriptResponse {
  success: boolean
  error?: string
  data?: unknown
}

/**
 * Storage operation result
 */
export interface StorageOperationResult {
  success: boolean
  error?: string
  value?: string
}

/**
 * Cookie data structure
 */
export interface CookieData {
  [key: string]: string
}

/**
 * Script execution function type
 */
export type ScriptFunction<T extends unknown[] = unknown[]> = (...args: T) => void

/**
 * Async script execution function type
 */
export type AsyncScriptFunction<T extends unknown[] = unknown[]> = (...args: T) => Promise<void>
