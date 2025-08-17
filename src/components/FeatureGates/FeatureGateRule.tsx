import { Badge } from '@/src/components/ui/Badge/Badge'

import { FeatureGateRuleCondition } from './FeatureGateRuleCondition'

import type { zExternalGateDto } from '@/src/client/zod.gen'
import type { z } from 'zod'

type Rule = z.infer<typeof zExternalGateDto>['rules'][0]

interface FeatureGateRuleProps {
  rule: Rule
  index: number
}

export function FeatureGateRule({ rule, index }: FeatureGateRuleProps) {
  return (
    <div className="border-border/50 from-card to-muted/10 hover:border-border rounded-lg border bg-gradient-to-r p-3 transition-all">
      {/* Compact Rule Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded text-xs font-bold">
            {index + 1}
          </div>
          <span className="text-card-foreground text-sm font-medium">{rule.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground text-xs">Pass:</span>
          <Badge
            variant="secondary"
            className="h-4 border-green-500/20 bg-green-500/10 px-1.5 text-xs text-green-600 dark:text-green-400"
          >
            {rule.passPercentage}%
          </Badge>
        </div>
      </div>

      {/* Compact Conditions */}
      {rule.conditions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-blue-500" />
            <span className="text-muted-foreground text-xs font-medium">Conditions ({rule.conditions.length})</span>
          </div>
          <div className="space-y-1">
            {rule.conditions.map((condition, condIndex) => (
              <FeatureGateRuleCondition key={condIndex} condition={condition} index={condIndex} />
            ))}
          </div>
        </div>
      )}

      {/* Compact Additional Info */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        {rule.environments && rule.environments.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Envs:</span>
            {rule.environments.map((env, envIndex) => (
              <Badge
                key={envIndex}
                variant="secondary"
                className="h-4 border-purple-500/20 bg-purple-500/10 px-1 text-xs text-purple-700 dark:text-purple-300"
              >
                {env}
              </Badge>
            ))}
          </div>
        )}

        {rule.returnValue && Object.keys(rule.returnValue).length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Return:</span>
            <code className="text-card-foreground bg-muted/50 rounded px-1 font-mono text-xs">
              {JSON.stringify(rule.returnValue)}
            </code>
          </div>
        )}
      </div>
    </div>
  )
}
