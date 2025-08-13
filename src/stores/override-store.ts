import { createSelectivelyPersistedStore, generateStoreId } from './store-helpers'

export interface StorageOverride {
  id: string
  type: 'localStorage' | 'sessionStorage' | 'cookie'
  key: string
  value: string
  domain?: string | undefined
  path?: string | undefined
  expires?: number | undefined
  isActive: boolean
  createdAt: number
  updatedAt: number
  description?: string | undefined
}

export interface OverrideState {
  // Override data
  overrides: StorageOverride[]
  activeOverrides: StorageOverride[]

  // UI state
  isApplying: boolean
  isRemoving: boolean
  selectedOverrides: string[]

  // Filter and search
  searchQuery: string
  selectedTypes: ('localStorage' | 'sessionStorage' | 'cookie')[]
  showActiveOnly: boolean

  // Error states
  error: string | null
  lastError: {
    overrideId: string
    message: string
    timestamp: number
  } | null
}

export interface OverrideActions {
  // Override management
  addOverride: (override: Omit<StorageOverride, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateOverride: (id: string, updates: Partial<StorageOverride>) => void
  removeOverride: (id: string) => void
  removeOverrides: (ids: string[]) => void
  toggleOverride: (id: string) => void
  duplicateOverride: (id: string) => void

  // Bulk operations
  activateAll: () => void
  deactivateAll: () => void
  removeAll: () => void
  removeInactive: () => void

  // Selection management
  selectOverride: (id: string) => void
  deselectOverride: (id: string) => void
  selectAll: () => void
  deselectAll: () => void
  toggleSelection: (id: string) => void

  // Filter and search
  setSearchQuery: (query: string) => void
  setSelectedTypes: (types: ('localStorage' | 'sessionStorage' | 'cookie')[]) => void
  setShowActiveOnly: (active: boolean) => void
  clearFilters: () => void

  // Loading states
  setApplying: (applying: boolean) => void
  setRemoving: (removing: boolean) => void

  // Error handling
  setError: (error: string | null) => void
  setLastError: (overrideId: string, message: string) => void
  clearError: () => void
  clearLastError: () => void

  // Application actions
  applyOverride: (id: string) => Promise<void>
  applyOverrides: (ids: string[]) => Promise<void>
  applyAllActive: () => Promise<void>
  removeOverrideFromPage: (id: string) => Promise<void>

  // Utility actions
  getOverrideById: (id: string) => StorageOverride | undefined
  getActiveOverrides: () => StorageOverride[]
  getOverridesByType: (type: StorageOverride['type']) => StorageOverride[]

  // Reset
  reset: () => void
}

export type OverrideStore = OverrideState & OverrideActions

const initialState: OverrideState = {
  overrides: [],
  activeOverrides: [],
  isApplying: false,
  isRemoving: false,
  selectedOverrides: [],
  searchQuery: '',
  selectedTypes: [],
  showActiveOnly: false,
  error: null,
  lastError: null,
}

export const useOverrideStore = createSelectivelyPersistedStore<OverrideStore>(
  (set, get) => ({
    ...initialState,

    // Override management
    addOverride: (override) =>
      set((state) => {
        const newOverride: StorageOverride = {
          ...override,
          id: generateStoreId('override'),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        state.overrides.push(newOverride)
        if (newOverride.isActive) {
          state.activeOverrides.push(newOverride)
        }
      }),

    updateOverride: (id, updates) =>
      set((state) => {
        const index = state.overrides.findIndex((override) => override.id === id)
        if (index !== -1) {
          const oldOverride = state.overrides[index]
          if (oldOverride) {
            const updatedOverride: StorageOverride = {
              id: oldOverride.id,
              type: updates.type ?? oldOverride.type,
              key: updates.key ?? oldOverride.key,
              value: updates.value ?? oldOverride.value,
              domain: updates.domain ?? oldOverride.domain,
              path: updates.path ?? oldOverride.path,
              expires: updates.expires ?? oldOverride.expires,
              isActive: updates.isActive ?? oldOverride.isActive,
              createdAt: oldOverride.createdAt,
              updatedAt: Date.now(),
              description: updates.description ?? oldOverride.description,
            }
            state.overrides[index] = updatedOverride

            // Update active overrides
            const activeIndex = state.activeOverrides.findIndex((override) => override.id === id)
            if (updatedOverride.isActive && activeIndex === -1) {
              state.activeOverrides.push(updatedOverride)
            } else if (!updatedOverride.isActive && activeIndex !== -1) {
              state.activeOverrides.splice(activeIndex, 1)
            } else if (activeIndex !== -1) {
              state.activeOverrides[activeIndex] = updatedOverride
            }
          }
        }
      }),

    removeOverride: (id) =>
      set((state) => {
        state.overrides = state.overrides.filter((override) => override.id !== id)
        state.activeOverrides = state.activeOverrides.filter((override) => override.id !== id)
        state.selectedOverrides = state.selectedOverrides.filter((selectedId) => selectedId !== id)
      }),

    removeOverrides: (ids) =>
      set((state) => {
        state.overrides = state.overrides.filter((override) => !ids.includes(override.id))
        state.activeOverrides = state.activeOverrides.filter((override) => !ids.includes(override.id))
        state.selectedOverrides = state.selectedOverrides.filter((selectedId) => !ids.includes(selectedId))
      }),

    toggleOverride: (id) =>
      set((state) => {
        const override = state.overrides.find((o) => o.id === id)
        if (override) {
          override.isActive = !override.isActive
          override.updatedAt = Date.now()

          if (override.isActive) {
            const existsInActive = state.activeOverrides.some((o) => o.id === id)
            if (!existsInActive) {
              state.activeOverrides.push(override)
            }
          } else {
            state.activeOverrides = state.activeOverrides.filter((o) => o.id !== id)
          }
        }
      }),

    duplicateOverride: (id) =>
      set((state) => {
        const original = state.overrides.find((override) => override.id === id)
        if (original) {
          const duplicate: StorageOverride = {
            ...original,
            id: generateStoreId('override'),
            key: `${original.key}_copy`,
            isActive: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            description: original.description ? `${original.description} (Copy)` : 'Copy',
          }
          state.overrides.push(duplicate)
        }
      }),

    // Bulk operations
    activateAll: () =>
      set((state) => {
        state.overrides.forEach((override) => {
          override.isActive = true
          override.updatedAt = Date.now()
        })
        state.activeOverrides = [...state.overrides]
      }),

    deactivateAll: () =>
      set((state) => {
        state.overrides.forEach((override) => {
          override.isActive = false
          override.updatedAt = Date.now()
        })
        state.activeOverrides = []
      }),

    removeAll: () =>
      set((state) => {
        state.overrides = []
        state.activeOverrides = []
        state.selectedOverrides = []
      }),

    removeInactive: () =>
      set((state) => {
        const activeIds = state.activeOverrides.map((o) => o.id)
        state.overrides = state.overrides.filter((override) => override.isActive)
        state.selectedOverrides = state.selectedOverrides.filter((id) => activeIds.includes(id))
      }),

    // Selection management
    selectOverride: (id) =>
      set((state) => {
        if (!state.selectedOverrides.includes(id)) {
          state.selectedOverrides.push(id)
        }
      }),

    deselectOverride: (id) =>
      set((state) => {
        state.selectedOverrides = state.selectedOverrides.filter((selectedId) => selectedId !== id)
      }),

    selectAll: () =>
      set((state) => {
        state.selectedOverrides = state.overrides.map((override) => override.id)
      }),

    deselectAll: () =>
      set((state) => {
        state.selectedOverrides = []
      }),

    toggleSelection: (id) =>
      set((state) => {
        if (state.selectedOverrides.includes(id)) {
          state.selectedOverrides = state.selectedOverrides.filter((selectedId) => selectedId !== id)
        } else {
          state.selectedOverrides.push(id)
        }
      }),

    // Filter and search
    setSearchQuery: (query) =>
      set((state) => {
        state.searchQuery = query
      }),

    setSelectedTypes: (types) =>
      set((state) => {
        state.selectedTypes = types
      }),

    setShowActiveOnly: (active) =>
      set((state) => {
        state.showActiveOnly = active
      }),

    clearFilters: () =>
      set((state) => {
        state.searchQuery = ''
        state.selectedTypes = []
        state.showActiveOnly = false
      }),

    // Loading states
    setApplying: (applying) =>
      set((state) => {
        state.isApplying = applying
      }),

    setRemoving: (removing) =>
      set((state) => {
        state.isRemoving = removing
      }),

    // Error handling
    setError: (error) =>
      set((state) => {
        state.error = error
      }),

    setLastError: (overrideId, message) =>
      set((state) => {
        state.lastError = {
          overrideId,
          message,
          timestamp: Date.now(),
        }
      }),

    clearError: () =>
      set((state) => {
        state.error = null
      }),

    clearLastError: () =>
      set((state) => {
        state.lastError = null
      }),

    // Application actions
    applyOverride: async (id) => {
      const state = get()
      const override = state.overrides.find((o) => o.id === id)
      if (!override) return

      set((state) => {
        state.isApplying = true
        state.error = null
      })

      try {
        // TODO: Implement actual override application
        // await storageService.applyOverride(override)

        // Mock application
        await new Promise((resolve) => setTimeout(resolve, 500))

        set((state) => {
          state.isApplying = false
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to apply override'
        set((state) => {
          state.isApplying = false
          state.error = message
        })
        get().setLastError(id, message)
      }
    },

    applyOverrides: async (_ids) => {
      set((state) => {
        state.isApplying = true
        state.error = null
      })

      try {
        // TODO: Implement bulk override application
        // await Promise.all(ids.map(id => storageService.applyOverride(overrides.find(o => o.id === id))))

        // Mock bulk application
        await new Promise((resolve) => setTimeout(resolve, 1000))

        set((state) => {
          state.isApplying = false
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to apply overrides'
        set((state) => {
          state.isApplying = false
          state.error = message
        })
      }
    },

    applyAllActive: async () => {
      const state = get()
      const activeIds = state.activeOverrides.map((o) => o.id)
      await state.applyOverrides(activeIds)
    },

    removeOverrideFromPage: async (id) => {
      set((state) => {
        state.isRemoving = true
        state.error = null
      })

      try {
        // TODO: Implement actual override removal from page
        // await storageService.removeOverride(id)

        // Mock removal
        await new Promise((resolve) => setTimeout(resolve, 300))

        set((state) => {
          state.isRemoving = false
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to remove override'
        set((state) => {
          state.isRemoving = false
          state.error = message
        })
        get().setLastError(id, message)
      }
    },

    // Utility actions
    getOverrideById: (id) => {
      const state = get()
      return state.overrides.find((override) => override.id === id)
    },

    getActiveOverrides: () => {
      const state = get()
      return state.activeOverrides
    },

    getOverridesByType: (type) => {
      const state = get()
      return state.overrides.filter((override) => override.type === type)
    },

    reset: () =>
      set((state) => {
        Object.assign(state, initialState)
      }),
  }),
  'override-store',
  (state) => ({
    overrides: state.overrides,
    activeOverrides: state.activeOverrides,
    searchQuery: state.searchQuery,
    selectedTypes: state.selectedTypes,
    showActiveOnly: state.showActiveOnly,
  }),
  1,
)
