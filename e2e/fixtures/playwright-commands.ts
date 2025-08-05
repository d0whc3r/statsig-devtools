import type { BrowserContext, Page } from '@playwright/test'

import { expect } from '@playwright/test'

/**
 * Custom Playwright commands for Statsig DevTools E2E testing
 */

export class StatsigPlaywrightCommands {
  constructor(
    private page: Page,
    private context: BrowserContext,
  ) {}

  /**
   * Setup comprehensive API mocking for Statsig endpoints
   */
  async setupStatsigApiMocking() {
    // Mock Console API endpoints
    await this.context.route('**/console/v1/gates', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'test_gate',
              name: 'test_feature_gate',
              isEnabled: true,
              description: 'Test feature gate for E2E testing',
              rules: [],
              tags: ['test'],
            },
          ],
        }),
      })
    })

    await this.context.route('**/console/v1/experiments', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'test_experiment',
              name: 'test_experiment',
              isEnabled: true,
              description: 'Test experiment for E2E testing',
              groups: [
                { name: 'control', size: 50 },
                { name: 'variant', size: 50 },
              ],
            },
          ],
        }),
      })
    })

    await this.context.route('**/v1/initialize', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          feature_gates: {
            test_feature_gate: { value: true, rule_id: 'default' },
          },
          dynamic_configs: {},
          layer_configs: {},
          has_updates: true,
          time: Date.now(),
        }),
      })
    })

    // Mock validation endpoints
    await this.context.route('**/console/v1/projects', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isValid: true,
          projectName: 'Test Project',
        }),
      })
    })
  }

  /**
   * Setup API error mocking for testing error handling
   */
  async setupStatsigApiErrorMocking() {
    await this.context.route('**/console/v1/gates', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'test_gate',
              name: 'test_feature',
              isEnabled: true,
              description: 'Test feature gate',
            },
          ],
        }),
      })
    })

    await this.context.route('**/console/v1/experiments', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Invalid API key',
          message: 'Authentication failed',
        }),
      })
    })
  }

  /**
   * Get extension ID from browser extensions page
   */
  async getExtensionId(): Promise<string> {
    const extensionsPage = await this.context.newPage()

    try {
      await extensionsPage.goto('chrome://extensions/')
      await extensionsPage.waitForLoadState('domcontentloaded')

      // Enable developer mode if needed
      const devModeToggle = extensionsPage.locator('#devMode')
      if ((await devModeToggle.count()) > 0 && !(await devModeToggle.isChecked())) {
        await devModeToggle.click()
        await extensionsPage.waitForTimeout(1000)
      }

      // Get first extension ID (should be our extension)
      const extensionItems = extensionsPage.locator('extensions-item')
      const count = await extensionItems.count()

      if (count > 0) {
        const extensionId = await extensionItems.first().getAttribute('id')
        await extensionsPage.close()
        return extensionId || ''
      }

      throw new Error('No extensions found')
    } catch (error) {
      await extensionsPage.close()
      throw new Error(`Could not find extension ID: ${error}`)
    }
  }

  /**
   * Open extension popup interface
   */
  async openExtensionPopup(): Promise<Page> {
    const extensionId = await this.getExtensionId()
    const popupPage = await this.context.newPage()
    await popupPage.goto(`chrome-extension://${extensionId}/popup/index.html`)
    await popupPage.waitForLoadState('domcontentloaded')
    await popupPage.waitForTimeout(3000) // Wait for React to load
    return popupPage
  }

  /**
   * Open extension tab interface
   */
  async openExtensionTab(): Promise<Page> {
    const extensionId = await this.getExtensionId()
    const tabPage = await this.context.newPage()
    await tabPage.goto(`chrome-extension://${extensionId}/tab/index.html`)
    await tabPage.waitForLoadState('domcontentloaded')
    await tabPage.waitForTimeout(3000)
    return tabPage
  }

  /**
   * Open extension sidepanel interface
   */
  async openExtensionSidepanel(): Promise<Page> {
    const extensionId = await this.getExtensionId()
    const sidepanelPage = await this.context.newPage()
    await sidepanelPage.goto(`chrome-extension://${extensionId}/sidepanel/index.html`)
    await sidepanelPage.waitForLoadState('domcontentloaded')
    await sidepanelPage.waitForTimeout(3000)
    return sidepanelPage
  }

  /**
   * Verify extension is loaded in browser
   */
  async verifyExtensionLoaded(): Promise<{ extensionId: string; count: number }> {
    const extensionsPage = await this.context.newPage()

    try {
      await extensionsPage.goto('chrome://extensions/')
      await extensionsPage.waitForLoadState('domcontentloaded')

      // Enable developer mode if needed
      const devModeToggle = extensionsPage.locator('#devMode')
      if ((await devModeToggle.count()) > 0 && !(await devModeToggle.isChecked())) {
        await devModeToggle.click()
        await extensionsPage.waitForTimeout(1000)
      }

      // Find extension
      const extensionItems = extensionsPage.locator('extensions-item')
      const count = await extensionItems.count()
      expect(count).toBeGreaterThan(0)

      // Get extension ID
      const extensionId = (await extensionItems.first().getAttribute('id')) || ''
      expect(extensionId).toBeTruthy()

      await extensionsPage.close()
      return { extensionId, count }
    } catch (error) {
      await extensionsPage.close()
      throw error
    }
  }

  /**
   * Take screenshot with consistent naming
   */
  async takeScreenshot(name: string, page?: Page): Promise<void> {
    const targetPage = page || this.page
    await targetPage.screenshot({ path: `test-results/${name}.png` })
  }

  /**
   * Wait for element with custom timeout and error message
   */
  async waitForElementWithTimeout(selector: string, timeout: number = 10000, errorMessage?: string): Promise<void> {
    try {
      await this.page.waitForSelector(selector, { timeout })
    } catch (error) {
      throw new Error(errorMessage || `Element ${selector} not found within ${timeout}ms`)
    }
  }

  /**
   * Set cookie with domain handling
   */
  async setCookieWithDomain(name: string, value: string, domain: string): Promise<void> {
    await this.context.addCookies([
      {
        name,
        value,
        domain,
        path: '/',
      },
    ])
  }

  /**
   * Clear all cookies for domain
   */
  async clearCookiesForDomain(domain: string): Promise<void> {
    const cookies = await this.context.cookies()
    const domainCookies = cookies.filter((cookie) => cookie.domain === domain)

    for (const cookie of domainCookies) {
      await this.context.addCookies([
        {
          ...cookie,
          expires: 0, // Expire immediately
        },
      ])
    }
  }
}
