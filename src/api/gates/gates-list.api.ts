import { BaseApiService } from '@/src/api/base/base.api'
import { Gates } from '@/src/client/sdk.gen'

import { type StatsigGatesResponse, statsigGatesResponseSchema } from './gates-list.schema'

import type { StatsigPagination } from '../common.schema'

export class GatesListApi extends BaseApiService {
  constructor() {
    super('GatesListApi')
  }

  async getGates({ page = 1, limit = 10 }: StatsigPagination = {}): Promise<StatsigGatesResponse> {
    try {
      this.logger.info('Attempting to fetch gates from API', { page, limit })

      const { data } = await Gates.getConsoleV1Gates({
        query: {
          page,
          limit,
        },
      })

      this.logger.info('Received response from gates API', { hasData: !!data })

      const result = statsigGatesResponseSchema.safeParse(data)
      if (result.success) {
        this.logger.info('Successfully parsed gates response', { gatesCount: result.data.data.length })
        return result.data
      }

      this.logger.error('Failed to parse gates response', { error: result.error })
      this.handleParseError(result.error, 'gates')
    } catch (error) {
      this.logger.error('Error fetching gates from API', { error, page, limit })
      this.handleApiError(error, 'fetch gates from API')
    }

    this.logger.warn('Returning empty gates response due to error')
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
