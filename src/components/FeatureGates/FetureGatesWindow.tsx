import { FeatureGateItem } from './FeatureGateItem'

import type { StatsigGate } from '../Dashboard/types'

interface FeatureGatesWindowProps {
  gates: StatsigGate[]
  onOverride: (id: string, value: unknown, source: 'browser' | 'api') => void
}

export function FeatureGatesWindow({ gates, onOverride }: FeatureGatesWindowProps) {
  return (
    <div className="space-y-3">
      {gates.map((gate) => (
        <FeatureGateItem key={gate.name ?? gate.id} gate={gate} onOverride={onOverride} />
      ))}
    </div>
  )
}
