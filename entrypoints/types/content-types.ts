// Content script message types for extension communication

export interface ContentScriptMessage {
  type: 'SET_STORAGE_OVERRIDE' | 'REMOVE_STORAGE_OVERRIDE' | 'GET_STORAGE_VALUE' | 'PING'
  payload?: {
    type?: 'localStorage' | 'sessionStorage' | 'cookie'
    key?: string
    value?: string
    domain?: string
  }
}

export interface ContentScriptResponse {
  success: boolean
  error?: string
  data?: unknown
}

export interface BackgroundMessage {
  type: 'GET_ACTIVE_TAB' | 'PING_BACKGROUND' | 'OPEN_SIDEPANEL'
  payload?: unknown
}

export interface BackgroundResponse {
  success: boolean
  error?: string
  data?: unknown
}

export interface TabInfo {
  id?: number
  url?: string
  title?: string
  canInject: boolean
}
