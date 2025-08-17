import { createSelectivelyPersistedStore, generateStoreId } from './store-helpers'

export interface ApiOverride {
  id: string
  type: 'gate' | 'experiment' | 'dynamicConfig'
  targetId: string
  targetName: string
  userId?: string
  stableId?: string
  value: boolean | string | number | object
  createdAt: number
  expiresAt?: number
}

export interface ApiOverrideState {
  overrides: ApiOverride[]
}

export interface ApiOverrideActions {
  addOverride: (override: Omit<ApiOverride, 'id' | 'createdAt'>) => void
  removeOverride: (id: string) => void
  removeAll: () => void
  updateOverride: (id: string, updates: Partial<Omit<ApiOverride, 'id' | 'createdAt'>>) => void
}

export type ApiOverrideStore = ApiOverrideState & ApiOverrideActions

const initialState: ApiOverrideState = {
  overrides: [],
}

export const useApiOverrideStore = createSelectivelyPersistedStore<ApiOverrideStore>(
  (set) => ({
    ...initialState,

    addOverride: (override) =>
      set((state) => {
        const newOverride: ApiOverride = {
          ...override,
          id: generateStoreId('api-override'),
          createdAt: Date.now(),
        }
        state.overrides.push(newOverride)
      }),

    removeOverride: (id) =>
      set((state) => {
        state.overrides = state.overrides.filter((override) => override.id !== id)
      }),

    removeAll: () =>
      set((state) => {
        state.overrides = []
      }),

    updateOverride: (id, updates) =>
      set((state) => {
        const override = state.overrides.find((o) => o.id === id)
        if (override) {
          Object.assign(override, updates)
        }
      }),
  }),
  'api-override-store',
  (state) => ({
    overrides: state.overrides,
  }),
  1,
)
