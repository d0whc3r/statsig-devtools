import { create, type StateCreator } from 'zustand'
import { persist, type PersistOptions, type StorageValue } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Storage prefix for all stores
const STORAGE_PREFIX = 'statsig-'

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
 * Creates a store with selective persistence that shares state between extension entrypoints
 * Uses browser.storage.local for cross-entrypoint communication (compatible with Chrome and Firefox)
 */
export function createExtensionSharedStore<T>(
  stateCreator: StateCreator<T, [['zustand/immer', never]], [], T>,
  name: string,
  partialize: (state: T) => Partial<T>,
  version = 1,
) {
  // Create a custom storage that uses browser.storage.local (WXT provides cross-browser compatibility)
  const extensionStorage = {
    getItem: async (name: string): Promise<StorageValue<unknown> | null> => {
      if (typeof browser !== 'undefined') {
        const result = await browser.storage.local.get([name])
        const value = result[name]
        if (value === undefined || value === null) return null
        // If it's already a StorageValue object, return it as is
        if (typeof value === 'object' && 'state' in value) {
          return value as StorageValue<unknown>
        }
        // If it's a string, try to parse it as JSON (legacy format)
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value)
            return parsed as StorageValue<unknown>
          } catch {
            // If parsing fails, wrap it in StorageValue format
            return { state: value }
          }
        }
        return { state: value }
      }
      // Fallback to localStorage
      const value = window.localStorage.getItem(name)
      if (value === null) return Promise.resolve(null)
      try {
        const parsed = JSON.parse(value)
        return Promise.resolve(parsed as StorageValue<unknown>)
      } catch {
        // If parsing fails, wrap it in StorageValue format
        return Promise.resolve({ state: value })
      }
    },
    setItem: (name: string, value: StorageValue<unknown>): Promise<void> => {
      if (typeof browser !== 'undefined') {
        return browser.storage.local.set({ [name]: value })
      }
      // Fallback to localStorage
      window.localStorage.setItem(name, JSON.stringify(value))
      return Promise.resolve()
    },
    removeItem: (name: string): Promise<void> => {
      if (typeof browser !== 'undefined') {
        return browser.storage.local.remove([name])
      }
      window.localStorage.removeItem(name)
      return Promise.resolve()
    },
  }

  return createStoreWithMiddleware(stateCreator, {
    name,
    persist: {
      partialize,
      version,
      storage: extensionStorage, // Type assertion for cross-browser storage compatibility
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

export function generateStoreId(prefix = 'item'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

interface ValueInitializerConfig<T, K extends keyof T = keyof T> {
  storeName: string
  valueKey: K
  updateCallback: (value: T[K]) => void
  getCurrentValue: () => T[K]
  defaultValue?: T[K]
}

interface StorageInitializerConfig<T, K extends keyof T = keyof T> {
  storageKey: string
  valueKey: K
  updateCallback: (value: T[K]) => void
  getCurrentValue: () => T[K]
  defaultValue?: T[K] | undefined
}

function initializeFromBrowserStorage<T, K extends keyof T = keyof T>({
  storageKey,
  valueKey,
  updateCallback,
  getCurrentValue,
  defaultValue,
}: StorageInitializerConfig<T, K>) {
  return browser.storage.local.get([storageKey]).then((result) => {
    const storedData = result[storageKey]
    if (storedData?.state && storedData.state[valueKey] !== undefined) {
      const storedValue = storedData.state[valueKey]
      if (storedValue !== getCurrentValue()) {
        updateCallback(storedValue)
      }
    } else if (defaultValue !== undefined && getCurrentValue() !== defaultValue) {
      updateCallback(defaultValue)
    }
  })
}

function initializeFromLocalStorage<T, K extends keyof T = keyof T>({
  storageKey,
  valueKey,
  updateCallback,
  getCurrentValue,
  defaultValue,
}: StorageInitializerConfig<T, K>) {
  const storedData = window.localStorage.getItem(storageKey)
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData)
      if (parsed?.state && parsed.state[valueKey] !== undefined) {
        const storedValue = parsed.state[valueKey]
        if (storedValue !== getCurrentValue()) {
          updateCallback(storedValue)
        }
      } else if (defaultValue !== undefined && getCurrentValue() !== defaultValue) {
        updateCallback(defaultValue)
      }
    } catch {
      // If parsing fails, use default value
      if (defaultValue !== undefined && getCurrentValue() !== defaultValue) {
        updateCallback(defaultValue)
      }
    }
  } else if (defaultValue !== undefined && getCurrentValue() !== defaultValue) {
    updateCallback(defaultValue)
  }
}

export function createValueInitializer<T, K extends keyof T = keyof T>({
  storeName,
  valueKey,
  updateCallback,
  getCurrentValue,
  defaultValue,
}: ValueInitializerConfig<T, K>) {
  return () => {
    const storageKey = `${STORAGE_PREFIX}${storeName}`

    if (typeof browser !== 'undefined') {
      initializeFromBrowserStorage({
        storageKey,
        valueKey,
        updateCallback,
        getCurrentValue,
        defaultValue,
      })
    } else {
      initializeFromLocalStorage({
        storageKey,
        valueKey,
        updateCallback,
        getCurrentValue,
        defaultValue,
      })
    }
  }
}

interface StorageListenerConfig<T> {
  storeName: string
  updateCallback: (newState: Partial<T>) => void
  getCurrentState: () => Partial<T>
}

export function createStorageListener<T>({ storeName, updateCallback, getCurrentState }: StorageListenerConfig<T>) {
  return () => {
    // Listen for changes in browser.storage to sync state across entrypoints
    if (typeof browser !== 'undefined') {
      browser.storage.onChanged.addListener((changes, namespace) => {
        const storageKey = `${STORAGE_PREFIX}${storeName}`
        if (namespace === 'local' && changes[storageKey]) {
          const change = changes[storageKey]
          const newState = change.newValue?.state
          if (newState && typeof newState === 'object') {
            // Only update if the state is different to avoid infinite loops
            const currentState = getCurrentState()
            const hasChanges = Object.keys(newState).some(
              (key) =>
                typeof currentState === 'object' &&
                key in currentState &&
                newState[key] !== (currentState as Record<string, unknown>)[key],
            )

            if (hasChanges) {
              updateCallback(newState as Partial<T>)
            }
          }
        }
      })
    }
  }
}
