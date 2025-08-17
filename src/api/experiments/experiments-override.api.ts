import { BaseApiService } from '@/src/api/base/base.api'
import { type OverrideUser } from '@/src/api/common.schema'
import { Experiments } from '@/src/client/sdk.gen'

import {
  type StatsigExperimentOverridesResponse,
  statsigExperimentOverridesResponseSchema,
} from './experiments-override.schema'

import type { ExperimentOverridesDto } from '@/src/client/types.gen'

type ExperimentOverrideParams = OverrideUser & {
  groupId: string
  environment?: string
}

type ExperimentOverrideRemoveParams = OverrideUser & {
  environment?: string
}

export class ExperimentsOverrideApi extends BaseApiService {
  constructor() {
    super('ExperimentsOverrideApi')
  }

  async getExperimentOverrides(experimentId: string): Promise<StatsigExperimentOverridesResponse | null> {
    try {
      const { data } = await Experiments.getConsoleV1ExperimentsByIdOverrides({
        path: { id: experimentId },
      })

      const result = statsigExperimentOverridesResponseSchema.safeParse(data)
      if (result.success) {
        return result.data
      }

      this.handleParseError(result.error, 'experiment overrides', { id: experimentId })
    } catch (error) {
      this.handleApiError(error, 'fetch experiment overrides from API', { id: experimentId })
    }

    return null
  }

  async createExperimentOverride(experimentId: string, params: ExperimentOverrideParams): Promise<boolean> {
    try {
      let unitType: 'userID' | 'customID' = 'userID'
      let id = ''

      if ('userID' in params) {
        unitType = 'userID'
        id = params.userID
      } else {
        unitType = 'customID'
        id = params.customID
      }

      await Experiments.patchConsoleV1ExperimentsByIdOverrides({
        path: { id: experimentId },
        body: {
          overrides: [],
          userIDOverrides: [
            {
              groupID: params.groupId,
              ids: [id],
              unitType,
              environment: params.environment ?? null,
            },
          ],
        },
      })

      return true
    } catch (error) {
      this.handleApiError(error, 'create experiment override', { experimentId, params })
    }

    return false
  }

  private isUserInOverrides(overrides: ExperimentOverridesDto, userID: string, environment?: string) {
    return overrides.userIDOverrides.some(
      (override) => override.ids.includes(userID) && (!environment || environment === override.environment),
    )
  }

  async removeExperimentOverride(experimentId: string, params: ExperimentOverrideRemoveParams): Promise<boolean> {
    try {
      // First get current overrides
      const { data } = await Experiments.getConsoleV1ExperimentsByIdOverrides({
        path: { id: experimentId },
      })
      let currentOverrides: ExperimentOverridesDto | undefined = data?.data
      if (!currentOverrides) {
        this.logger.warn('No current overrides found for experiment', { experimentId })
        return true
      }

      let unitType: 'userID' | 'customID' = 'userID'
      let id = ''

      if ('userID' in params) {
        unitType = 'userID'
        id = params.userID
      } else {
        unitType = 'customID'
        id = params.customID
      }

      if (!this.isUserInOverrides(currentOverrides, id, params.environment)) {
        this.logger.warn('User not found in current overrides for the specified environment', {
          experimentId,
          id,
          unitType,
          environment: params.environment,
        })
        return true
      }

      // Remove the user from the appropriate override
      currentOverrides = {
        ...currentOverrides,
        userIDOverrides: currentOverrides.userIDOverrides
          .map((override) => {
            if (
              override.unitType === unitType &&
              override.ids.includes(id) &&
              (!params.environment || params.environment === override.environment)
            ) {
              return {
                ...override,
                ids: override.ids.filter((overrideId) => overrideId !== id),
              }
            }
            return override
          })
          .filter((override) => override.ids.length > 0), // Remove empty overrides
      }

      await Experiments.postConsoleV1ExperimentsByIdOverrides({
        path: { id: experimentId },
        body: currentOverrides,
      })

      return true
    } catch (error) {
      this.handleApiError(error, 'remove experiment override', { experimentId, params })
    }

    return false
  }
}
