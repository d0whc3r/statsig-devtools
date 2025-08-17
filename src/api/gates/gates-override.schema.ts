import { z } from 'zod'

import { zOverrideDto } from '@/src/client/zod.gen'

const statsigGateOverrideSchema = zOverrideDto.pick({
  passingUserIDs: true,
  failingUserIDs: true,
  passingCustomIDs: true,
  failingCustomIDs: true,
})

export const statsigGateOverridesResponseSchema = z.object({
  data: statsigGateOverrideSchema,
})

export type StatsigGateOverridesResponse = z.infer<typeof statsigGateOverridesResponseSchema>
