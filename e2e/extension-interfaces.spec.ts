import { StatsigPlaywrightCommands } from './fixtures/playwright-commands'

import { chromium, expect, test } from '@playwright/test'

/**
 * Extension Interface Tests
 * Tests the extension's popup, sidepanel, and tab interfaces
 */

test.describe('Extension Interfaces', () => {
  test('should verify extension loading and interface accessibility', async () => {
    console.log('🔍 Testing extension loading and interface accessibility...')

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
      // Setup API mocking to prevent extension errors
      await commands.setupStatsigApiMocking()

      // Step 1: Verify extension is loaded
      const { extensionId, count } = await commands.verifyExtensionLoaded()
      console.log(`✅ Extension loaded with ID: ${extensionId}`)
      console.log(`✅ Found ${count} extensions in browser`)

      // Step 2: Test popup interface
      console.log('🔍 Testing popup interface...')
      const popupPage = await commands.openExtensionPopup()

      // Verify popup loads with React root
      const rootElement = popupPage.locator('#root')
      await expect(rootElement).toBeVisible()

      await commands.takeScreenshot('popup-interface', popupPage)
      console.log('✅ Popup interface accessible')
      await popupPage.close()

      // Step 3: Test tab interface
      console.log('🔍 Testing tab interface...')
      const tabPage = await commands.openExtensionTab()

      // Verify tab interface loads
      const tabRootElement = tabPage.locator('#root')
      await expect(tabRootElement).toBeVisible()

      await commands.takeScreenshot('tab-interface', tabPage)
      console.log('✅ Tab interface accessible')
      await tabPage.close()

      // Step 4: Test sidepanel interface
      console.log('🔍 Testing sidepanel interface...')
      const sidepanelPage = await commands.openExtensionSidepanel()

      // Verify sidepanel interface loads
      const sidepanelRootElement = sidepanelPage.locator('#root')
      await expect(sidepanelRootElement).toBeVisible()

      await commands.takeScreenshot('sidepanel-interface', sidepanelPage)
      console.log('✅ Sidepanel interface accessible')
      await sidepanelPage.close()

      console.log('🎉 All extension interfaces are accessible and functional')
    } finally {
      await context.close()
      await browser.close()
    }
  })
})
