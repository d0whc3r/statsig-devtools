import { useEffect, useState } from 'react'

import { Card, CardHeader } from '@/src/components/ui/Card/Card'
import { tabCommunication } from '@/src/utils/tab-communication'

import { OverridePanel } from '../Dashboard/OverridePanel'
import { FeatureGateDetails } from './FeatureGateDetails'
import { FeatureGateHeader } from './FeatureGateHeader'

import type { StatsigGate } from '../Dashboard/types'

interface FeatureGateItemProps {
  gate: StatsigGate
  onOverride: (id: string, value: unknown, source: 'browser' | 'api') => void
}

export function FeatureGateItem({ gate, onOverride }: FeatureGateItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showOverride, setShowOverride] = useState(false)
  const [canOverride, setCanOverride] = useState(false)

  useEffect(() => {
    const checkOverrideCapability = async () => {
      const connection = await tabCommunication.checkConnection()
      const isStatsigActive = await tabCommunication.isStatsigActive()
      setCanOverride(connection.isReady && isStatsigActive)
    }

    checkOverrideCapability()
  }, [])

  const handleExpandGate = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <Card className="group border-border/50 transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <FeatureGateHeader
          gate={gate}
          isExpanded={isExpanded}
          showOverride={showOverride}
          canOverride={canOverride}
          onToggleExpand={handleExpandGate}
          onToggleOverride={() => setShowOverride(!showOverride)}
        />
      </CardHeader>

      {/* Override Panel */}
      {showOverride && canOverride && (
        <div className="animate-slide-down border-t">
          <OverridePanel
            type="feature gate"
            targetId={gate.id}
            onOverride={(value) => onOverride(gate.id, value, 'api')}
          />
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && <FeatureGateDetails gate={gate} />}
    </Card>
  )
}
