import { createSelectivelyPersistedStore } from './store-helpers'

export interface AuthState {
  // Authentication state
  isAuthenticated: boolean
  consoleApiKey: string | null

  // User information
  user: {
    id: string | null
    email: string | null
    name: string | null
  } | null

  // Loading states
  isValidatingKey: boolean
  isLoggingOut: boolean

  // Error states
  authError: string | null
}

export interface AuthActions {
  // Authentication actions
  setConsoleApiKey: (key: string) => void
  setAuthenticated: (authenticated: boolean) => void
  setUser: (user: AuthState['user']) => void

  // Loading actions
  setValidatingKey: (validating: boolean) => void
  setLoggingOut: (loggingOut: boolean) => void

  // Error actions
  setAuthError: (error: string | null) => void
  clearAuthError: () => void

  // Combined actions
  login: (consoleKey: string, user: AuthState['user']) => void
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
  authError: null,
}

export const useAuthStore = createSelectivelyPersistedStore<AuthStore>(
  (set) => ({
    ...initialState,

    // Authentication actions
    setConsoleApiKey: (key: string) =>
      set((state) => {
        state.consoleApiKey = key
        state.authError = null
      }),

    setAuthenticated: (authenticated: boolean) =>
      set((state) => {
        state.isAuthenticated = authenticated
      }),

    setUser: (user: AuthState['user']) =>
      set((state) => {
        state.user = user
      }),

    // Loading actions
    setValidatingKey: (validating: boolean) =>
      set((state) => {
        state.isValidatingKey = validating
      }),

    setLoggingOut: (loggingOut: boolean) =>
      set((state) => {
        state.isLoggingOut = loggingOut
      }),

    // Error actions
    setAuthError: (error: string | null) =>
      set((state) => {
        state.authError = error
      }),

    clearAuthError: () =>
      set((state) => {
        state.authError = null
      }),

    // Combined actions
    login: (consoleKey: string, user: AuthState['user']) =>
      set((state) => {
        state.consoleApiKey = consoleKey
        state.user = user
        state.isAuthenticated = true
        state.authError = null
      }),

    logout: () =>
      set((state) => {
        state.isAuthenticated = false
        state.consoleApiKey = null
        state.user = null
        state.authError = null
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
    consoleApiKey: state.consoleApiKey,
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  }),
  1,
)
