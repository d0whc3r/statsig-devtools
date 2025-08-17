export const contentMessageAction = {
  SET_STORAGE_OVERRIDE: 'SET_STORAGE_OVERRIDE',
  REMOVE_STORAGE_OVERRIDE: 'REMOVE_STORAGE_OVERRIDE',
  GET_STORAGE_VALUE: 'GET_STORAGE_VALUE',
  PING: 'PING',
} as const

export type ContentMessageAction = (typeof contentMessageAction)[keyof typeof contentMessageAction]

export const _storageType = {
  LOCAL_STORAGE: 'localStorage',
  SESSION_STORAGE: 'sessionStorage',
  COOKIE: 'cookie',
} as const

export type StorageType = (typeof _storageType)[keyof typeof _storageType]

export interface StorageOverridePayload {
  type: StorageType
  key: string
  value?: string
  domain?: string
}

export interface GetStoragePayload {
  type: StorageType
  key: string
}

export interface ContentScriptMessage {
  type: ContentMessageAction
  payload?: StorageOverridePayload | GetStoragePayload
}

// Base response type for all content script message responses
export interface ContentResponse<T = unknown> {
  success: true
  data: T
  error?: never
}

export interface ContentErrorResponse {
  success: false
  data: null
  error: string
}

export type ContentResponseUnion<T = unknown> = ContentResponse<T> | ContentErrorResponse

// Specific response types for each message action
export type PingContentResponse = ContentResponseUnion<string>

export interface StorageOverrideResult {
  type: StorageType
  key: string
  value?: string
  applied: boolean
}

export type SetStorageOverrideResponse = ContentResponseUnion<StorageOverrideResult>

export interface StorageRemoveResult {
  type: StorageType
  key: string
  removed: boolean
}

export type RemoveStorageOverrideResponse = ContentResponseUnion<StorageRemoveResult>

export type GetStorageValueResponse = ContentResponseUnion<string | null>

// Union type for all possible responses
export type ContentMessageResponse =
  | PingContentResponse
  | SetStorageOverrideResponse
  | RemoveStorageOverrideResponse
  | GetStorageValueResponse

// Type for the sendResponse function
export type ContentSendResponse = (response: ContentMessageResponse) => void
