import { DynamicConfigs } from '../../client/sdk.gen'
import { BaseApiService } from '../base/base.api'
import {
  type StatsigDynamicConfigDetailResponse,
  statsigDynamicConfigDetailResponseSchema,
} from './dynamic-configs.schema'

export class DynamicConfigsDetailApi extends BaseApiService {
  constructor() {
    super('DynamicConfigsDetailApi')
  }

  async getDynamicConfigById(id: string): Promise<StatsigDynamicConfigDetailResponse | null> {
    try {
      const { data } = await DynamicConfigs.getConsoleV1DynamicConfigsById({
        path: { id },
      })

      const result = statsigDynamicConfigDetailResponseSchema.safeParse(data?.data)
      if (!result.success) {
        this.handleParseError(result.error, 'dynamic config detail', { id })
        return null
      }

      return result.data
    } catch (error) {
      this.handleApiError(error, 'fetch dynamic config by ID from API', { id })
      return null
    }
  }
}
