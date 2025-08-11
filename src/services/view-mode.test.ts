import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import { type ViewMode, viewModeService } from './view-mode'

// Mock the logger
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock Chrome APIs
const mockChrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  windows: {
    getCurrent: vi.fn(),
  },
  sidePanel: {
    open: vi.fn(),
  },
  tabs: {
    create: vi.fn(),
  },
  runtime: {
    getURL: vi.fn(),
    getManifest: vi.fn(),
  },
}

// Mock global chrome object
Object.defineProperty(global, 'chrome', {
  value: mockChrome,
  writable: true,
})

// Mock DOM methods
Object.defineProperty(global, 'window', {
  value: {
    location: {
      pathname: '/popup',
      origin: 'chrome-extension://test',
    },
  },
  writable: true,
})

Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  },
  writable: true,
})

Object.defineProperty(global, 'setTimeout', {
  value: vi.fn((callback: () => void) => {
    callback()
    return 1
  }),
  writable: true,
})

describe('ViewModeService', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset mocks to default behavior
    mockChrome.storage.local.get.mockResolvedValue({})
    mockChrome.storage.local.set.mockResolvedValue(undefined)
    mockChrome.windows.getCurrent.mockResolvedValue({ id: 1 })
    mockChrome.sidePanel.open = vi.fn().mockResolvedValue(undefined)
    mockChrome.tabs.create.mockResolvedValue({ id: 1 })
    mockChrome.runtime.getURL.mockReturnValue('chrome-extension://test/tab.html')
    mockChrome.runtime.getManifest.mockReturnValue({
      permissions: ['sidePanel', 'storage', 'tabs'],
      manifest_version: 3,
    })

    // Mock document.createElement
    const mockElement = {
      className: '',
      textContent: '',
      style: { opacity: '1' },
    }
    ;(document.createElement as Mock).mockReturnValue(mockElement)
  })

  describe('getPreferences', () => {
    it('should return stored preferences', async () => {
      const storedPreferences = {
        preferredMode: 'sidebar' as ViewMode,
        lastUsed: 1234567890,
      }
      mockChrome.storage.local.get.mockResolvedValue({
        statsig_view_mode_preferences: storedPreferences,
      })

      const preferences = await viewModeService.getPreferences()

      expect(preferences).toEqual(storedPreferences)
      expect(mockChrome.storage.local.get).toHaveBeenCalledWith('statsig_view_mode_preferences')
    })

    it('should return default preferences when none stored', async () => {
      mockChrome.storage.local.get.mockResolvedValue({})

      const preferences = await viewModeService.getPreferences()

      expect(preferences).toEqual({
        preferredMode: 'popup',
        lastUsed: expect.any(Number),
      })
    })

    it('should handle storage errors gracefully', async () => {
      mockChrome.storage.local.get.mockRejectedValue(new Error('Storage error'))

      const preferences = await viewModeService.getPreferences()

      expect(preferences).toEqual({
        preferredMode: 'popup',
        lastUsed: expect.any(Number),
      })
    })
  })

  describe('savePreferences', () => {
    it('should save preferences with updated timestamp', async () => {
      const preferences = {
        preferredMode: 'sidebar' as ViewMode,
        lastUsed: 1234567890,
      }

      await viewModeService.savePreferences(preferences)

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        statsig_view_mode_preferences: {
          ...preferences,
          lastUsed: expect.any(Number),
        },
      })
    })

    it('should handle save errors gracefully', async () => {
      mockChrome.storage.local.set.mockRejectedValue(new Error('Save error'))
      const preferences = {
        preferredMode: 'popup' as ViewMode,
        lastUsed: Date.now(),
      }

      await expect(viewModeService.savePreferences(preferences)).resolves.not.toThrow()
    })
  })

  describe('switchToSidebar', () => {
    it('should switch to sidebar successfully', async () => {
      await viewModeService.switchToSidebar()

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        statsig_view_mode_preferences: {
          preferredMode: 'sidebar',
          lastUsed: expect.any(Number),
        },
      })
      expect(mockChrome.windows.getCurrent).toHaveBeenCalled()
      expect(mockChrome.sidePanel.open).toHaveBeenCalledWith({ windowId: 1 })
    })

    it('should handle missing window ID', async () => {
      mockChrome.windows.getCurrent.mockResolvedValue({})

      await viewModeService.switchToSidebar()

      expect(mockChrome.sidePanel.open).not.toHaveBeenCalled()
    })

    it('should handle sidebar errors', async () => {
      mockChrome.sidePanel.open.mockRejectedValue(new Error('Network error'))

      await expect(viewModeService.switchToSidebar()).rejects.toThrow('Could not open sidebar: Network error')
    })
  })

  describe('switchToPopup', () => {
    it('should switch to popup successfully', async () => {
      await viewModeService.switchToPopup()

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        statsig_view_mode_preferences: {
          preferredMode: 'popup',
          lastUsed: expect.any(Number),
        },
      })
      expect(document.createElement).toHaveBeenCalledWith('div')
      expect(document.body.appendChild).toHaveBeenCalled()
    })

    it('should handle popup switch errors', async () => {
      // Mock document.createElement to throw an error (simulating DOM error in showSwitchNotification)
      ;(document.createElement as Mock).mockImplementation(() => {
        throw new Error('DOM error')
      })

      await expect(viewModeService.switchToPopup()).rejects.toThrow('Could not switch to popup mode.')
    })
  })

  describe('switchToTab', () => {
    it('should switch to tab successfully', async () => {
      await viewModeService.switchToTab()

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        statsig_view_mode_preferences: {
          preferredMode: 'tab',
          lastUsed: expect.any(Number),
        },
      })
      expect(mockChrome.runtime.getURL).toHaveBeenCalledWith('tab.html')
      expect(mockChrome.tabs.create).toHaveBeenCalledWith({
        url: 'chrome-extension://test/tab.html',
        active: true,
      })
    })

    it('should use fallback URL when runtime.getURL fails', async () => {
      mockChrome.runtime.getURL.mockImplementation(() => {
        throw new Error('Runtime error')
      })

      await viewModeService.switchToTab()

      expect(mockChrome.tabs.create).toHaveBeenCalledWith({
        url: 'chrome-extension://test/tab.html',
        active: true,
      })
    })

    it('should handle tab creation errors', async () => {
      mockChrome.tabs.create.mockRejectedValue(new Error('Tab error'))

      await expect(viewModeService.switchToTab()).rejects.toThrow('Could not open in new tab.')
    })
  })

  describe('getCurrentMode', () => {
    it('should detect tab mode', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/tab' },
        writable: true,
      })

      const mode = viewModeService.getCurrentMode()

      expect(mode).toBe('tab')
    })

    it('should detect sidebar mode', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/sidepanel' },
        writable: true,
      })

      const mode = viewModeService.getCurrentMode()

      expect(mode).toBe('sidebar')
    })

    it('should detect popup mode', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/popup' },
        writable: true,
      })

      const mode = viewModeService.getCurrentMode()

      expect(mode).toBe('popup')
    })

    it('should default to popup mode', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/unknown' },
        writable: true,
      })

      const mode = viewModeService.getCurrentMode()

      expect(mode).toBe('popup')
    })
  })

  describe('isSidebarSupported', () => {
    it('should return true when sidebar is supported', () => {
      const isSupported = viewModeService.isSidebarSupported()

      expect(isSupported).toBe(true)
    })

    it('should return false when chrome is undefined', () => {
      const originalChrome = global.chrome
      delete (global as any).chrome

      const isSupported = viewModeService.isSidebarSupported()

      expect(isSupported).toBe(false)

      // Restore chrome
      global.chrome = originalChrome
    })

    it('should return false when sidePanel is undefined', () => {
      const originalSidePanel = mockChrome.sidePanel
      delete (mockChrome as any).sidePanel

      const isSupported = viewModeService.isSidebarSupported()

      expect(isSupported).toBe(false)

      // Restore sidePanel
      mockChrome.sidePanel = originalSidePanel
    })

    it('should return false when sidePanel.open is not a function', () => {
      mockChrome.sidePanel.open = 'not a function' as any

      const isSupported = viewModeService.isSidebarSupported()

      expect(isSupported).toBe(false)
    })
  })

  describe('initializeViewMode', () => {
    it('should initialize successfully with sidebar preference', async () => {
      mockChrome.storage.local.get.mockResolvedValue({
        statsig_view_mode_preferences: {
          preferredMode: 'sidebar',
          lastUsed: Date.now(),
        },
      })

      Object.defineProperty(window, 'location', {
        value: { pathname: '/popup' },
        writable: true,
      })

      await expect(viewModeService.initializeViewMode()).resolves.not.toThrow()
    })

    it('should handle initialization errors gracefully', async () => {
      mockChrome.storage.local.get.mockRejectedValue(new Error('Storage error'))

      await expect(viewModeService.initializeViewMode()).resolves.not.toThrow()
    })
  })

  describe('showSwitchNotification', () => {
    it('should show notification for popup mode', async () => {
      await viewModeService.switchToPopup()

      const mockElement = (document.createElement as Mock).mock.results[0].value
      expect(mockElement.textContent).toBe('Switched to popup mode. Click the extension icon to open the popup.')
      expect(document.body.appendChild).toHaveBeenCalled()
    })

    it('should show notification for tab mode', async () => {
      await viewModeService.switchToTab()

      const mockElement = (document.createElement as Mock).mock.results[0].value
      expect(mockElement.textContent).toBe('Opening in new tab...')
    })

    it('should remove notification after timeout', async () => {
      await viewModeService.switchToPopup()

      expect(document.body.removeChild).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle missing chrome APIs gracefully', async () => {
      const originalChrome = global.chrome
      delete (global as any).chrome

      await expect(viewModeService.getPreferences()).resolves.toEqual({
        preferredMode: 'popup',
        lastUsed: expect.any(Number),
      })

      // Restore chrome
      global.chrome = originalChrome
    })

    it('should handle DOM manipulation errors', async () => {
      ;(document.createElement as Mock).mockImplementation(() => {
        throw new Error('DOM error')
      })

      // Should not throw even if DOM manipulation fails
      await expect(viewModeService.switchToPopup()).rejects.toThrow('Could not switch to popup mode.')
    })
  })
})
