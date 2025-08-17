import { z } from 'zod'

import { zExternalExperimentDto } from '@/src/client/zod.gen'

import { statsigPaginationResponseSchema } from '../common.schema'

const statsigExperimentListResponseSchema = z.array(
  zExternalExperimentDto.pick({
    id: true,
    name: true,
    description: true,
    allocation: true,
    status: true,
    startTime: true,
    endTime: true,
  }),
)

export const statsigExperimentsResponseSchema = z.object({
  data: statsigExperimentListResponseSchema,
  pagination: statsigPaginationResponseSchema,
})

export type StatsigExperimentsResponse = z.infer<typeof statsigExperimentsResponseSchema>
export type ExperimentListItem = z.infer<typeof statsigExperimentListResponseSchema>[0]
