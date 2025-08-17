import { z } from 'zod'

import { zDynamicConfigDto } from '../../client/zod.gen'
import { statsigPaginationResponseSchema } from '../common.schema'

const statsigDynamicConfigListResponseSchema = z.array(
  zDynamicConfigDto.pick({
    id: true,
    name: true,
    description: true,
    isEnabled: true,
  }),
)

export const statsigDynamicConfigsResponseSchema = z.object({
  data: statsigDynamicConfigListResponseSchema,
  pagination: statsigPaginationResponseSchema,
})

export const statsigDynamicConfigDetailResponseSchema = zDynamicConfigDto.pick({
  id: true,
  rules: true,
  defaultValue: true,
})

export type StatsigDynamicConfigsResponse = z.infer<typeof statsigDynamicConfigsResponseSchema>
export type StatsigDynamicConfigDetailResponse = z.infer<typeof statsigDynamicConfigDetailResponseSchema>
export type DynamicConfigListItem = z.infer<typeof statsigDynamicConfigListResponseSchema>[0]
