// Tab communication message actions
export const tabMessageAction = {
  PING: 'PING',
  GET_USER_INFO: 'GET_USER_INFO',
  GET_STATSIG_USER_INFO: 'GET_STATSIG_USER_INFO',
  CHECK_STATSIG_ACTIVE: 'CHECK_STATSIG_ACTIVE',
  SET_STORAGE: 'SET_STORAGE',
  GET_STORAGE: 'GET_STORAGE',
} as const

export type TabMessageAction = (typeof tabMessageAction)[keyof typeof tabMessageAction]

// Storage types
export const storageType = {
  LOCAL_STORAGE: 'localStorage',
  SESSION_STORAGE: 'sessionStorage',
  COOKIE: 'cookie',
} as const

export type StorageType = (typeof storageType)[keyof typeof storageType]

// Payload types for different message actions
export type TabMessagePayload =
  | undefined // For PING, GET_USER_INFO, GET_STATSIG_USER_INFO, CHECK_STATSIG_ACTIVE
  | StorageData // For SET_STORAGE
  | GetStoragePayload // For GET_STORAGE

// Message interfaces
export interface TabMessage {
  type: TabMessageAction
  payload?: TabMessagePayload
}

// Response data types for different message actions
export type TabResponseData =
  | string // For PING
  | StatsigUserInfo // For GET_USER_INFO and GET_STATSIG_USER_INFO
  | boolean // For CHECK_STATSIG_ACTIVE
  | boolean // For SET_STORAGE
  | string
  | null // For GET_STORAGE

// Response interfaces
export interface TabResponse<T = TabResponseData> {
  success: boolean
  data?: T
  error?: string
}

// User information interface
export interface StatsigUserInfo {
  userID?: string
  stableID?: string
}

// Storage interfaces
export interface StorageData {
  key: string
  value: string
  type: StorageType
  domain?: string
  path?: string
  expires?: number
}

export interface GetStoragePayload {
  key: string
  type: StorageType
}

// Connection status interface
export interface ConnectionStatus {
  isReady: boolean
  error?: string
}

// Specific response types with proper typing
export type PingResponse = TabResponse<string>
export type GetUserInfoResponse = TabResponse<StatsigUserInfo>
export type GetStatsigUserInfoResponse = TabResponse<StatsigUserInfo>
export type CheckStatsigActiveResponse = TabResponse<boolean>
export type SetStorageResponse = TabResponse<boolean>
export type GetStorageResponse = TabResponse<string | null>

// Union type for all possible responses
export type TabMessageResponse =
  | PingResponse
  | GetUserInfoResponse
  | GetStatsigUserInfoResponse
  | CheckStatsigActiveResponse
  | SetStorageResponse
  | GetStorageResponse
