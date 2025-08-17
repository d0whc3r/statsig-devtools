import { createExtensionSharedStore, createStorageListener, createValueInitializer } from './store-helpers'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
}

interface ThemeActions {
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  isDark: () => boolean
  initializeTheme: () => void
}

export type ThemeStore = ThemeState & ThemeActions

const initialState: ThemeState = {
  theme: 'light',
}

// Helper function to apply theme to DOM
function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return

  const root = window.document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

export const useThemeStore = createExtensionSharedStore<ThemeStore>(
  (set, get) => ({
    ...initialState,

    toggleTheme: () =>
      set((state) => {
        state.theme = state.theme === 'light' ? 'dark' : 'light'
        applyTheme(state.theme)
      }),

    setTheme: (theme: Theme) =>
      set((state) => {
        state.theme = theme
        applyTheme(theme)
      }),

    isDark: () => get().theme === 'dark',

    initializeTheme: () => {
      // Initialize theme from storage
      const initializeTheme = createValueInitializer<ThemeState>({
        storeName: 'theme',
        valueKey: 'theme',
        updateCallback: (theme) => {
          get().setTheme(theme)
        },
        getCurrentValue: () => get().theme,
        defaultValue: 'light',
      })
      initializeTheme()

      // Initialize storage listener for cross-entrypoint sync
      const initializeListener = createStorageListener<ThemeState>({
        storeName: 'theme',
        updateCallback: (newState) => {
          if (newState.theme && newState.theme !== get().theme) {
            get().setTheme(newState.theme)
          }
        },
        getCurrentState: () => ({ theme: get().theme }),
      })
      initializeListener()
    },
  }),
  'theme',
  (state) => ({
    theme: state.theme,
  }),
)
