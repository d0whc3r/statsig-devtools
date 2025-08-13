import { describe, expect, it } from 'vitest'

import { devConsole } from './dev-tools'

describe('dev-tools', () => {
  it('should have devConsole object', () => {
    expect(devConsole).toBeDefined()
    expect(typeof devConsole.stores).toBe('function')
    expect(typeof devConsole.resetStores).toBe('function')
    expect(typeof devConsole.logStoreChanges).toBe('function')
  })

  it('should return null when no store debug utilities are available', () => {
    const result = devConsole.stores()
    expect(result).toBeNull()
  })

  it('should warn when trying to reset stores without utilities', () => {
    // This should not throw, just warn
    expect(() => devConsole.resetStores()).not.toThrow()
  })

  it('should return null when trying to log store changes without utilities', () => {
    const result = devConsole.logStoreChanges('test-store')
    expect(result).toBeNull()
  })
})
