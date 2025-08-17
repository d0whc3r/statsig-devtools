import { z } from 'zod'

import { zExperimentOverridesDto } from '@/src/client/zod.gen'

const statsigExperimentOverrideSchema = zExperimentOverridesDto.pick({
  overrides: true,
  userIDOverrides: true,
})

export const statsigExperimentOverridesResponseSchema = z.object({
  data: statsigExperimentOverrideSchema,
})

export type StatsigExperimentOverridesResponse = z.infer<typeof statsigExperimentOverridesResponseSchema>
