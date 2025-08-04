import React from 'react'

import type { ConfigurationRule, RuleCondition } from '../types'

interface RuleConditionsProps {
  rules: ConfigurationRule[]
  compact?: boolean
}

/**
 * Component for displaying rule conditions
 */
export const RuleConditions: React.FC<RuleConditionsProps> = ({ rules, compact = false }) => {
  /**
   * Format operator for display
   */
  const formatOperator = (operator: string): string => {
    const operatorMap: Record<string, string> = {
      eq: 'equals',
      neq: 'not equals',
      gt: 'greater than',
      gte: 'greater than or equal',
      lt: 'less than',
      lte: 'less than or equal',
      contains: 'contains',
      not_contains: 'does not contain',
      starts_with: 'starts with',
      ends_with: 'ends with',
      in: 'is in',
      not_in: 'is not in',
      regex: 'matches regex',
      not_regex: 'does not match regex',
    }
    return operatorMap[operator] || operator
  }

  /**
   * Format condition type for display
   */
  const formatConditionType = (type: string): string => {
    const typeMap: Record<string, string> = {
      user_id: 'User ID',
      email: 'Email',
      country: 'Country',
      locale: 'Locale',
      app_version: 'App Version',
      browser: 'Browser',
      os: 'Operating System',
      ip: 'IP Address',
      custom: 'Custom Field',
    }
    return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  /**
   * Format value for display
   */
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return 'null'
    }
    if (typeof value === 'string') {
      return value
    }
    if (typeof value === 'boolean') {
      return value.toString()
    }
    if (typeof value === 'number') {
      return value.toString()
    }
    if (Array.isArray(value)) {
      return `[${value.join(', ')}]`
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  /**
   * Render a single condition
   */
  const renderCondition = (condition: RuleCondition, index: number) => (
    <div key={index} className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600`}>
      <span className="font-medium text-gray-800">{formatConditionType(condition.type)}</span>
      <span className="mx-2 text-gray-500">{formatOperator(condition.operator)}</span>
      <span className="rounded bg-gray-100 px-1 font-mono">{formatValue(condition.targetValue)}</span>
    </div>
  )

  /**
   * Render a single rule
   */
  const renderRule = (rule: ConfigurationRule, ruleIndex: number) => (
    <div key={ruleIndex} className={`rounded-lg border p-3 ${compact ? 'mb-2' : 'mb-4'}`}>
      <div className="mb-2 flex items-center justify-between">
        <h4 className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
          {rule.name || `Rule ${ruleIndex + 1}`}
        </h4>
        {rule.passPercentage !== undefined && (
          <span className={`rounded-full bg-blue-100 px-2 py-1 text-blue-800 ${compact ? 'text-xs' : 'text-sm'}`}>
            {rule.passPercentage}% pass
          </span>
        )}
      </div>

      {rule.conditions && rule.conditions.length > 0 ? (
        <div className="space-y-1">
          <div className={`font-medium text-gray-700 ${compact ? 'text-xs' : 'text-sm'}`}>Conditions:</div>
          {rule.conditions.map((condition, conditionIndex) => renderCondition(condition, conditionIndex))}
        </div>
      ) : (
        <div className={`text-gray-500 italic ${compact ? 'text-xs' : 'text-sm'}`}>No conditions</div>
      )}

      {rule.returnValue !== undefined && (
        <div className={`mt-2 border-t pt-2 ${compact ? 'text-xs' : 'text-sm'}`}>
          <span className="font-medium text-gray-700">Return Value: </span>
          <span className="rounded bg-gray-100 px-1 font-mono">{formatValue(rule.returnValue)}</span>
        </div>
      )}
    </div>
  )

  if (!rules || rules.length === 0) {
    return <div className={`text-gray-500 italic ${compact ? 'text-xs' : 'text-sm'}`}>No rules configured</div>
  }

  return (
    <div className="space-y-2">
      <div className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>Rules ({rules.length})</div>
      {rules.map((rule, index) => renderRule(rule, index))}
    </div>
  )
}
