import { RotateCcw, Save, Settings, User, X } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/src/components/ui/Badge/Badge'
import { Button } from '@/src/components/ui/Button/Button'
import { Input } from '@/src/components/ui/Input/Input'
import { Label } from '@/src/components/ui/Label/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/Select/Select'
import { useApiOverrides } from '@/src/hooks/useApiOverrides'

interface OverridePanelProps {
  type: string
  targetId: string
  onOverride: (value: unknown) => void
  // Add optional props for experiment groups and other configuration
  experimentGroups?: Array<{ id: string; name: string }>
}

export function OverridePanel({ type, targetId, onOverride, experimentGroups }: OverridePanelProps) {
  const [overrideValue, setOverrideValue] = useState<string>('')
  const [customUserId, setCustomUserId] = useState<string>('')

  const {
    hasOverride,
    getOverrideValue,
    getCurrentUserIdentifier,
    isAuthenticated,
    isApplyingOverride,
    isRemovingOverride,
  } = useApiOverrides()

  const currentUserIdentifier = getCurrentUserIdentifier()
  const hasApiOverride = hasOverride(targetId, type as 'gate' | 'experiment' | 'dynamicConfig')
  const currentOverrideValue = getOverrideValue(targetId, type as 'gate' | 'experiment' | 'dynamicConfig')

  const handleApiOverride = async () => {
    if (!overrideValue.trim() || !isAuthenticated) return

    let parsedValue: unknown = overrideValue

    // For gates, convert string to boolean
    if (type === 'feature gate') {
      parsedValue = overrideValue === 'true'
    }

    // Use custom user ID if provided, otherwise use current user
    const userId = customUserId.trim() || currentUserIdentifier

    if (!userId) {
      // Handle error - no user identifier available
      return
    }

    // Call the parent's onOverride
    onOverride(parsedValue)
    setOverrideValue('')
    setCustomUserId('')
  }

  const handleRemoveApiOverride = async () => {
    if (!isAuthenticated) return

    const userId = customUserId.trim() || currentUserIdentifier
    if (!userId) return

    // Call the parent's onOverride with null value to indicate removal
    onOverride(null)
    setCustomUserId('')
  }

  // Determine the input type based on configuration type
  const getInputComponent = () => {
    if (type === 'feature gate') {
      return (
        <Select value={overrideValue} onValueChange={setOverrideValue}>
          <SelectTrigger className="border-0 bg-transparent text-xs focus:ring-1 focus:ring-purple-500/50">
            <SelectValue placeholder="Select boolean value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true" className="text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>True</span>
              </div>
            </SelectItem>
            <SelectItem value="false" className="text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span>False</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      )
    }

    if (type === 'experiment' && experimentGroups) {
      return (
        <Select value={overrideValue} onValueChange={setOverrideValue}>
          <SelectTrigger className="border-0 bg-transparent text-xs focus:ring-1 focus:ring-purple-500/50">
            <SelectValue placeholder="Select experiment group" />
          </SelectTrigger>
          <SelectContent>
            {experimentGroups.map((group, index) => (
              <SelectItem key={group.id} value={group.id} className="text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      index === 0
                        ? 'bg-blue-500'
                        : index === 1
                          ? 'bg-green-500'
                          : index === 2
                            ? 'bg-purple-500'
                            : 'bg-orange-500'
                    }`}
                  />
                  <span>{group.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    // Default to input for dynamic configs or when no specific options are available
    return (
      <Input
        id="override-value"
        placeholder="Enter override value (JSON supported)"
        value={overrideValue}
        onChange={(e) => setOverrideValue(e.target.value)}
        className="border-0 bg-transparent text-xs focus:ring-1 focus:ring-purple-500/50"
      />
    )
  }

  return (
    <div className="border-border/50 from-card via-card to-muted/10 rounded-lg border bg-gradient-to-br p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-orange-500/20 to-orange-600/10">
          <Settings className="h-3 w-3 text-orange-600" />
        </div>
        <div>
          <h4 className="text-card-foreground text-xs font-semibold">Override {type}</h4>
        </div>
      </div>
      <div className="space-y-3">
        {/* Compact Current User Info */}
        {isAuthenticated && (
          <div className="border-border/30 rounded border bg-gradient-to-r from-blue-500/5 to-blue-600/5 p-2">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-blue-600" />
              <span className="text-muted-foreground text-xs">User:</span>
              <span className="text-card-foreground text-xs font-medium">
                {currentUserIdentifier || 'Not configured'}
              </span>
              {hasApiOverride && (
                <Badge
                  variant="secondary"
                  className="h-4 border-green-500/20 bg-green-500/10 px-1 text-xs text-green-700 dark:text-green-300"
                >
                  Active
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Compact Current Override Value Display */}
        {hasApiOverride && currentOverrideValue !== null && (
          <div className="rounded border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-blue-600/5 p-2">
            <div className="mb-1 flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <Label className="text-xs font-medium text-blue-700 dark:text-blue-300">Current Override</Label>
            </div>
            <div className="rounded border border-blue-500/20 bg-blue-500/10 p-1">
              <code className="font-mono text-xs break-all text-blue-800 dark:text-blue-200">
                {JSON.stringify(currentOverrideValue)}
              </code>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            <Label htmlFor="override-value" className="text-card-foreground text-xs font-medium">
              Override Value
            </Label>
          </div>
          <div className="border-border/50 from-muted/20 to-muted/10 rounded border bg-gradient-to-r p-2">
            {getInputComponent()}
          </div>
        </div>

        {/* Compact Custom User ID Input for API Overrides */}
        {isAuthenticated && (
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <Label htmlFor="custom-user-id" className="text-card-foreground text-xs font-medium">
                Custom User ID <span className="text-muted-foreground">(optional)</span>
              </Label>
            </div>
            <div className="border-border/50 from-muted/20 to-muted/10 rounded border bg-gradient-to-r p-2">
              <Input
                id="custom-user-id"
                placeholder={`Current: ${currentUserIdentifier ?? 'Not set'}`}
                value={customUserId}
                onChange={(e) => setCustomUserId(e.target.value)}
                className="border-0 bg-transparent text-xs focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
          </div>
        )}

        <div className="border-border/50 from-muted/20 to-muted/10 rounded border bg-gradient-to-r p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-card-foreground text-xs font-medium">API Override</Label>
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            </div>
            {!isAuthenticated && (
              <Badge variant="destructive" className="h-4 px-1 text-xs">
                Not Auth
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 pt-1">
          <Button
            size="sm"
            onClick={handleApiOverride}
            disabled={!overrideValue.trim() || !isAuthenticated || isApplyingOverride}
            className="h-6 border-0 bg-gradient-to-r from-blue-500 to-blue-600 px-2 text-xs text-white hover:from-blue-600 hover:to-blue-700"
          >
            <Save className="mr-1 h-3 w-3" />
            {isApplyingOverride ? 'Applying...' : 'Apply Override'}
          </Button>
          {hasApiOverride && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleRemoveApiOverride}
              disabled={!isAuthenticated || isRemovingOverride}
              className="h-6 bg-gradient-to-r from-red-500 to-red-600 px-2 text-xs hover:from-red-600 hover:to-red-700"
            >
              <X className="mr-1 h-3 w-3" />
              {isRemovingOverride ? 'Removing...' : 'Remove'}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOverrideValue('')}
            className="border-border/50 hover:bg-muted/50 h-6 px-2 text-xs"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
