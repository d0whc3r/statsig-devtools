import { Logger } from '@/src/utils/logger'

const logger = new Logger('browser-actions')

export async function openInTab() {
  try {
    const url = browser.runtime.getURL('/tab.html')
    await browser.tabs.create({ url })
  } catch (error) {
    logger.error('Failed to open tab:', error)
  }
}

export async function openSidebar() {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const activeTab = tabs[0]

    if (activeTab?.id) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (browser.sidePanel?.open) {
        await browser.sidePanel.open({ tabId: activeTab.id })
      } else {
        logger.warn('SidePanel API not available')
      }
    }
  } catch (error) {
    logger.error('Failed to open sidebar:', error)
  }
}

export function isPopupView() {
  return window.location.pathname.includes('popup')
}

export function isSidebarView() {
  return window.location.pathname.includes('sidepanel')
}

export function isTabView() {
  return window.location.pathname.includes('tab')
}
