import { z } from 'zod'

import { zEnvironmentsContractDto } from '@/src/client/zod.gen'

export const statsigEnvironmentsListResponseSchema = zEnvironmentsContractDto.pick({
  environments: true,
})

export const statsigEnvironmentsResponseSchema = z.object({
  data: statsigEnvironmentsListResponseSchema,
})

export type StatsigEnvironmentsResponse = z.infer<typeof statsigEnvironmentsResponseSchema>
