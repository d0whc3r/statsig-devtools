import { createExtensionSharedStore, createStorageListener, createValueInitializer } from './store-helpers'

export interface AuthState {
  // Authentication state
  isAuthenticated: boolean
  consoleApiKey: string | null

  // User information
  user:
    | {
        userID: string
        stableID?: never
      }
    | {
        userID?: never
        stableID: string
      }
    | null

  // Loading states
  isValidatingKey: boolean
  isLoggingOut: boolean
}

export interface AuthActions {
  // User actions
  setUser: (user: AuthState['user']) => void
  getUserId: () => string | null

  // Loading actions
  setIsValidatingKey: (validating: boolean) => void
  setIsLoggingOut: (loggingOut: boolean) => void

  // Combined actions
  login: (consoleKey: string) => void
  logout: () => void
  coordinatedLogout: () => void // New coordinated logout method
  reset: () => void
  initializeAuth: () => void // Initialize cross-entrypoint sync
}

export type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  isAuthenticated: false,
  consoleApiKey: null,
  user: null,
  isValidatingKey: false,
  isLoggingOut: false,
}

const storeName = 'auth-store'

export const useAuthStore = createExtensionSharedStore<AuthStore>(
  (set, get) => ({
    ...initialState,

    setUser: (user: AuthState['user']) =>
      set((state) => {
        state.user = user
      }),

    getUserId: () => {
      const { user } = get()
      return user?.userID ?? user?.stableID ?? null
    },

    // Loading actions
    setIsValidatingKey: (validating: boolean) =>
      set((state) => {
        state.isValidatingKey = validating
      }),

    setIsLoggingOut: (loggingOut: boolean) =>
      set((state) => {
        state.isLoggingOut = loggingOut
      }),

    // Combined actions
    login: (consoleKey: string) =>
      set((state) => {
        state.consoleApiKey = consoleKey
        state.isAuthenticated = true
      }),

    // Local logout (internal use only)
    logout: () =>
      set((state) => {
        state.isAuthenticated = false
        state.consoleApiKey = null
        state.user = null
        state.isValidatingKey = false
        state.isLoggingOut = false
      }),

    // Coordinated logout that syncs across all extension instances
    coordinatedLogout: () => {
      set((state) => {
        state.isLoggingOut = true
      })

      // Perform logout
      set((state) => {
        state.isAuthenticated = false
        state.consoleApiKey = null
        state.user = null
        state.isValidatingKey = false
        state.isLoggingOut = false
      })
    },

    reset: () =>
      set((state) => {
        Object.assign(state, initialState)
      }),

    initializeAuth: () => {
      // Initialize auth state from storage
      const initializeAuth = createValueInitializer<AuthState>({
        storeName,
        valueKey: 'isAuthenticated',
        updateCallback: (isAuthenticated) => {
          const currentState = get()
          if (!isAuthenticated && currentState.isAuthenticated) {
            // If stored state shows logged out but current state is logged in,
            // perform local logout to sync
            get().logout()
          }
        },
        getCurrentValue: () => get().isAuthenticated,
        defaultValue: false,
      })
      initializeAuth()

      // Initialize storage listener for cross-entrypoint sync
      const initializeListener = createStorageListener<AuthState>({
        storeName,
        updateCallback: (newState) => {
          const currentState = get()

          // If the stored state shows logged out but we're currently logged in,
          // perform local logout to sync all instances
          if (!newState.isAuthenticated && currentState.isAuthenticated) {
            get().logout()
          }

          // Sync other state changes
          if (newState.consoleApiKey && newState.consoleApiKey !== currentState.consoleApiKey) {
            set((state) => {
              state.consoleApiKey = newState.consoleApiKey ?? null
            })
          }

          if (newState.user && newState.user !== currentState.user) {
            set((state) => {
              state.user = newState.user ?? null
            })
          }

          if (newState.isAuthenticated && newState.isAuthenticated !== currentState.isAuthenticated) {
            set((state) => {
              state.isAuthenticated = newState.isAuthenticated ?? false
            })
          }
        },
        getCurrentState: () => ({
          isAuthenticated: get().isAuthenticated,
          consoleApiKey: get().consoleApiKey,
          user: get().user,
          isValidatingKey: get().isValidatingKey,
          isLoggingOut: get().isLoggingOut,
        }),
      })
      initializeListener()
    },
  }),
  storeName,
  (state) => ({
    isAuthenticated: state.isAuthenticated,
    consoleApiKey: state.consoleApiKey,
    user: state.user,
    isValidatingKey: state.isValidatingKey,
    isLoggingOut: state.isLoggingOut,
  }),
  1,
)
