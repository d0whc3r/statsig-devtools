import { Badge } from '@/src/components/ui/Badge/Badge'
import { zExternalGateDto } from '@/src/client/zod.gen'

import type { z } from 'zod'

type RuleCondition = z.infer<typeof zExternalGateDto>['rules'][0]['conditions'][0]

interface FeatureGateRuleConditionProps {
  condition: RuleCondition
  index: number
}

export function FeatureGateRuleCondition({ condition, index }: FeatureGateRuleConditionProps) {
  return (
    <div className="bg-card border-border/40 flex items-center gap-2 rounded-md border p-3 text-xs shadow-sm">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
        {index + 1}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="h-5 border-blue-200 bg-blue-50 px-2 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
        >
          {condition.type}
        </Badge>
        {condition.operator && condition.operator !== 'any' && (
          <Badge
            variant="secondary"
            className="h-5 border-amber-200 bg-amber-50 px-2 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
          >
            {condition.operator}
          </Badge>
        )}
        {condition.field && condition.field !== 'custom' && (
          <Badge
            variant="secondary"
            className="h-5 border-purple-200 bg-purple-50 px-2 text-xs font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300"
          >
            {condition.field}
          </Badge>
        )}
        {condition.field === 'custom' && condition.customID && (
          <Badge
            variant="secondary"
            className="h-5 border-indigo-200 bg-indigo-50 px-2 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
          >
            {condition.customID}
          </Badge>
        )}
        {condition.operator === 'any' && (
          <Badge
            variant="secondary"
            className="h-5 border-green-200 bg-green-50 px-2 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
          >
            any
          </Badge>
        )}
        {condition.targetValue && (
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-xs">=</span>
            <code className="bg-muted/80 text-foreground rounded px-1.5 py-0.5 font-mono text-xs font-medium">
              {Array.isArray(condition.targetValue)
                ? `[${condition.targetValue.map((v) => `"${v}"`).join(', ')}]`
                : `"${String(condition.targetValue)}"`}
            </code>
          </div>
        )}
      </div>
    </div>
  )
}
