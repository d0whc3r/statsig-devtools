import { zPaginationResponseMetadataDto } from '../client/zod.gen'

import type { z } from 'zod'

export const statsigPaginationResponseSchema = zPaginationResponseMetadataDto.pick({
  itemsPerPage: true,
  pageNumber: true,
  totalItems: true,
})

export type StatsigPaginationResponse = z.infer<typeof statsigPaginationResponseSchema>

export interface StatsigPagination {
  page?: number
  limit?: number
}

export type OverrideUser =
  | {
      userID: string
      customID?: never
    }
  | {
      customID: string
      userID?: never
    }
