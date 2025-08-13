import { ExclamationCircleIcon } from '@/src/assets/icons/ExclamationCircleIcon'

interface ErrorAlertProps {
  error: string | null
  onDismiss?: () => void
  className?: string
  variant?: 'error' | 'warning' | 'info'
}

export function ErrorAlert({ error, onDismiss, className = '', variant = 'error' }: ErrorAlertProps) {
  if (!error) return null

  const variantStyles = {
    error: 'bg-error-50 border-error-200 text-error-700',
    warning: 'bg-warning-50 border-warning-200 text-warning-700',
    info: 'bg-info-50 border-info-200 text-info-700',
  }

  const iconStyles = {
    error: 'text-error-500',
    warning: 'text-warning-500',
    info: 'text-info-500',
  }

  return (
    <div className={`rounded-lg border p-3 ${variantStyles[variant]} ${className}`}>
      <div className="flex items-start">
        <ExclamationCircleIcon className={`mt-0.5 mr-2 h-4 w-4 flex-shrink-0 ${iconStyles[variant]}`} />
        <div className="flex-1">
          <p className="text-sm leading-relaxed">{error}</p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-2 flex-shrink-0 text-sm transition-opacity hover:opacity-70"
            style={{ cursor: 'pointer' }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
