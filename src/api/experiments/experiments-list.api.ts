import { BaseApiService } from '@/src/api/base/base.api'
import { Experiments } from '@/src/client/sdk.gen'

import { type StatsigExperimentsResponse, statsigExperimentsResponseSchema } from './experiments-list.schema'

import type { StatsigPagination } from '../common.schema'

export class ExperimentsListApi extends BaseApiService {
  constructor() {
    super('ExperimentsListApi')
  }

  async getExperiments({ page = 1, limit = 10 }: StatsigPagination = {}): Promise<StatsigExperimentsResponse> {
    try {
      this.logger.info('Attempting to fetch experiments from API', { page, limit })

      const { data } = await Experiments.getConsoleV1Experiments({
        query: {
          page,
          limit,
        },
      })

      this.logger.info('Received response from experiments API', { hasData: !!data, dataType: typeof data })

      // If data is not an array, try to extract it from the response
      let experimentsData = data?.data ?? []
      if (Array.isArray(experimentsData)) {
        this.logger.info('Extracted experiments data from response wrapper', { count: experimentsData.length })
      } else {
        this.logger.warn('Experiments data is not an array', { dataType: typeof experimentsData })
        experimentsData = []
      }

      const result = statsigExperimentsResponseSchema.safeParse({
        data: experimentsData,
        pagination: {
          itemsPerPage: limit,
          pageNumber: page,
          totalItems: experimentsData.length,
        },
      })

      if (result.success) {
        this.logger.info('Successfully parsed experiments response', { experimentsCount: result.data.data.length })
        return result.data
      }

      this.logger.error('Failed to parse experiments response', { error: result.error })
      this.handleParseError(result.error, 'experiments')
    } catch (error) {
      this.logger.error('Error fetching experiments from API', { error, page, limit })
      this.handleApiError(error, 'fetch experiments from API')
    }

    this.logger.warn('Returning empty experiments response due to error')
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
