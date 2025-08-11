import { useExtensionInfo } from '../hooks/useExtensionInfo'

interface ExtensionInfoProps {
  compact?: boolean
  showDescription?: boolean
  className?: string
}

/**
 * Component to display extension information including version
 */
export function ExtensionInfo({ compact = false, showDescription = false, className = '' }: ExtensionInfoProps) {
  const { extensionInfo, isLoading } = useExtensionInfo()

  if (isLoading || !extensionInfo) {
    return null
  }

  if (compact) {
    return <div className={`text-xs text-gray-500 ${className}`}>v{extensionInfo.version}</div>
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-gray-900">{extensionInfo.name}</h3>
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
          v{extensionInfo.version}
        </span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          MV{extensionInfo.manifestVersion}
        </span>
      </div>
      {showDescription && extensionInfo.description && (
        <p className="text-sm text-gray-600">{extensionInfo.description}</p>
      )}
    </div>
  )
}
