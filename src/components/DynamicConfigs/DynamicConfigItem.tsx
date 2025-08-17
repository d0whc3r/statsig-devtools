import { Eye, EyeOff, Settings } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/src/components/ui/Badge/Badge'
import { Button } from '@/src/components/ui/Button/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card/Card'
import { Label } from '@/src/components/ui/Label/Label'

import { StatusBadge } from '../Dashboard/StatusBadge'

import type { StatsigDynamicConfig } from '../Dashboard/types'

interface DynamicConfigItemProps {
  config: StatsigDynamicConfig
  onOverride: (id: string, value: unknown, source: 'browser' | 'api') => void
}

export function DynamicConfigItem({ config }: DynamicConfigItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <Card className="group border-border/50 transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 transition-all group-hover:from-green-500/30 group-hover:to-green-600/20">
              <Settings className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{config.name}</CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                {config.description || 'No description available'}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={config.isEnabled ? 'active' : 'inactive'} />
            <Badge
              variant="secondary"
              className="h-5 border-amber-200 bg-amber-50 px-2 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
            >
              Read-only
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleToggleExpanded}>
              {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <div className="animate-slide-down">
          <CardContent className="pt-0">
            <div className="space-y-6">
              {/* Compact Basic Info */}
              <div className="bg-muted/20 border-border/30 flex flex-wrap items-center gap-4 rounded-lg border p-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${config.isEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span
                    className={`font-mono font-semibold ${config.isEnabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {config.isEnabled ? 'enabled' : 'disabled'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">ID:</span>
                  <span className="max-w-24 truncate font-mono font-semibold" title={config.id}>
                    {config.id}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="font-mono font-semibold">config</span>
                  <span className="text-muted-foreground">(dynamic)</span>
                </div>
              </div>

              {/* Compact Configuration Details */}
              {config.description && (
                <div className="bg-muted/10 rounded-lg border p-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <div>
                      <Label className="text-xs font-semibold">Description</Label>
                      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{config.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Read-only notice */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <Label className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    Read-only Configuration
                  </Label>
                </div>
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  Dynamic configs are read-only and cannot be overridden. Use this view to inspect configuration values
                  and targeting rules.
                </p>
              </div>
            </div>
          </CardContent>
        </div>
      )}
    </Card>
  )
}
