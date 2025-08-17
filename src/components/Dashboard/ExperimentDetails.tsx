import { FlaskConical, Users } from 'lucide-react'

import { Badge } from '@/src/components/ui/Badge/Badge'
import { Label } from '@/src/components/ui/Label/Label'

import type { StatsigExperiment } from './types'
import type { StatsigExperimentDetailResponse } from '@/src/api/experiments/experiments-detail.schema'

interface ExperimentDetailsProps {
  experiment: StatsigExperiment
  details: StatsigExperimentDetailResponse | null
  isLoading: boolean
}

export function ExperimentDetails({ experiment, details, isLoading }: ExperimentDetailsProps) {
  return (
    <div className="space-y-3">
      {/* Compact Basic Info */}
      <div className="bg-muted/20 border-border/30 flex flex-wrap items-center gap-4 rounded-lg border p-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          <span className="text-muted-foreground">Allocation:</span>
          <span className="font-mono font-semibold">{experiment.allocation}%</span>
          <div className="bg-muted ml-1 h-1 w-6 overflow-hidden rounded-full">
            <div
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${Math.min(experiment.allocation, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Status:</span>
          <span className="font-mono font-semibold capitalize">{experiment.status}</span>
        </div>
        {experiment.startTime && (
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Started:</span>
            <span className="font-mono font-semibold">{new Date(experiment.startTime).toLocaleDateString()}</span>
          </div>
        )}
        {experiment.endTime && (
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Ends:</span>
            <span className="font-mono font-semibold">{new Date(experiment.endTime).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Experiment Groups */}
      <div className="bg-muted/10 rounded-lg border p-3">
        <div className="mb-2 flex items-center gap-2">
          <Users className="h-3 w-3 text-orange-600" />
          <Label className="text-xs font-semibold">Experiment Groups</Label>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="bg-muted h-3 w-16 animate-pulse rounded" />
            <div className="bg-muted h-3 w-12 animate-pulse rounded" />
          </div>
        ) : details?.data.groups && details.data.groups.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {details.data.groups.map((group, index) => (
              <div key={group.id || index} className="bg-muted/30 flex items-center gap-1 rounded px-2 py-1">
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    group.id === details.data.controlGroupID ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                />
                <span className="text-xs font-medium">{group.name || `Group ${index + 1}`}</span>
                {group.id === details.data.controlGroupID && (
                  <Badge variant="outline" className="h-3 px-1 text-xs">
                    Control
                  </Badge>
                )}
                <span className="text-muted-foreground ml-1 font-mono text-xs">{group.size || 0}%</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-2 text-center">
            <div className="flex items-center gap-1">
              <FlaskConical className="text-muted-foreground h-3 w-3" />
              <p className="text-muted-foreground text-xs">No groups available</p>
            </div>
          </div>
        )}
      </div>

      {/* Compact Hypothesis */}
      {details?.data.hypothesis && (
        <div className="bg-muted/10 rounded-lg border p-3">
          <div className="flex items-start gap-2">
            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
            <div>
              <Label className="text-xs font-semibold">Hypothesis</Label>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{details.data.hypothesis}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
