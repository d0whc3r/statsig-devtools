import { StatsigPlaywrightCommands } from './fixtures/playwright-commands'
import { TestPages } from './fixtures/test-pages'

import { chromium, expect, test } from '@playwright/test'

/**
 * Feature Flag Tests
 * Tests localStorage-based feature flag functionality
 */

test.describe('Feature Flag Overrides', () => {
  test('should handle basic feature flag operations', async () => {
    console.log('🚀 Testing basic feature flag operations...')

    const browser = await chromium.launch({
      headless: false,
      args: [
        '--disable-extensions-except=./.output/chrome-mv3',
        '--load-extension=./.output/chrome-mv3',
        '--disable-web-security',
        '--no-sandbox',
      ],
    })

    const context = await browser.newContext()
    const page = await context.newPage()
    const commands = new StatsigPlaywrightCommands(page, context)

    try {
      await commands.setupStatsigApiMocking()

      // Load feature flag test page
      await page.setContent(TestPages.featureFlagPage)
      await page.waitForTimeout(3000)

      // Wait for initial state to be set
      await page.waitForFunction(
        () => {
          const status = document.getElementById('feature-status')?.textContent
          return status && status !== 'checking...'
        },
        { timeout: 10000 },
      )

      // Verify initial state (disabled)
      await expect(page.locator('#feature-status')).toHaveText('DISABLED')
      await expect(page.locator('#override-value')).toHaveText('none')
      await expect(page.locator('#source')).toHaveText('api')
      await expect(page.locator('#old-feature')).toBeVisible()
      await expect(page.locator('#new-feature')).not.toBeVisible()

      console.log('✅ Step 1: Initial state verified - feature disabled')

      // Enable feature
      await page.click('#enable-feature')
      await page.waitForTimeout(1500)

      await expect(page.locator('#feature-status')).toHaveText('ENABLED')
      await expect(page.locator('#override-value')).toHaveText('true')
      await expect(page.locator('#source')).toHaveText('override')
      await expect(page.locator('#old-feature')).not.toBeVisible()
      await expect(page.locator('#new-feature')).toBeVisible()

      console.log('✅ Step 2: Feature enabled successfully')

      // Disable feature (explicit false)
      await page.click('#disable-feature')
      await page.waitForTimeout(1500)

      await expect(page.locator('#feature-status')).toHaveText('DISABLED')
      await expect(page.locator('#override-value')).toHaveText('false')
      await expect(page.locator('#source')).toHaveText('override')
      await expect(page.locator('#old-feature')).toBeVisible()
      await expect(page.locator('#new-feature')).not.toBeVisible()

      console.log('✅ Step 3: Feature disabled with explicit override')

      // Clear override (back to API default)
      await page.click('#clear-override')
      await page.waitForTimeout(1500)

      await expect(page.locator('#feature-status')).toHaveText('DISABLED')
      await expect(page.locator('#override-value')).toHaveText('none')
      await expect(page.locator('#source')).toHaveText('api')

      console.log('✅ Step 4: Override cleared, back to API default')

      await commands.takeScreenshot('feature-flag-operations', page)

      console.log('🎉 Basic feature flag operations completed successfully!')
    } finally {
      await context.close()
      await browser.close()
    }
  })

  test('should handle e-commerce checkout flow scenario', async () => {
    console.log('🛒 Testing e-commerce checkout flow scenario...')

    const browser = await chromium.launch({
      headless: false,
      args: [
        '--disable-extensions-except=./.output/chrome-mv3',
        '--load-extension=./.output/chrome-mv3',
        '--disable-web-security',
        '--no-sandbox',
      ],
    })

    const context = await browser.newContext()
    const page = await context.newPage()
    const commands = new StatsigPlaywrightCommands(page, context)

    try {
      // Mock specific APIs for checkout flow
      await context.route('**/console/v1/gates', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'checkout_flow_v2',
                name: 'checkout_flow_v2',
                isEnabled: true,
                description: 'New checkout flow for better conversion',
                rules: [{ name: 'Rollout', passPercentage: 50 }],
                tags: ['checkout', 'conversion'],
              },
            ],
          }),
        })
      })

      await context.route('**/v1/initialize', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            feature_gates: {
              checkout_flow_v2: { value: false, rule_id: 'default' }, // Default: disabled
            },
            dynamic_configs: {},
            layer_configs: {},
            has_updates: true,
            time: Date.now(),
          }),
        })
      })

      // Load e-commerce test page
      await page.setContent(TestPages.ecommercePage)
      await page.waitForTimeout(3000)

      // Wait for initial state
      await page.waitForFunction(
        () => {
          const status = document.getElementById('flag-status')?.textContent
          return status && status !== 'checking...'
        },
        { timeout: 10000 },
      )

      // Verify initial state: old checkout should be visible
      await expect(page.locator('#old-checkout')).toBeVisible()
      await expect(page.locator('#new-checkout')).not.toBeVisible()
      await expect(page.locator('#flag-status')).toHaveText('DISABLED')

      console.log('✅ Step 1: Initial state verified - old checkout visible')

      // Simulate extension enabling feature flag
      console.log('🔧 Step 2: User enables feature flag via extension...')

      await page.evaluate(() => {
        // Simulate extension setting override
        window.localStorage.setItem('statsig_override_checkout_flow_v2', 'true')
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'statsig_override_checkout_flow_v2',
            newValue: 'true',
            storageArea: window.localStorage,
          }),
        )
      })

      await page.waitForTimeout(2000)

      // Verify new checkout is now visible
      await expect(page.locator('#old-checkout')).not.toBeVisible()
      await expect(page.locator('#new-checkout')).toBeVisible()
      await expect(page.locator('#flag-status')).toHaveText('ENABLED')
      await expect(page.locator('#source')).toHaveText('override')

      console.log('✅ Step 2: Feature flag enabled - new checkout visible')

      // Test persistence across page reload
      console.log('🔧 Step 3: Testing persistence across reload...')

      await page.reload()
      await page.waitForTimeout(2000)

      // Reload the test page content
      await page.setContent(TestPages.ecommercePage)
      await page.waitForTimeout(3000)

      // Wait for state to be restored
      await page.waitForFunction(
        () => {
          const status = document.getElementById('flag-status')?.textContent
          return status && status !== 'checking...'
        },
        { timeout: 10000 },
      )

      // Should still show new checkout
      await expect(page.locator('#new-checkout')).toBeVisible()
      await expect(page.locator('#flag-status')).toHaveText('ENABLED')

      console.log('✅ Step 3: Override persists across reload')

      await commands.takeScreenshot('ecommerce-checkout-flow', page)

      console.log('🎉 E-commerce checkout flow scenario completed successfully!')
    } finally {
      await context.close()
      await browser.close()
    }
  })
})
