import type { ViewMode } from '../services/view-mode'

/**
 * Configuration for view mode toggle buttons
 */
export interface ButtonConfig {
  text: string
  mobileText: string
  iconPath: string
}

/**
 * Get button configuration based on target mode
 */
export const getButtonConfig = (targetMode: ViewMode): ButtonConfig => ({
  text: targetMode === 'tab' ? 'Open in Tab' : targetMode === 'sidebar' ? 'Open Sidebar' : 'Switch to Popup',
  mobileText: targetMode === 'tab' ? 'Tab' : targetMode === 'sidebar' ? 'Sidebar' : 'Popup',
  iconPath:
    targetMode === 'tab'
      ? 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
      : targetMode === 'sidebar'
        ? 'M4 6h16M4 10h16M4 14h16M4 18h16'
        : 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
})

/**
 * Get button styling based on target mode, loading state, and current mode
 */
export const getButtonStyle = (targetMode: ViewMode, isLoading: boolean, currentMode: ViewMode): string => {
  const isPopup = currentMode === 'popup'
  const baseStyle = isPopup
    ? 'group relative inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium text-xs transition-all duration-200 ease-in-out'
    : 'group relative inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ease-in-out'

  const colorStyle =
    targetMode === 'tab'
      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md hover:from-purple-600 hover:to-purple-700 hover:shadow-lg'
      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg'

  const interactionStyle = isLoading
    ? 'opacity-75 cursor-not-allowed'
    : isPopup
      ? 'hover:scale-102 active:scale-95'
      : 'hover:scale-105 active:scale-95'
  const disabledStyle = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'

  return `${baseStyle} ${colorStyle} ${interactionStyle} ${disabledStyle}`
}
