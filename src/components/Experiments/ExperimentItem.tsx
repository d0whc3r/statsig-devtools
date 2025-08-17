import { Eye, EyeOff, FlaskConical, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ExperimentsDetailApi } from '@/src/api/experiments/experiments-detail.api'
import { Button } from '@/src/components/ui/Button/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card/Card'
import { tabCommunication } from '@/src/utils/tab-communication'

import { ExperimentDetails } from '../Dashboard/ExperimentDetails'
import { ExperimentHeader } from '../Dashboard/ExperimentHeader'
import { OverridePanel } from '../Dashboard/OverridePanel'

import type { StatsigExperiment } from '../Dashboard/types'
import type { StatsigExperimentDetailResponse } from '@/src/api/experiments/experiments-detail.schema'

interface ExperimentItemProps {
  experiment: StatsigExperiment
  onOverride: (id: string, value: unknown, source: 'browser' | 'api') => void
}

export function ExperimentItem({ experiment, onOverride }: ExperimentItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showOverride, setShowOverride] = useState(false)
  const [experimentDetails, setExperimentDetails] = useState<StatsigExperimentDetailResponse | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [canOverride, setCanOverride] = useState(false)

  useEffect(() => {
    const checkOverrideCapability = async () => {
      const connection = await tabCommunication.checkConnection()
      const isStatsigActive = await tabCommunication.isStatsigActive()
      setCanOverride(connection.isReady && isStatsigActive)
    }

    checkOverrideCapability()
  }, [])

  const handleToggleExpanded = async () => {
    if (isExpanded) {
      setIsExpanded(false)
    } else {
      setIsExpanded(true)
      // Fetch experiment details when expanding
      if (!experimentDetails) {
        setIsLoadingDetails(true)
        try {
          const detailsApi = new ExperimentsDetailApi()
          const details = await detailsApi.getExperimentById(experiment.id)
          setExperimentDetails(details)
        } catch (error) {
          // Error is handled by the API layer
          void error
        } finally {
          setIsLoadingDetails(false)
        }
      }
    }
  }

  const handleToggleOverride = () => {
    setShowOverride(!showOverride)
  }

  return (
    <Card className="group border-border/50 transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-purple-500/20 to-purple-600/10 transition-all group-hover:from-purple-500/30 group-hover:to-purple-600/20">
              <FlaskConical className="h-3 w-3 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-sm font-semibold">{experiment.name ?? experiment.id}</CardTitle>
              {experiment.description && (
                <CardDescription className="text-muted-foreground truncate text-xs">
                  {experiment.description}
                </CardDescription>
              )}
            </div>
          </div>
          <ExperimentHeader experiment={experiment} />
          <div className="ml-1 flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleOverride}
              className="h-5 px-1.5 text-xs"
              disabled={!canOverride}
              title={
                !canOverride ? 'Script not injected or Statsig not detected on current tab' : 'Create API override'
              }
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToggleExpanded} className="h-5 px-1.5">
              {isExpanded ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Override Panel */}
      {showOverride && canOverride && (
        <div className="animate-slide-down border-t px-3 py-2">
          <OverridePanel
            type="experiment"
            targetId={experiment.id}
            onOverride={(value) => onOverride(experiment.id, value, 'api')}
            {...(experimentDetails?.data.groups && {
              experimentGroups: experimentDetails.data.groups.map((group) => ({
                id: group.id ?? group.name,
                name: group.name,
              })),
            })}
          />
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="animate-slide-down">
          <CardContent className="pt-0 pb-2">
            <ExperimentDetails experiment={experiment} details={experimentDetails} isLoading={isLoadingDetails} />
          </CardContent>
        </div>
      )}
    </Card>
  )
}
