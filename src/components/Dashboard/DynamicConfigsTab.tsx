import { Settings } from 'lucide-react'

import { Badge } from '@/src/components/ui/Badge/Badge'

import { DynamicConfigsWindow } from '../DynamicConfigs/DynamicConfigsWindow'

import type { StatsigDynamicConfig } from './types'

interface DynamicConfigsTabProps {
  configs: StatsigDynamicConfig[]
  onOverride: (id: string, value: unknown, source: 'browser' | 'api') => void
}

export function DynamicConfigsTab({ configs, onOverride }: DynamicConfigsTabProps) {
  // Filter out sidecar_dynamic_config as it's internal to Statsig extension
  const filteredConfigs = configs.filter(
    (config) => config.name !== 'sidecar_dynamic_config' && config.id !== 'sidecar_dynamic_config',
  )

  return (
    <div className="space-y-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10">
            <Settings className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-card-foreground text-lg font-semibold">Dynamic Configs</h3>
            <p className="text-muted-foreground text-sm">Manage dynamic configuration values and parameters</p>
          </div>
        </div>
        <Badge variant="secondary" className="border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300">
          {filteredConfigs.length} configs
        </Badge>
      </div>

      <DynamicConfigsWindow configs={filteredConfigs} onOverride={onOverride} />
    </div>
  )
}
