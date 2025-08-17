import { Flag, FlaskConical, Settings } from 'lucide-react'
import * as React from 'react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/Select/Select'
import { cn } from '@/src/utils/cn'

export type ConfigurationType = 'feature-gates' | 'experiments' | 'dynamic-configs'

interface ConfigurationTypeSelectProps {
  value: ConfigurationType
  onValueChange: (value: ConfigurationType) => void
  className?: string
}

const configurationTypes = [
  {
    value: 'feature-gates' as const,
    label: 'Feature Gates',
    icon: Flag,
  },
  {
    value: 'experiments' as const,
    label: 'Experiments',
    icon: FlaskConical,
  },
  {
    value: 'dynamic-configs' as const,
    label: 'Dynamic Configs',
    icon: Settings,
  },
]

export function ConfigurationTypeSelect({ value, onValueChange, className }: ConfigurationTypeSelectProps) {
  const selectedType = configurationTypes.find((type) => type.value === value)

  return (
    <Select<ConfigurationType> value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn('w-full max-w-[200px]', className)}>
        <SelectValue>
          {selectedType && (
            <div className="flex items-center gap-2">
              <selectedType.icon className="h-4 w-4" />
              <span>{selectedType.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {configurationTypes.map((type) => (
          <SelectItem<ConfigurationType> key={type.value} value={type.value}>
            <div className="flex items-center gap-2">
              <type.icon className="h-4 w-4" />
              <span>{type.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
