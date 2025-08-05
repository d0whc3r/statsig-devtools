/**
 * Script execution utilities for content script
 */

import { BrowserDetection } from '@/src/utils/browser-api'

import type { ScriptFunction } from '../types/content-types'

/**
 * Execute script directly using browser.scripting API
 */
export async function executeScriptDirect<T extends string[]>(func: ScriptFunction<T>, args?: T): Promise<void> {
  // Get current tab
  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  if (!tabs[0]?.id) {
    throw new Error('No active tab found')
  }

  await browser.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func,
    args,
  })
}

/**
 * Execute script with fallback for different browser environments
 */
export async function executeScriptWithFallback<T extends string[]>(func: ScriptFunction<T>, args?: T): Promise<void> {
  try {
    await executeScriptDirect(func, args)
  } catch (error) {
    // Fallback for older browser versions or different environments
    if (BrowserDetection.isFirefox && args) {
      await executeScriptFirefoxFallback(func, args)
    } else {
      throw error
    }
  }
}

/**
 * Firefox-specific fallback for script execution
 */
async function executeScriptFirefoxFallback<T extends string[]>(func: ScriptFunction<T>, args: T): Promise<void> {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  if (!tabs[0]?.id) {
    throw new Error('No active tab found')
  }

  // Create a script string that can be executed
  const scriptString = `
    (${func.toString()})(${args.map((arg) => JSON.stringify(arg)).join(', ')});
  `

  await browser.tabs.executeScript(tabs[0].id, {
    code: scriptString,
  })
}

/**
 * Execute script and return result
 */
export async function executeScriptWithResult<T extends string[], R>(func: (...args: T) => R, args?: T): Promise<R[]> {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  if (!tabs[0]?.id) {
    throw new Error('No active tab found')
  }

  const results = await browser.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func,
    args,
  })

  return results.map((result) => result.result as R)
}
