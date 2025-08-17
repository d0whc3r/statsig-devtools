import { Gates } from '../../client/sdk.gen'
import { BaseApiService } from '../base/base.api'
import { statsigGateDetailResponseSchema } from './gates-detail.schema'

import type { StatsigGateDetailResponse } from './gates-detail.schema'

export class GatesDetailApi extends BaseApiService {
  constructor() {
    super('GatesDetailApi')
  }

  async getGatesById(id: string): Promise<StatsigGateDetailResponse | null> {
    try {
      const { data } = await Gates.getConsoleV1GatesById({
        path: { id },
      })

      const result = statsigGateDetailResponseSchema.safeParse(data)
      if (result.success) {
        return result.data
      }

      this.handleParseError(result.error, 'gate detail', { id })
    } catch (error) {
      this.handleApiError(error, 'fetch gate by ID from API', { id })
    }

    return null
  }
}
