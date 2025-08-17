import { ExperimentItem } from './ExperimentItem'

import type { StatsigExperiment } from '../Dashboard/types'

interface ExperimentsWindowProps {
  experiments: StatsigExperiment[]
  onOverride: (id: string, value: unknown, source: 'browser' | 'api') => void
}

export function ExperimentsWindow({ experiments, onOverride }: ExperimentsWindowProps) {
  return (
    <div className="space-y-2">
      {experiments.map((experiment) => (
        <ExperimentItem key={experiment.name ?? experiment.id} experiment={experiment} onOverride={onOverride} />
      ))}
    </div>
  )
}
