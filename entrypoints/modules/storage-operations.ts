/**
 * Storage operations for content script
 */

import { logger } from '@/src/utils/logger'

import { executeScriptDirect, executeScriptWithResult } from './script-execution'
import { injectStatsigOverride } from './statsig-injection'

import type { CookieData, StatsigWindow, StorageOperationResult } from '../types/content-types'
import type { StorageOverride } from '@/src/services/statsig-integration'

/**
 * Handle setting storage override
 */
export async function handleSetStorageOverride(override: StorageOverride): Promise<StorageOperationResult> {
  try {
    logger.log('🔄 Setting storage override:', JSON.stringify(override))

    switch (override.type) {
      case 'localStorage': {
        await executeScriptDirect(
          (key: string, value: string) => {
            // eslint-disable-next-line no-console
            console.log('🚀 STATSIG: Setting localStorage', { key, value })
            window.localStorage.setItem(key, value)
            const verified = window.localStorage.getItem(key)
            // eslint-disable-next-line no-console
            console.log('✅ STATSIG: localStorage set successfully', { key, value, verified })
          },
          [override.key, override.value],
        )
        break
      }
      case 'sessionStorage': {
        await executeScriptDirect(
          (key: string, value: string) => {
            // eslint-disable-next-line no-console
            console.log('🚀 STATSIG: Setting sessionStorage', { key, value })
            window.sessionStorage.setItem(key, value)
            const verified = window.sessionStorage.getItem(key)
            // eslint-disable-next-line no-console
            console.log('✅ STATSIG: sessionStorage set successfully', { key, value, verified })
          },
          [override.key, override.value],
        )
        break
      }
      case 'cookie': {
        await executeScriptDirect(
          (key: string, value: string, path: string, domain?: string) => {
            // eslint-disable-next-line no-console
            console.log('🚀 STATSIG: Setting cookie', { key, value, path, domain })
            const cookieString = `${key}=${value}; path=${path}${domain ? `; domain=${domain}` : ''}; SameSite=Lax`
            window.document.cookie = cookieString
            // eslint-disable-next-line no-console
            console.log('✅ STATSIG: Cookie set successfully', { cookieString })
          },
          [override.key, override.value, override.path || '/', override.domain || ''],
        )
        break
      }
      default:
        return { success: false, error: `Unsupported storage type: ${override.type}` }
    }

    // If this is a Statsig-specific override, also inject Statsig interception
    if (override.featureName) {
      await injectStatsigOverride(override)
    }

    logger.log('✅ Storage override applied successfully')
    return { success: true }
  } catch (error) {
    logger.error('Failed to set storage override:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Handle removing storage override using direct script execution
 */
export async function handleRemoveStorageOverride(override: StorageOverride): Promise<StorageOperationResult> {
  try {
    switch (override.type) {
      case 'localStorage': {
        await executeScriptDirect(
          (key: string) => {
            // eslint-disable-next-line no-console
            console.log('🗑️ STATSIG: Removing localStorage', { key })
            window.localStorage.removeItem(key)
            // eslint-disable-next-line no-console
            console.log('✅ STATSIG: localStorage removed successfully', { key })
          },
          [override.key],
        )
        break
      }
      case 'sessionStorage': {
        await executeScriptDirect(
          (key: string) => {
            // eslint-disable-next-line no-console
            console.log('🗑️ STATSIG: Removing sessionStorage', { key })
            window.sessionStorage.removeItem(key)
            // eslint-disable-next-line no-console
            console.log('✅ STATSIG: sessionStorage removed successfully', { key })
          },
          [override.key],
        )
        break
      }
      case 'cookie': {
        await executeScriptDirect(
          (key: string, path: string, domain?: string) => {
            // eslint-disable-next-line no-console
            console.log('🗑️ STATSIG: Removing cookie', { key, path, domain })
            const cookieString = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain ? `; domain=${domain}` : ''}`
            window.document.cookie = cookieString
            // eslint-disable-next-line no-console
            console.log('✅ STATSIG: Cookie removed successfully', { cookieString })
          },
          [override.key, override.path || '/', override.domain || ''],
        )
        break
      }
      default:
        return { success: false, error: `Unsupported storage type: ${override.type}` }
    }

    // Remove Statsig override if applicable
    if (override.featureName) {
      await removeStatsigOverride(override.featureName)
    }

    logger.log('✅ Storage override removed successfully')
    return { success: true }
  } catch (error) {
    logger.error('Failed to remove storage override:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Get storage value
 */
export async function getStorageValue(key: string, storageType: string): Promise<StorageOperationResult> {
  try {
    const results = await executeScriptWithResult(
      (key: string, storageType: string) => {
        switch (storageType) {
          case 'localStorage':
            return window.localStorage.getItem(key)
          case 'sessionStorage':
            return window.sessionStorage.getItem(key)
          default:
            return null
        }
      },
      [key, storageType],
    )

    const value = results[0]
    return { success: true, value: value || undefined }
  } catch (error) {
    logger.error('Failed to get storage value:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Clear all storage overrides
 */
export async function clearAllOverrides(): Promise<StorageOperationResult> {
  try {
    await executeScriptDirect(() => {
      // eslint-disable-next-line no-console
      console.log('🧹 STATSIG: Clearing all overrides')

      // Clear localStorage items that look like Statsig overrides
      const localStorageKeys = Object.keys(window.localStorage)
      localStorageKeys.forEach((key) => {
        if (key.includes('statsig') || key.includes('feature') || key.includes('experiment')) {
          window.localStorage.removeItem(key)
          // eslint-disable-next-line no-console
          console.log('🗑️ STATSIG: Removed localStorage key:', key)
        }
      })

      // Clear sessionStorage items that look like Statsig overrides
      const sessionStorageKeys = Object.keys(window.sessionStorage)
      sessionStorageKeys.forEach((key) => {
        if (key.includes('statsig') || key.includes('feature') || key.includes('experiment')) {
          window.sessionStorage.removeItem(key)
          // eslint-disable-next-line no-console
          console.log('🗑️ STATSIG: Removed sessionStorage key:', key)
        }
      })

      // Clear Statsig overrides from window
      const statsigWindow = window as StatsigWindow
      if (statsigWindow.statsigOverrides) {
        delete statsigWindow.statsigOverrides
        // eslint-disable-next-line no-console
        console.log('🗑️ STATSIG: Cleared window.statsigOverrides')
      }

      // eslint-disable-next-line no-console
      console.log('✅ STATSIG: All overrides cleared successfully')
    })

    logger.log('✅ All overrides cleared successfully')
    return { success: true }
  } catch (error) {
    logger.error('Failed to clear all overrides:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Get cookies from the page
 */
export async function getCookies(): Promise<{ success: boolean; data?: CookieData; error?: string }> {
  try {
    await executeScriptDirect(() => {
      const cookies: CookieData = {}
      window.document.cookie.split(';').forEach((cookie) => {
        const [key, value] = cookie.trim().split('=')
        if (key && value) {
          cookies[key] = value
        }
      })
      const statsigWindow = window as StatsigWindow
      statsigWindow.statsigCookieResult = cookies
    })

    // Wait a bit for the script to execute
    await new Promise((resolve) => setTimeout(resolve, 100))

    const results = await executeScriptWithResult(() => {
      const statsigWindow = window as StatsigWindow
      return statsigWindow.statsigCookieResult || {}
    })

    return { success: true, data: results[0] }
  } catch (error) {
    logger.error('Failed to get cookies:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Remove specific Statsig override from window
 */
async function removeStatsigOverride(featureName: string): Promise<void> {
  await executeScriptDirect(
    (featureName: string) => {
      const statsigWindow = window as StatsigWindow
      if (statsigWindow.statsigOverrides && statsigWindow.statsigOverrides[featureName]) {
        delete statsigWindow.statsigOverrides[featureName]
        // eslint-disable-next-line no-console
        console.log('🗑️ STATSIG: Removed override for feature:', featureName)
      }
    },
    [featureName],
  )
}
