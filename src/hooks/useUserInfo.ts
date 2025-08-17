import { useCallback, useEffect, useState } from 'react'

import { useAuthStore } from '@/src/stores/auth.store'
import { Logger } from '@/src/utils/logger'

const logger = new Logger('useUserInfo')

export interface UserInfo {
  userID?: string
  stableID?: string
  displayName: string
  isAuthenticated: boolean
}

export function useUserInfo() {
  const { user, isAuthenticated, consoleApiKey } = useAuthStore()
  const [userInfo, setUserInfo] = useState<UserInfo>({
    displayName: 'Not authenticated',
    isAuthenticated: false,
  })

  const getCurrentUserIdentifier = useCallback(() => user?.userID || user?.stableID || null, [user])

  const getUserDisplayName = useCallback(() => {
    if (!isAuthenticated) return 'Not authenticated'

    const identifier = getCurrentUserIdentifier()
    if (!identifier) return 'User ID not set'

    return identifier.length > 20 ? `${identifier.substring(0, 20)}...` : identifier
  }, [isAuthenticated, getCurrentUserIdentifier])

  const setUserIdentifier = useCallback(
    (identifier: string, type: 'userID' | 'stableID') => {
      if (!isAuthenticated) {
        logger.warn('Cannot set user identifier when not authenticated')
        return false
      }

      try {
        // Update the auth store with the new user info
        useAuthStore.getState().setUser({
          [type === 'userID' ? 'userId' : 'stableId']: identifier,
        } as any)

        logger.info(`Set user ${type} to:`, identifier)
        return true
      } catch (error) {
        logger.error('Error setting user identifier:', error)
        return false
      }
    },
    [isAuthenticated],
  )

  const clearUserIdentifier = useCallback(() => {
    if (!isAuthenticated) {
      logger.warn('Cannot clear user identifier when not authenticated')
      return false
    }

    try {
      useAuthStore.getState().setUser(null)
      logger.info('Cleared user identifier')
      return true
    } catch (error) {
      logger.error('Error clearing user identifier:', error)
      return false
    }
  }, [isAuthenticated])

  // Update user info when authentication state changes
  useEffect(() => {
    const displayName = getUserDisplayName()
    const newUserInfo: UserInfo = {
      displayName,
      isAuthenticated,
    }

    if (user?.userID) {
      newUserInfo.userID = user.userID
    }
    if (user?.stableID) {
      newUserInfo.stableID = user.stableID
    }

    setUserInfo(newUserInfo)
  }, [user, isAuthenticated, getUserDisplayName])

  return {
    // User information
    userInfo,
    currentUserIdentifier: getCurrentUserIdentifier(),
    displayName: getUserDisplayName(),

    // Authentication state
    isAuthenticated,
    hasApiKey: !!consoleApiKey,

    // Actions
    setUserIdentifier,
    clearUserIdentifier,
    getCurrentUserIdentifier,

    // Utilities
    isValidUserIdentifier: (identifier: string) => identifier && identifier.trim().length > 0,

    getUserType: () => {
      if (!user) return null
      return user.userID ? 'userID' : 'stableID'
    },
  }
}
