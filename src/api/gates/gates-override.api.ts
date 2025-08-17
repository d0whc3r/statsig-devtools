import { BaseApiService } from '@/src/api/base/base.api'
import { type OverrideUser } from '@/src/api/common.schema'
import { Gates } from '@/src/client/sdk.gen'

import { statsigGateOverridesResponseSchema } from './gates-override.schema'

import type { StatsigGateOverridesResponse } from './gates-override.schema'
import type { OverrideDto, UpdateOverridesContractDto } from '@/src/client/types.gen'

type GateOverrideParams = OverrideUser & {
  value: boolean
}

export class GatesOverrideApi extends BaseApiService {
  constructor() {
    super('GatesOverrideApi')
  }

  async getGateOverrides(gateId: string): Promise<StatsigGateOverridesResponse | null> {
    try {
      const { data } = await Gates.getConsoleV1GatesByIdOverrides({
        path: { id: gateId },
      })

      const result = statsigGateOverridesResponseSchema.safeParse(data)
      if (result.success) {
        return result.data
      }

      this.handleParseError(result.error, 'gate overrides', { gateId })
    } catch (error) {
      this.handleApiError(error, 'fetch gate overrides from API', { gateId })
    }

    return null
  }

  async createGateOverride(gateId: string, params: GateOverrideParams): Promise<boolean> {
    try {
      const { value } = params

      let body: UpdateOverridesContractDto = {
        passingUserIDs: [],
        failingUserIDs: [],
      }

      if ('userID' in params) {
        body = {
          ...body,
          ...(value
            ? { passingUserIDs: [params.userID], failingUserIDs: [] }
            : { passingUserIDs: [], failingUserIDs: [params.userID] }),
        }
      } else {
        body = {
          ...body,
          ...(value
            ? { passingCustomIDs: [params.customID], failingCustomIDs: [] }
            : { passingCustomIDs: [], failingCustomIDs: [params.customID] }),
        }
      }

      await Gates.patchConsoleV1GatesByIdOverrides({
        path: { id: gateId },
        body,
      })
      return true
    } catch (error) {
      this.handleApiError(error, 'create gate override', { gateId, params })
      return false
    }
  }

  private isUserInOverrides(overrides: OverrideDto, userID: string): boolean {
    return (
      overrides.passingUserIDs?.includes(userID) ??
      overrides.failingUserIDs?.includes(userID) ??
      overrides.passingCustomIDs?.includes(userID) ??
      overrides.failingCustomIDs?.includes(userID)
    )
  }

  async removeGateOverride(gateId: string, params: OverrideUser): Promise<boolean> {
    try {
      // First get current overrides
      const { data } = await Gates.getConsoleV1GatesByIdOverrides({
        path: { id: gateId },
      })

      let currentOverrides: OverrideDto | undefined = data?.data
      if (!currentOverrides || !this.isUserInOverrides(currentOverrides, params.userID ?? params.customID)) {
        this.logger.warn('No current overrides found for gate', { gateId })
        return true
      }

      if ('userID' in params) {
        const { userID } = params
        currentOverrides = {
          ...currentOverrides,
          passingUserIDs: currentOverrides.passingUserIDs.filter((id) => id !== userID),
          failingUserIDs: currentOverrides.failingUserIDs.filter((id) => id !== userID),
        }
      } else {
        const { customID } = params
        currentOverrides = {
          ...currentOverrides,
          passingCustomIDs: currentOverrides.passingCustomIDs?.filter((id) => id !== customID) ?? [],
          failingCustomIDs: currentOverrides.failingCustomIDs?.filter((id) => id !== customID) ?? [],
        }
      }

      await Gates.postConsoleV1GatesByIdOverrides({
        path: { id: gateId },
        body: currentOverrides,
      })
      return true
    } catch (error) {
      this.handleApiError(error, 'remove gate override', { gateId, params })
    }

    return false
  }
}
