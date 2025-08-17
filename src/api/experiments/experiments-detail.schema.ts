import { z } from 'zod'

import { zExternalExperimentDto } from '@/src/client/zod.gen'

const statsigExperimentDetailSchema = zExternalExperimentDto.pick({
  id: true,
  hypothesis: true,
  groups: true,
  controlGroupID: true,
  assignmentSourceFilters: true,
})

export const statsigExperimentDetailResponseSchema = z.object({
  data: statsigExperimentDetailSchema,
})

export type StatsigExperimentDetailResponse = z.infer<typeof statsigExperimentDetailResponseSchema>
