import { CardContent } from '@/src/components/ui/Card/Card'

import { FeatureGateBasicInfo } from './FeatureGateBasicInfo'
import { FeatureGateRules } from './FeatureGateRules'

import type { StatsigGate } from '../Dashboard/types'

interface FeatureGateDetailsProps {
  gate: StatsigGate
}

export function FeatureGateDetails({ gate }: FeatureGateDetailsProps) {
  return (
    <div className="animate-slide-down">
      <CardContent className="pt-0">
        <div className="space-y-6">
          <FeatureGateBasicInfo gate={gate} />
          <FeatureGateRules gateId={gate.id} />
        </div>
      </CardContent>
    </div>
  )
}
