import { BaseApiService } from '@/src/api/base/base.api'
import { DynamicConfigs } from '@/src/client/sdk.gen'

import { type StatsigDynamicConfigsResponse, statsigDynamicConfigsResponseSchema } from './dynamic-configs.schema'

import type { StatsigPagination } from '../common.schema'

export class DynamicConfigsListApi extends BaseApiService {
  constructor() {
    super('DynamicConfigsListApi')
  }

  async getDynamicConfigs({ page = 1, limit = 10 }: StatsigPagination = {}): Promise<StatsigDynamicConfigsResponse> {
    try {
      const { data } = await DynamicConfigs.getConsoleV1DynamicConfigs({
        query: {
          page,
          limit,
        },
      })
      const result = statsigDynamicConfigsResponseSchema.safeParse(data)
      if (result.success) {
        return result.data
      }

      this.handleParseError(result.error, 'dynamic configs')
    } catch (error) {
      this.handleApiError(error, 'fetch dynamic configs from API')
    }

    return {
      data: [],
      pagination: {
        itemsPerPage: limit,
        pageNumber: page,
        totalItems: 0,
      },
    }
  }
}
