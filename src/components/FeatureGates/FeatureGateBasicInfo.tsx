import type { StatsigGate } from '../Dashboard/types'

interface FeatureGateBasicInfoProps {
  gate: StatsigGate
}

export function FeatureGateBasicInfo({ gate }: FeatureGateBasicInfoProps) {
  return (
    <div className="bg-muted/20 border-border/30 flex flex-wrap items-center gap-4 rounded-lg border p-3 text-xs">
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        <span className="text-muted-foreground">Default:</span>
        <span className="font-mono font-semibold">false</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={`h-1.5 w-1.5 rounded-full ${gate.isEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
        <span
          className={`font-mono font-semibold ${gate.isEnabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
        >
          {gate.isEnabled ? 'enabled' : 'disabled'}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
        <span className="font-mono font-semibold capitalize">{gate.status}</span>
        <span className="text-muted-foreground">({gate.type})</span>
      </div>
    </div>
  )
}
