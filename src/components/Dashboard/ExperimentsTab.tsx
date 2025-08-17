import { FlaskConical } from 'lucide-react'

import { Badge } from '@/src/components/ui/Badge/Badge'

import { ExperimentsWindow } from '../Experiments/ExperimentsWindow'

import type { StatsigExperiment } from './types'

interface ExperimentsTabProps {
  experiments: StatsigExperiment[]
  onOverride: (id: string, value: unknown, source: 'browser' | 'api') => void
}

export function ExperimentsTab({ experiments, onOverride }: ExperimentsTabProps) {
  return (
    <div className="space-y-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10">
            <FlaskConical className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <h3 className="text-card-foreground text-base font-semibold">Experiments</h3>
            <p className="text-muted-foreground text-xs">A/B tests and experiment configurations</p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="h-5 border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-300"
        >
          {experiments.length}
        </Badge>
      </div>

      <ExperimentsWindow experiments={experiments} onOverride={onOverride} />
    </div>
  )
}
