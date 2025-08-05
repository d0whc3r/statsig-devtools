import { StatsigPlaywrightCommands } from './fixtures/playwright-commands'
import { TestPages } from './fixtures/test-pages'

import { chromium, expect, test } from '@playwright/test'

/**
 * API Mocking Tests
 * Tests API mocking functionality and error handling
 */

test.describe('API Mocking and Error Handling', () => {
  test('should handle successful API mocking', async () => {
    console.log('🧪 Testing successful API mocking...')

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
      // Setup successful API mocking
      await commands.setupStatsigApiMocking()

      // Load API test page
      await page.setContent(TestPages.apiTestPage)
      await page.waitForTimeout(1000)

      // Test successful API call
      await page.click('#test-success')
      await page.waitForTimeout(2000)

      await expect(page.locator('#success-result')).toContainText('✅ Received 1 gates')
      console.log('✅ Successful API mocking works')

      await commands.takeScreenshot('api-success-test', page)

      console.log('🎉 Successful API mocking test completed!')
    } finally {
      await context.close()
      await browser.close()
    }
  })

  test('should handle API error responses', async () => {
    console.log('❌ Testing API error handling...')

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
      // Setup error API mocking
      await commands.setupStatsigApiErrorMocking()

      // Load API test page
      await page.setContent(TestPages.apiTestPage)
      await page.waitForTimeout(1000)

      // Test successful API call (should work)
      await page.click('#test-success')
      await page.waitForTimeout(2000)

      await expect(page.locator('#success-result')).toContainText('✅ Received 1 gates')
      console.log('✅ Success API still works')

      // Test error API call
      await page.click('#test-error')
      await page.waitForTimeout(2000)

      await expect(page.locator('#error-result')).toContainText('✅ Correctly handled 401')
      console.log('✅ Error API mocking works')

      await commands.takeScreenshot('api-error-test', page)

      console.log('🎉 API error handling test completed!')
    } finally {
      await context.close()
      await browser.close()
    }
  })
})
