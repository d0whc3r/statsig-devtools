import type { BrowserContext } from '@playwright/test'

/**
 * Simplified helper functions for browser extension E2E testing
 */

export class ExtensionHelper {
  constructor(private context: BrowserContext) {}

  /**
   * Setup comprehensive API mocking for Statsig endpoints
   */
  async setupApiMocking() {
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
}
