import { create, type StateCreator } from 'zustand'
import { persist, type PersistOptions } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface StoreConfig<T> {
  name: string
  persist?: {
    version?: number
    migrate?: (persistedState: unknown, version: number) => unknown
    partialize?: (state: T) => Partial<T>
    storage?: PersistOptions<T, unknown>['storage']
  }
  devtools?: boolean
}

/**
 * Creates a store with middleware stack (immer, persist, devtools)
 */
export function createStoreWithMiddleware<T>(
  stateCreator: StateCreator<T, [['zustand/immer', never]], [], T>,
  config: StoreConfig<T>,
) {
  const { name, persist: persistConfig, devtools: enableDevtools = process.env.NODE_ENV === 'development' } = config

  // Start with immer middleware
  let store = immer(stateCreator)

  // Apply persist middleware if configured
  if (persistConfig) {
    const persistOptions: PersistOptions<T, unknown> = {
      name: `statsig-${name}`,
      version: persistConfig.version ?? 1,
      migrate: persistConfig.migrate ?? ((persistedState: unknown) => persistedState),
      ...(persistConfig.partialize && { partialize: persistConfig.partialize }),
      ...(persistConfig.storage && { storage: persistConfig.storage }),
    }
    // @ts-expect-error - Zustand middleware types are complex, but this works at runtime
    store = persist(store, persistOptions)
  }

  // Apply devtools middleware if enabled
  if (enableDevtools) {
    // @ts-expect-error - Zustand middleware types are complex, but this works at runtime
    store = devtools(store, { name })
  }

  return create<T>()(store)
}

/**
 * Creates a simple store without persistence (useful for UI state that shouldn't persist)
 */
export function createEphemeralStore<T>(
  stateCreator: StateCreator<T, [['zustand/immer', never]], [], T>,
  name: string,
) {
  return createStoreWithMiddleware(stateCreator, {
    name,
    devtools: process.env.NODE_ENV === 'development',
    // No persist configuration = ephemeral store
  })
}

/**
 * Creates a store with full persistence (all state is persisted)
 */
export function createPersistedStore<T>(
  stateCreator: StateCreator<T, [['zustand/immer', never]], [], T>,
  name: string,
  version = 1,
) {
  return createStoreWithMiddleware(stateCreator, {
    name,
    persist: {
      version,
      migrate: (persistedState: unknown, currentVersion: number) => {
        if (currentVersion === 0) {
          // Handle migration from version 0 to 1
          return persistedState
        }
        return persistedState
      },
    },
    devtools: process.env.NODE_ENV === 'development',
  })
}

/**
 * Creates a store with selective persistence
 */
export function createSelectivelyPersistedStore<T>(
  stateCreator: StateCreator<T, [['zustand/immer', never]], [], T>,
  name: string,
  partialize: (state: T) => Partial<T>,
  version = 1,
) {
  return createStoreWithMiddleware(stateCreator, {
    name,
    persist: {
      partialize,
      version,
      migrate: (persistedState: unknown, currentVersion: number) => {
        if (currentVersion === 0) {
          // Handle migration from version 0 to 1
          return persistedState
        }
        return persistedState
      },
    },
    devtools: process.env.NODE_ENV === 'development',
  })
}

/**
 * Utility to generate unique IDs for store items
 */
export function generateStoreId(prefix = 'item'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}
