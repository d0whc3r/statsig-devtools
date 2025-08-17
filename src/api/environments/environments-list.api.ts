import { BaseApiService } from '@/src/api/base/base.api'
import { Environments } from '@/src/client/sdk.gen'

import { type StatsigEnvironmentsResponse, statsigEnvironmentsResponseSchema } from './environments-list.schema'

export class EnvironmentsListApi extends BaseApiService {
  constructor() {
    super('EnvironmentsListApi')
  }

  async getEnvironments(): Promise<StatsigEnvironmentsResponse> {
    try {
      const { data } = await Environments.getConsoleV1Environments()

      const result = statsigEnvironmentsResponseSchema.safeParse(data)
      if (result.success) {
        return result.data
      }

      this.handleParseError(result.error, 'environments')
    } catch (error) {
      this.handleApiError(error, 'fetch environments from API')
    }

    return {
      data: {
        environments: [],
      },
    }
  }
}
