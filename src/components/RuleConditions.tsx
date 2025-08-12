import React, { useState } from 'react'

import { formatValue } from '../utils/configuration-formatters'

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
            <pre className="overflow-x-auto rounded bg-white px-2 py-1 font-mono break-words whitespace-pre-wrap text-gray-800">
              <code>{formatValue(condition.targetValue)}</code>
            </pre>
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
        <div className="flex items-center gap-2">
          <h4 className={`font-semibold text-gray-900 ${compact ? 'text-xs' : 'text-sm'}`}>
            {rule.name || `Rule ${index + 1}`}
          </h4>
        </div>
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

      {/* Rule content */}
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
          <pre className="mt-1 block overflow-x-auto rounded bg-green-50 p-2 font-mono break-words whitespace-pre-wrap text-green-800">
            <code>{formatValue(rule.returnValue)}</code>
          </pre>
        </div>
      )}
    </div>
  )
}

/**
 * Simplified RuleConditions component that displays Statsig rules and conditions
 * Uses the Statsig SDK's built-in evaluation logic instead of complex manual formatting
 * All rules can be collapsed/expanded as a group
 */
export function RuleConditions({ rules, compact = false }: RuleConditionsProps) {
  // State to track if the rules group is expanded (collapsed by default)
  const [isExpanded, setIsExpanded] = useState(false)

  /**
   * Toggle the expanded state of the entire rules group
   */
  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev)
  }

  if (!rules?.length) {
    return (
      <div className="rounded-lg border bg-gray-50 p-4 text-center text-gray-500">
        <div className="text-sm italic">No rules configured</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleExpanded}
          className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-gray-100"
          aria-label={isExpanded ? 'Collapse rules' : 'Expand rules'}
        >
          <svg
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${
              isExpanded ? 'rotate-90' : 'rotate-0'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </button>
        <button
          onClick={toggleExpanded}
          className={`cursor-pointer font-semibold text-gray-900 transition-colors hover:text-gray-700 ${compact ? 'text-xs' : 'text-sm'}`}
        >
          Rules ({rules.length})
        </button>
      </div>
      {isExpanded && (
        <div className="space-y-3">
          {rules.map((rule, index) => {
            const ruleKey = rule.id || index
            return <RuleItem key={ruleKey} rule={rule} index={index} compact={compact} />
          })}
        </div>
      )}
    </div>
  )
}
