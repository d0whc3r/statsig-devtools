import { createSelectivelyPersistedStore } from './store-helpers'

export interface AuthState {
  // Authentication state
  isAuthenticated: boolean
  consoleApiKey: string | null

  // User information
  user:
    | {
        userId: string
        stableId?: never
      }
    | {
        userId?: never
        stableId: string
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
  reset: () => void
}

export type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  isAuthenticated: false,
  consoleApiKey: null,
  user: null,
  isValidatingKey: false,
  isLoggingOut: false,
}

export const useAuthStore = createSelectivelyPersistedStore<AuthStore>(
  (set, get) => ({
    ...initialState,

    setUser: (user: AuthState['user']) =>
      set((state) => {
        state.user = user
      }),

    getUserId: () => {
      const { user } = get()
      return user?.userId ?? user?.stableId ?? null
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

    logout: () =>
      set((state) => {
        state.isAuthenticated = false
        state.consoleApiKey = null
        state.user = null
        state.isValidatingKey = false
        state.isLoggingOut = false
      }),

    reset: () =>
      set((state) => {
        Object.assign(state, initialState)
      }),
  }),
  'auth-store',
  (state) => ({
    isAuthenticated: state.isAuthenticated,
    consoleApiKey: state.consoleApiKey,
    user: state.user,
    isValidatingKey: state.isValidatingKey,
    isLoggingOut: state.isLoggingOut,
  }),
  1,
)
