interface ErrorDisplayProps {
  error: string
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="status-error border-b px-4 py-3">
      <div className="flex items-start gap-2">
        <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium">Configuration Error</p>
          <p className="mt-1 text-xs">{error}</p>
        </div>
      </div>
    </div>
  )
}
