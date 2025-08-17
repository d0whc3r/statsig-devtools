import { Badge } from '@/src/components/ui/Badge/Badge'

import { StatusBadge } from './StatusBadge'

import type { StatsigExperiment } from './types'

interface ExperimentHeaderProps {
  experiment: StatsigExperiment
}

export function ExperimentHeader({ experiment }: ExperimentHeaderProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Allocation */}
      <div className="flex items-center gap-1">
        <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
        <span className="text-muted-foreground font-mono">{experiment.allocation}%</span>
      </div>

      {/* Status */}
      <StatusBadge status={experiment.status} size="sm" />

      {/* Type indicator */}
      <Badge variant="outline" className="h-5 px-1.5 font-mono text-xs">
        EXP
      </Badge>
    </div>
  )
}
