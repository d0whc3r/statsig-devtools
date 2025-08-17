import { DynamicConfigItem } from './DynamicConfigItem'

import type { StatsigDynamicConfig } from '../Dashboard/types'

interface DynamicConfigsWindowProps {
  configs: StatsigDynamicConfig[]
  onOverride: (id: string, value: unknown, source: 'browser' | 'api') => void
}

export function DynamicConfigsWindow({ configs, onOverride }: DynamicConfigsWindowProps) {
  // Filter out sidecar_dynamic_config as it's internal to Statsig extension
  const filteredConfigs = configs.filter(
    (config) => config.name !== 'sidecar_dynamic_config' && config.id !== 'sidecar_dynamic_config',
  )

  return (
    <div className="space-y-3">
      {filteredConfigs.map((config) => (
        <DynamicConfigItem key={config.name ?? config.id} config={config} onOverride={onOverride} />
      ))}
    </div>
  )
}
