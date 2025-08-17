export const backgroundMessageAction = {
  PING_BACKGROUND: 'PING_BACKGROUND',
  GET_ACTIVE_TAB: 'GET_ACTIVE_TAB',
  GET_MANIFEST_INFO: 'GET_MANIFEST_INFO',
  OPEN_SIDEPANEL: 'OPEN_SIDEPANEL',
} as const

export type BackgroundMessageAction = (typeof backgroundMessageAction)[keyof typeof backgroundMessageAction]

export const backgroundCommand = {
  OPEN_SIDEPANEL: 'open-sidepanel',
} as const

export type BackgroundCommand = (typeof backgroundCommand)[keyof typeof backgroundCommand]

// Base response type for all background message responses
export interface BackgroundResponse<T = unknown> {
  success: true
  data: T
  error?: never
}

export interface BackgroundErrorResponse {
  success: false
  data: null
  error: string
}

export type BackgroundResponseUnion<T = unknown> = BackgroundResponse<T> | BackgroundErrorResponse

// Specific response types for each message action
export type PingBackgroundResponse = BackgroundResponseUnion<{ timestamp: number }>

export interface ActiveTabData extends chrome.tabs.Tab {
  canInject: boolean
}

export type GetActiveTabResponse = BackgroundResponseUnion<ActiveTabData>

export interface ManifestInfoData {
  name: string
  version: string
  description: string
}

export type GetManifestInfoResponse = BackgroundResponseUnion<ManifestInfoData>

export type OpenSidepanelResponse = BackgroundResponseUnion<void>

// Union type for all possible responses
export type BackgroundMessageResponse =
  | PingBackgroundResponse
  | GetActiveTabResponse
  | GetManifestInfoResponse
  | OpenSidepanelResponse

// Type for the sendResponse function
export type SendResponse = (response: BackgroundMessageResponse) => void
