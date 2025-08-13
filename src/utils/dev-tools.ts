/**
 * Development tools and utilities
 * Only active in development mode
 */

// Import the actual type from store-devtools
import type { StoreDebugUtils } from '../stores/store-devtools'

interface StatsigDevConsole {
  stores: () => Record<string, unknown> | null
  resetStores: () => void
  logStoreChanges: (storeName: string) => (() => void) | null
}

interface ReactDevToolsHook {
  settings?: {
    componentFilters?: Array<{ type: number; value: string }>
  }
}

interface ReduxDevToolsExtension {
  connect?: (options?: unknown) => unknown
}

// Extend Window interface for development tools
declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: ReactDevToolsHook
    __ZUSTAND_DEVTOOLS_ENABLED__?: boolean
    __REDUX_DEVTOOLS_EXTENSION__?: ReduxDevToolsExtension
    statsigStores?: StoreDebugUtils
    statsigDev?: StatsigDevConsole
  }
}

/**
 * Initialize development tools
 * This function is called automatically in development mode
 */
export function initDevTools() {
  if (process.env.NODE_ENV !== 'development' && !import.meta.env.DEV) return

  // Enable React DevTools detection
  if (typeof window !== 'undefined') {
    // Add React DevTools detection
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ ?? {}

    // Enable Zustand DevTools
    window.__ZUSTAND_DEVTOOLS_ENABLED__ = true

    // Expose development helpers to window
    window.statsigDev = devConsole

    // Log development mode activation
    console.log('🛠️  Statsig DevTools - Development Mode Active')
    console.log('📊 React DevTools: Available in browser DevTools')
    console.log('🏪 Redux DevTools: Available for Zustand stores')
    console.log('🔍 Debug stores: window.statsigStores (see store-devtools.ts)')
    console.log('🔧 Development commands available:')
    console.log('• window.statsigDev.stores() - Get all store states')
    console.log('• window.statsigDev.resetStores() - Reset all stores')
    console.log('• window.statsigDev.logStoreChanges("store-name") - Log store changes')
  }
}

/**
 * Development-only console helpers
 */
export const devConsole: StatsigDevConsole = {
  stores: () => {
    if (typeof window !== 'undefined' && window.statsigStores) {
      return window.statsigStores.getAllStoreStates()
    }
    console.warn('Store debug utilities not available')
    return null
  },

  resetStores: () => {
    if (typeof window !== 'undefined' && window.statsigStores) {
      window.statsigStores.resetAllStores()
      console.log('🔄 All stores reset to initial state')
    } else {
      console.warn('Store debug utilities not available')
    }
  },

  logStoreChanges: (storeName: string) => {
    if (typeof window !== 'undefined' && window.statsigStores) {
      return window.statsigStores.logStateChanges(storeName, true) ?? null
    }
    console.warn('Store debug utilities not available')
    return null
  },
}

// This is now handled in initDevTools() function

/**
 * React DevTools configuration
 */
export function configureReactDevTools() {
  if (process.env.NODE_ENV !== 'development') return

  // Configure React DevTools to show component names
  if (typeof window !== 'undefined') {
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__
    if (hook) {
      hook.settings = hook.settings ?? {}
      hook.settings.componentFilters = [
        // Hide internal React components
        { type: 1, value: 'React' },
        { type: 1, value: 'Suspense' },
        { type: 1, value: 'Fragment' },
      ]
    }
  }
}

/**
 * Redux DevTools configuration for Zustand
 */
export function configureReduxDevTools() {
  if (process.env.NODE_ENV !== 'development') return

  // Configure Redux DevTools for better Zustand integration
  if (typeof window !== 'undefined') {
    const devTools = window.__REDUX_DEVTOOLS_EXTENSION__
    if (devTools) {
      console.log('🔧 Redux DevTools detected - Zustand stores will be available')
    }
  }
}

/**
 * Initialize all development tools
 */
export function initAllDevTools() {
  initDevTools()
  configureReactDevTools()
  configureReduxDevTools()
}

/**
 * React hook to initialize dev tools
 * Use this in your main App component
 */
export function useDevTools() {
  if ((process.env.NODE_ENV === 'development' || import.meta.env.DEV) && typeof window !== 'undefined') {
    // Initialize dev tools
    initAllDevTools()

    // Return dev console for direct use
    return devConsole
  }
  return null
}

// Auto-initialize in development
if ((process.env.NODE_ENV === 'development' || import.meta.env.DEV) && typeof window !== 'undefined') {
  // Use setTimeout to ensure DOM is ready
  setTimeout(() => {
    initAllDevTools()
    console.log('🚀 Statsig DevTools initialized! Try: window.statsigDev.stores()')
  }, 100)
}
