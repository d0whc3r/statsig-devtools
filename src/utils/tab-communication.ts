import {
  type CheckStatsigActiveResponse,
  type ConnectionStatus,
  type GetStatsigUserInfoResponse,
  type GetStoragePayload,
  type GetStorageResponse,
  type GetUserInfoResponse,
  type PingResponse,
  type SetStorageResponse,
  type StatsigUserInfo,
  type StorageData,
  type StorageType,
  type TabMessage,
  tabMessageAction,
  type TabResponse,
} from '@/src/types/tab-communication.types'

import { Logger } from './logger'

import type { TabInfo } from '../stores/dashboard-store'

const logger = new Logger('TAB_COMMUNICATION')

export class TabCommunicationService {
  private static instance: TabCommunicationService | undefined
  private activeTabId: number | null = null

  static getInstance(): TabCommunicationService {
    TabCommunicationService.instance ??= new TabCommunicationService()
    return TabCommunicationService.instance
  }

  async getActiveTab(): Promise<TabInfo | null> {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tabs.length) return null

      const tab = tabs[0]
      if (!tab?.id || !tab.url) return null

      this.activeTabId = tab.id

      return {
        id: tab.id,
        url: tab.url,
        domain: new URL(tab.url).hostname,
        title: tab.title ?? 'Unknown',
      }
    } catch (error) {
      logger.error('Error getting active tab:', error)
      return null
    }
  }

  async checkConnection(): Promise<ConnectionStatus> {
    try {
      if (!this.activeTabId) {
        const activeTab = await this.getActiveTab()
        if (!activeTab) {
          return { isReady: false, error: 'No active tab found' }
        }
      }

      const response = await this.sendMessage<PingResponse>({
        type: tabMessageAction.PING,
      })

      const result: ConnectionStatus = {
        isReady: response.success,
      }
      if (!response.success && response.error) {
        result.error = response.error
      }
      return result
    } catch (error) {
      return {
        isReady: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async getUserInfo(): Promise<StatsigUserInfo | null> {
    try {
      const response = await this.sendMessage<GetUserInfoResponse>({
        type: tabMessageAction.GET_USER_INFO,
      })

      if (response.success && response.data) {
        return response.data
      }

      return null
    } catch (error) {
      logger.error('Error getting user info:', error)
      return null
    }
  }

  async getStatsigUserInfo(): Promise<StatsigUserInfo | null> {
    try {
      const response = await this.sendMessage<GetStatsigUserInfoResponse>({
        type: tabMessageAction.GET_STATSIG_USER_INFO,
      })

      if (response.success && response.data) {
        return response.data
      }

      return null
    } catch (error) {
      logger.error('Error getting Statsig user info:', error)
      return null
    }
  }

  async isStatsigActive(): Promise<boolean> {
    try {
      const response = await this.sendMessage<CheckStatsigActiveResponse>({
        type: tabMessageAction.CHECK_STATSIG_ACTIVE,
      })

      return response.success && response.data === true
    } catch (error) {
      logger.error('Error checking if Statsig is active:', error)
      return false
    }
  }

  async setStorage(data: StorageData): Promise<boolean> {
    try {
      const response = await this.sendMessage<SetStorageResponse>({
        type: tabMessageAction.SET_STORAGE,
        payload: data,
      })

      return response.success
    } catch (error) {
      logger.error('Error setting storage:', error)
      return false
    }
  }

  async getStorage(key: string, type: StorageType): Promise<string | null> {
    try {
      const payload: GetStoragePayload = { key, type }
      const response = await this.sendMessage<GetStorageResponse>({
        type: tabMessageAction.GET_STORAGE,
        payload,
      })

      if (response.success && response.data !== undefined) {
        return response.data
      }

      return null
    } catch (error) {
      logger.error('Error getting storage:', error)
      return null
    }
  }

  async injectScript(): Promise<boolean> {
    try {
      if (!this.activeTabId) {
        const activeTab = await this.getActiveTab()
        if (!activeTab) return false
      }

      await chrome.scripting.executeScript({
        target: { tabId: this.activeTabId! },
        files: ['content.js'],
      })

      return true
    } catch (error) {
      logger.error('Error injecting script:', error)
      return false
    }
  }

  private async sendMessage<T = TabResponse>(message: TabMessage): Promise<T> {
    if (!this.activeTabId) {
      throw new Error('No active tab ID')
    }

    try {
      const response = await chrome.tabs.sendMessage(this.activeTabId, message)
      return response as T
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      } as T
    }
  }
}

export const tabCommunication = TabCommunicationService.getInstance()
