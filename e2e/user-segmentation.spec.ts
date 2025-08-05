import { StatsigPlaywrightCommands } from './fixtures/playwright-commands'
import { TestPages } from './fixtures/test-pages'

import { chromium, expect, test } from '@playwright/test'

/**
 * User Segmentation Tests
 * Tests cookie-based user segmentation functionality
 */

test.describe('User Segmentation via Cookies', () => {
  test('should handle complete user segmentation workflow', async () => {
    console.log('🍪 Testing user segmentation workflow...')

    const browser = await chromium.launch({
      headless: false,
      args: [
        '--disable-extensions-except=./.output/chrome-mv3',
        '--load-extension=./.output/chrome-mv3',
        '--disable-web-security',
      ],
    })

    const context = await browser.newContext()
    const page = await context.newPage()
    const commands = new StatsigPlaywrightCommands(page, context)

    try {
      // Setup API mocking
      await commands.setupStatsigApiMocking()

      // Navigate to real domain for cookie testing
      await page.goto('https://example.com')

      // Load user segmentation test page
      await page.setContent(TestPages.userSegmentationPage)
      await page.waitForTimeout(2000)

      // Verify initial state (free tier)
      await expect(page.locator('#tier')).toHaveText('Free')
      await expect(page.locator('#features')).toHaveText('Basic only')
      await expect(page.locator('#cookie-value')).toHaveText('none')

      console.log('✅ Step 1: Initial state verified - Free tier')

      // Test premium tier
      await page.click('#set-premium')
      await page.waitForTimeout(1000)

      await expect(page.locator('#tier')).toHaveText('Premium')
      await expect(page.locator('#features')).toHaveText('Basic + Premium')
      await expect(page.locator('#cookie-value')).toHaveText('premium')

      console.log('✅ Step 2: Premium tier set successfully')

      // Test enterprise tier
      await page.click('#set-enterprise')
      await page.waitForTimeout(1000)

      await expect(page.locator('#tier')).toHaveText('Enterprise')
      await expect(page.locator('#features')).toHaveText('Basic + Premium + Enterprise')
      await expect(page.locator('#cookie-value')).toHaveText('enterprise')

      console.log('✅ Step 3: Enterprise tier set successfully')

      // Test clearing tier
      await page.click('#clear-tier')
      await page.waitForTimeout(1000)

      await expect(page.locator('#tier')).toHaveText('Free')
      await expect(page.locator('#features')).toHaveText('Basic only')
      await expect(page.locator('#cookie-value')).toHaveText('none')

      console.log('✅ Step 4: Tier cleared successfully')

      await commands.takeScreenshot('user-segmentation-complete', page)

      console.log('🎉 User segmentation workflow completed successfully!')
      console.log('✅ Cookie setting works')
      console.log('✅ Cookie reading works')
      console.log('✅ Feature logic based on cookies works')
      console.log('✅ Cookie clearing works')
    } finally {
      await context.close()
      await browser.close()
    }
  })
})
