import { BaseApiService } from '@/src/api/base/base.api'
import { Experiments } from '@/src/client/sdk.gen'

import {
  type StatsigExperimentDetailResponse,
  statsigExperimentDetailResponseSchema,
} from './experiments-detail.schema'

export class ExperimentsDetailApi extends BaseApiService {
  constructor() {
    super('ExperimentsDetailApi')
  }

  async getExperimentById(id: string): Promise<StatsigExperimentDetailResponse | null> {
    try {
      const { data } = await Experiments.getConsoleV1ExperimentsById({
        path: { id },
      })

      const result = statsigExperimentDetailResponseSchema.safeParse(data)
      if (result.success) {
        return result.data
      }

      this.handleParseError(result.error, 'experiment detail', { id })
    } catch (error) {
      this.handleApiError(error, 'fetch experiment by ID from API', { id })
    }

    return null
  }
}
