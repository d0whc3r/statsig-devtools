import React from 'react'

import type { ConfigurationRule, RuleCondition } from '../types'

interface RuleConditionsProps {
  rules: ConfigurationRule[]
  compact?: boolean
}

// Simplified condition type mapping based on Statsig SDK
const CONDITION_TYPES: Record<string, string> = {
  user_id: 'User ID',
  email: 'Email',
  country: 'Country',
  app_version: 'App Version',
  browser_name: 'Browser',
  os_name: 'Operating System',
  ip_address: 'IP Address',
  custom_field: 'Custom Field',
  environment_tier: 'Environment',
  public: 'Public',
  passes_gate: 'Passes Gate',
  fails_gate: 'Fails Gate',
  passes_segment: 'In Segment',
  fails_segment: 'Not in Segment',
  time: 'Time',
}

// Simplified operator mapping
const OPERATORS: Record<string, string> = {
  any: 'any of',
  none: 'none of',
  gt: '>',
  gte: '≥',
  lt: '<',
  lte: '≤',
  version_gt: 'version >',
  version_gte: 'version ≥',
  version_lt: 'version <',
  version_lte: 'version ≤',
  str_contains_any: 'contains',
  str_contains_none: 'does not contain',
}

const formatConditionType = (condition: RuleCondition): string => {
  const { type, targetValue, operator } = condition

  // Handle "public" conditions - show as "Everyone"
  if (type === 'public') {
    if (targetValue && operator) {
      if (Array.isArray(targetValue) && targetValue.length === 1) {
        return `Everyone in ${targetValue[0]}`
      } else if (Array.isArray(targetValue) && targetValue.length > 1) {
        return `Everyone in ${targetValue.join(', ')}`
      } else if (typeof targetValue === 'string') {
        return `Everyone in ${targetValue}`
      }
    }
    return 'Everyone'
  }

  // Handle environment_tier conditions more clearly
  if (type === 'environment_tier') {
    if (Array.isArray(targetValue) && targetValue.length === 1) {
      return `Environment: ${targetValue[0]}`
    } else if (Array.isArray(targetValue) && targetValue.length > 1) {
      return `Environments: ${targetValue.join(', ')}`
    }
  }

  return CONDITION_TYPES[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

const formatOperator = (operator: string): string => OPERATORS[operator] || operator

const formatValue = (value: unknown): string => {
  if (value == null) return 'null'
  if (Array.isArray(value)) return `[${value.join(', ')}]`
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function ConditionItem({ condition, compact }: { condition: RuleCondition; compact?: boolean }) {
  const conditionTypeText = formatConditionType(condition)
  const isEveryoneCondition = condition.type === 'public' && condition.targetValue

  return (
    <div className={`rounded border-l-4 border-blue-200 bg-blue-50 p-3 ${compact ? 'text-xs' : 'text-sm'}`}>
      <div className="text-gray-700">
        <span className="font-semibold text-gray-900">{conditionTypeText}</span>
        {/* Only show operator and target value if it's not an "everyone" condition that we've already formatted */}
        {condition.operator && !isEveryoneCondition && (
          <>
            <span className="mx-2 text-gray-500">{formatOperator(condition.operator)}</span>
            <code className="rounded bg-white px-2 py-1 text-gray-800">{formatValue(condition.targetValue)}</code>
          </>
        )}
        {condition.field && (
          <div className="mt-1 text-gray-600">
            Field: <code className="rounded bg-gray-100 px-1">{condition.field}</code>
          </div>
        )}
      </div>
    </div>
  )
}

function RuleItem({ rule, index, compact }: { rule: ConfigurationRule; index: number; compact?: boolean }) {
  // Use rule-level environments - if null, it means the rule applies to ALL environments
  const ruleEnvironments = rule.environments
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-2 flex flex-row items-center justify-between">
        <h4 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
          {rule.name || `Rule ${index + 1}`}
        </h4>
        <div className="flex gap-2">
          {rule.groupName && (
            <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
              {rule.groupName}
            </span>
          )}
          {ruleEnvironments && ruleEnvironments.length > 0 && (
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
              {ruleEnvironments.length === 1 ? `Env: ${ruleEnvironments[0]}` : `Envs: ${ruleEnvironments.join(', ')}`}
            </span>
          )}
          {rule.passPercentage !== undefined && (
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
              {rule.passPercentage}% pass
            </span>
          )}
        </div>
      </div>

      {rule.conditions?.length ? (
        <div className="space-y-1">
          <div className="text-sm font-light text-gray-800">Conditions ({rule.conditions.length})</div>
          {rule.conditions.map((condition, idx) => (
            <ConditionItem key={idx} condition={condition} compact={compact} />
          ))}
        </div>
      ) : (
        <div className="text-gray-500 italic">No conditions configured</div>
      )}

      {rule.returnValue !== undefined && (
        <div className="mt-3 border-t pt-3">
          <div className="text-sm font-medium text-gray-800">Return Value:</div>
          <code className="mt-1 block rounded bg-green-50 p-2 text-green-800">{formatValue(rule.returnValue)}</code>
        </div>
      )}
    </div>
  )
}

/**
 * Simplified RuleConditions component that displays Statsig rules and conditions
 * Uses the Statsig SDK's built-in evaluation logic instead of complex manual formatting
 */
export function RuleConditions({ rules, compact = false }: RuleConditionsProps) {
  if (!rules?.length) {
    return (
      <div className="rounded-lg border bg-gray-50 p-4 text-center text-gray-500">
        <div className="text-sm italic">No rules configured</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-lg'}`}>Rules ({rules.length})</div>
      <div className="space-y-3">
        {rules.map((rule, index) => (
          <RuleItem key={rule.id || index} rule={rule} index={index} compact={compact} />
        ))}
      </div>
    </div>
  )
}
