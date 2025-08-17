import { useCallback, useState } from 'react'

import { StatsigApi } from '@/src/api/statsig.api'
import { useApiOverrideStore } from '@/src/stores/api-override-store'
import { useAuthStore } from '@/src/stores/auth.store'
import { Logger } from '@/src/utils/logger'

const logger = new Logger('useApiOverrides')

export function useApiOverrides() {
  const { consoleApiKey, user } = useAuthStore()
  const { overrides, addOverride, removeOverride } = useApiOverrideStore()
  const [isApplyingOverride, setIsApplyingOverride] = useState(false)
  const [isRemovingOverride, setIsRemovingOverride] = useState(false)

  const statsigApi = StatsigApi.getInstance()

  const getCurrentUserIdentifier = useCallback(() => user?.userID ?? user?.stableID ?? null, [user])

  const hasOverride = useCallback(
    (targetId: string, type: 'gate' | 'experiment' | 'dynamicConfig') => {
      const userIdentifier = getCurrentUserIdentifier()
      if (!userIdentifier) return false

      return overrides.some(
        (o) =>
          o.type === type && o.targetId === targetId && (o.userId === userIdentifier || o.stableId === userIdentifier),
      )
    },
    [overrides, getCurrentUserIdentifier],
  )

  const getOverrideValue = useCallback(
    (targetId: string, type: 'gate' | 'experiment' | 'dynamicConfig') => {
      const userIdentifier = getCurrentUserIdentifier()
      if (!userIdentifier) return null

      const override = overrides.find(
        (o) =>
          o.type === type && o.targetId === targetId && (o.userId === userIdentifier || o.stableId === userIdentifier),
      )

      return override?.value ?? null
    },
    [overrides, getCurrentUserIdentifier],
  )

  const applyGateOverride = useCallback(
    async (gateId: string, gateName: string, value: boolean, userId?: string) => {
      if (!consoleApiKey || !userId) {
        logger.error('Missing API key or user identifier for gate override')
        return false
      }

      setIsApplyingOverride(true)
      try {
        const success = await statsigApi.createGateOverride(gateId, {
          userID: userId,
          value,
        })

        if (success) {
          addOverride({
            type: 'gate',
            targetId: gateId,
            targetName: gateName,
            value,
            userId,
          })

          logger.info(`Successfully applied gate override for ${gateName}`, { gateId, value, user: userId })
          return true
        } else {
          logger.error(`Failed to apply gate override for ${gateName}`)
          return false
        }
      } catch (error) {
        logger.error('Error applying gate override:', error)
        return false
      } finally {
        setIsApplyingOverride(false)
      }
    },
    [consoleApiKey, addOverride, statsigApi],
  )

  const removeGateOverride = useCallback(
    async (gateId: string, gateName: string, userId?: string) => {
      if (!consoleApiKey || !userId) {
        logger.error('Missing API key or user identifier for removing gate override')
        return false
      }

      setIsRemovingOverride(true)
      try {
        const success = await statsigApi.removeGateOverride(gateId, {
          userID: userId,
        })

        if (success) {
          // Remove from local state
          const overrideToRemove = overrides.find(
            (o) => o.type === 'gate' && o.targetId === gateId && o.userId === userId,
          )

          if (overrideToRemove) {
            removeOverride(overrideToRemove.id)
          }

          logger.info(`Successfully removed gate override for ${gateName}`, { gateId, user: userId })
          return true
        } else {
          logger.error(`Failed to remove gate override for ${gateName}`)
          return false
        }
      } catch (error) {
        logger.error('Error removing gate override:', error)
        return false
      } finally {
        setIsRemovingOverride(false)
      }
    },
    [consoleApiKey, overrides, removeOverride, statsigApi],
  )

  const applyExperimentOverride = useCallback(
    async (experimentId: string, experimentName: string, groupId: string, userId?: string) => {
      if (!consoleApiKey || !userId) {
        logger.error('Missing API key or user identifier for experiment override')
        return false
      }

      setIsApplyingOverride(true)
      try {
        const success = await statsigApi.createExperimentOverride(experimentId, {
          userID: userId,
          groupId,
        })

        if (success) {
          addOverride({
            type: 'experiment',
            targetId: experimentId,
            targetName: experimentName,
            value: groupId,
            userId,
          })

          logger.info(`Successfully applied experiment override for ${experimentName}`, {
            experimentId,
            groupId,
            user: userId,
          })
          return true
        } else {
          logger.error(`Failed to apply experiment override for ${experimentName}`)
          return false
        }
      } catch (error) {
        logger.error('Error applying experiment override:', error)
        return false
      } finally {
        setIsApplyingOverride(false)
      }
    },
    [consoleApiKey, addOverride, statsigApi],
  )

  const removeExperimentOverride = useCallback(
    async (experimentId: string, experimentName: string, userId?: string) => {
      if (!consoleApiKey || !userId) {
        logger.error('Missing API key or user identifier for removing experiment override')
        return false
      }

      setIsRemovingOverride(true)
      try {
        const success = await statsigApi.removeExperimentOverride(experimentId, {
          userID: userId,
        })

        if (success) {
          // Remove from local state
          const overrideToRemove = overrides.find(
            (o) => o.type === 'experiment' && o.targetId === experimentId && o.userId === userId,
          )

          if (overrideToRemove) {
            removeOverride(overrideToRemove.id)
          }

          logger.info(`Successfully removed experiment override for ${experimentName}`, {
            experimentId,
            user: userId,
          })
          return true
        } else {
          logger.error(`Failed to remove experiment override for ${experimentName}`)
          return false
        }
      } catch (error) {
        logger.error('Error removing experiment override:', error)
        return false
      } finally {
        setIsRemovingOverride(false)
      }
    },
    [consoleApiKey, overrides, removeOverride, statsigApi],
  )

  return {
    // Actions
    applyGateOverride,
    removeGateOverride,
    applyExperimentOverride,
    removeExperimentOverride,

    // State
    overrides,
    isApplyingOverride,
    isRemovingOverride,

    // Utilities
    getCurrentUserIdentifier,
    hasOverride,
    getOverrideValue,

    // Check if user is authenticated
    isAuthenticated: !!consoleApiKey,
  }
}
