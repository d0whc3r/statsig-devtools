import { useEffect } from 'react'

import { type AuthStore, useAuthStore } from './auth-store'
import { type ConfigurationStore, useConfigurationStore } from './configuration-store'
import { type OverrideStore, useOverrideStore } from './override-store'
import { type UIStore, useUIStore } from './ui-store'

// Type definitions for store debug utilities
export interface StoreDebugUtils {
  getAllStoreStates: () => Record<string, AuthStore | ConfigurationStore | OverrideStore | UIStore>
  resetAllStores: () => void
  logStateChanges: (storeName: string, enabled?: boolean) => (() => void) | undefined
  measureStorePerformance: (storeName: string, actionName: string, action: () => void) => void
  validateStoreState: (
    storeName: string,
    validator: (state: AuthStore | ConfigurationStore | OverrideStore | UIStore) => boolean | string,
  ) => boolean
}

// Extend Window interface for store debug utilities
declare global {
  interface Window {
    statsigStores?: StoreDebugUtils
  }
}

/**
 * Development utilities for Zustand stores
 * Provides debugging helpers and store inspection tools
 */

// Store debugging utilities
export const storeDebugUtils: StoreDebugUtils = {
  // Get current state of all stores
  getAllStoreStates: () => ({
    auth: useAuthStore.getState(),
    configuration: useConfigurationStore.getState(),
    override: useOverrideStore.getState(),
    ui: useUIStore.getState(),
  }),

  // Reset all stores to initial state
  resetAllStores: () => {
    useAuthStore.getState().reset()
    useConfigurationStore.getState().reset()
    useOverrideStore.getState().reset()
    useUIStore.getState().reset()
  },

  // Log store state changes
  logStateChanges: (storeName: string, enabled = true) => {
    if (!enabled || process.env.NODE_ENV === 'production') return undefined

    const stores = {
      auth: useAuthStore,
      configuration: useConfigurationStore,
      override: useOverrideStore,
      ui: useUIStore,
    }

    const store = stores[storeName as keyof typeof stores]
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!store) {
      console.warn(`Store "${storeName}" not found`)
      return undefined
    }

    return store.subscribe(
      (
        state: AuthStore | ConfigurationStore | OverrideStore | UIStore,
        prevState: AuthStore | ConfigurationStore | OverrideStore | UIStore,
      ) => {
        console.group(`🏪 ${storeName} store updated`)
        console.log('Previous state:', prevState)
        console.log('New state:', state)
        console.groupEnd()
      },
    )
  },

  // Performance monitoring
  measureStorePerformance: (storeName: string, actionName: string, action: () => void) => {
    if (process.env.NODE_ENV === 'production') {
      action()
      return
    }

    const startTime = performance.now()
    action()
    const endTime = performance.now()

    console.log(`⚡ ${storeName}.${actionName} took ${(endTime - startTime).toFixed(2)}ms`)
  },

  // Store state validation
  validateStoreState: (
    storeName: string,
    validator: (state: AuthStore | ConfigurationStore | OverrideStore | UIStore) => boolean | string,
  ) => {
    const stores = {
      auth: useAuthStore,
      configuration: useConfigurationStore,
      override: useOverrideStore,
      ui: useUIStore,
    }

    const store = stores[storeName as keyof typeof stores]
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!store) {
      console.warn(`Store "${storeName}" not found`)
      return false
    }

    const state = store.getState()
    const result = validator(state)

    if (result === true) {
      console.log(`✅ ${storeName} store state is valid`)
      return true
    } else {
      console.error(`❌ ${storeName} store state validation failed:`, result)
      return false
    }
  },
}

/**
 * Hook for development-time store debugging
 * Only active in development mode
 */
export function useStoreDevtools(
  options: {
    logStateChanges?: boolean
    storesToLog?: string[]
    enablePerformanceMonitoring?: boolean
  } = {},
) {
  const {
    logStateChanges = false,
    storesToLog = ['auth', 'configuration', 'override', 'ui'],
    enablePerformanceMonitoring = false,
  } = options

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return

    // Expose debug utilities to window for console access
    if (typeof window !== 'undefined') {
      window.statsigStores = storeDebugUtils
    }

    // Set up state change logging
    if (logStateChanges) {
      const unSubscribers = storesToLog.map((storeName) => storeDebugUtils.logStateChanges(storeName, true))

      return () => {
        unSubscribers.forEach((unsubscribe) => unsubscribe?.())
      }
    }
  }, [logStateChanges, storesToLog, enablePerformanceMonitoring])

  // Return debug utilities for component use
  return process.env.NODE_ENV === 'development' ? storeDebugUtils : null
}

// Type-safe store action wrapper with performance monitoring
export function withPerformanceMonitoring<T extends (...args: unknown[]) => unknown>(
  storeName: string,
  actionName: string,
  action: T,
): T {
  return ((...args: Parameters<T>) => {
    if (process.env.NODE_ENV === 'production') {
      return action(...args)
    }

    return storeDebugUtils.measureStorePerformance(storeName, actionName, () => action(...args))
  }) as T
}

// Development-only store state snapshots
export const createStoreSnapshot = () => {
  if (process.env.NODE_ENV === 'production') return null

  return {
    timestamp: Date.now(),
    stores: storeDebugUtils.getAllStoreStates(),
  }
}

export const restoreStoreSnapshot = (snapshot: ReturnType<typeof createStoreSnapshot>) => {
  if (process.env.NODE_ENV === 'production' || !snapshot) return

  // Note: This is a simplified restore - in practice, you'd want more sophisticated restoration
  console.warn('Store snapshot restoration is not fully implemented')
  console.log('Snapshot to restore:', snapshot)
}
