import { Flag } from 'lucide-react'
import { useEffect } from 'react'

import { Label } from '@/src/components/ui/Label/Label'
import { useStatsigData } from '@/src/hooks/useStatsigData'

import { FeatureGateRule } from './FeatureGateRule'

import type { zExternalGateDto } from '@/src/client/zod.gen'
import type { z } from 'zod'

type Rule = z.infer<typeof zExternalGateDto>['rules'][0]

interface FeatureGateRulesProps {
  gateId: string
}

export function FeatureGateRules({ gateId }: FeatureGateRulesProps) {
  const { gateDetails, isLoadingGateDetails, fetchGateDetail } = useStatsigData()

  useEffect(() => {
    // Fetch gate details when component mounts
    fetchGateDetail(gateId)
  }, [gateId, fetchGateDetail])

  const gateDetail = gateDetails[gateId]
  const rules = gateDetail?.data?.rules
  const isLoading = isLoadingGateDetails[gateId] ?? false
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary h-1.5 w-1.5 rounded-full" />
          <Label className="text-card-foreground text-sm font-semibold">Targeting Rules</Label>
        </div>
        {isLoading && (
          <div className="border-muted-foreground/20 border-t-primary h-3 w-3 animate-spin rounded-full border-2" />
        )}
      </div>

      {isLoading ? (
        <div className="border-muted bg-muted/10 flex items-center justify-center rounded-lg border border-dashed py-6">
          <div className="text-center">
            <div className="border-muted-foreground/20 border-t-primary mx-auto mb-2 h-4 w-4 animate-spin rounded-full border-2" />
            <p className="text-muted-foreground text-xs">Loading rules...</p>
          </div>
        </div>
      ) : rules && rules.length > 0 ? (
        <div className="space-y-2">
          {rules.map((rule, index) => (
            <FeatureGateRule key={index} rule={rule} index={index} />
          ))}
        </div>
      ) : (
        <div className="border-muted bg-muted/10 flex items-center justify-center rounded-lg border border-dashed py-6">
          <div className="text-center">
            <Flag className="text-muted-foreground mx-auto mb-1 h-4 w-4" />
            <p className="text-muted-foreground text-xs">No targeting rules defined</p>
          </div>
        </div>
      )}
    </div>
  )
}
