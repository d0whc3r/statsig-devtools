import { z } from 'zod'

import { zExternalGateDto } from '@/src/client/zod.gen'

const statsigGateDetailSchema = zExternalGateDto.pick({
  id: true,
  rules: true,
})

export const statsigGateDetailResponseSchema = z.object({
  data: statsigGateDetailSchema,
})

export type StatsigGateDetailResponse = z.infer<typeof statsigGateDetailResponseSchema>
