import { z } from 'zod'

import { zExternalGateDto } from '@/src/client/zod.gen'

import { statsigPaginationResponseSchema } from '../common.schema'

const statsigGateListResponseSchema = z.array(
  zExternalGateDto.pick({
    id: true,
    name: true,
    description: true,
    isEnabled: true,
    status: true,
    type: true,
    checksPerHour: true,
  }),
)

export const statsigGatesResponseSchema = z.object({
  data: statsigGateListResponseSchema,
  pagination: statsigPaginationResponseSchema,
})

export type StatsigGatesResponse = z.infer<typeof statsigGatesResponseSchema>
export type GateListItem = z.infer<typeof statsigGateListResponseSchema>[0]
