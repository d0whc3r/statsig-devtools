import { Eye, EyeOff, Settings } from 'lucide-react'

import { Button } from '@/src/components/ui/Button/Button'
import { CardDescription, CardTitle } from '@/src/components/ui/Card/Card'

import { StatusBadge } from '../Dashboard/StatusBadge'

import type { StatsigGate } from '../Dashboard/types'

interface FeatureGateHeaderProps {
  gate: StatsigGate
  isExpanded: boolean
  showOverride: boolean
  canOverride: boolean
  onToggleExpand: () => void
  onToggleOverride: () => void
}

export function FeatureGateHeader({
  gate,
  isExpanded,
  showOverride,
  canOverride,
  onToggleExpand,
  onToggleOverride,
}: FeatureGateHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <CardTitle className="text-base font-semibold">{gate.name}</CardTitle>
        {gate.description && (
          <CardDescription className="text-muted-foreground text-sm">{gate.description}</CardDescription>
        )}
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={gate.isEnabled ? 'active' : 'inactive'} />
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleOverride}
          className="h-7 px-2 text-xs"
          disabled={!canOverride}
          title={!canOverride ? 'Script not injected or Statsig not detected on current tab' : 'Create API override'}
        >
          <Settings className="mr-1 h-3 w-3" />
          Override
        </Button>
        <Button variant="ghost" size="sm" onClick={onToggleExpand}>
          {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
