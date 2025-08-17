import { z } from 'zod'

import { zDynamicConfigDto } from '@/src/client/zod.gen'

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

export type StatsigDynamicConfigsResponse = z.infer<typeof statsigDynamicConfigsResponseSchema>
