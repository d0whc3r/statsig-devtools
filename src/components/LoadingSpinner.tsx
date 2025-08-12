interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', message, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`} data-testid="loading-spinner">
      <div
        className={`animate-spin rounded-full border-2 border-slate-200 ${sizeClasses[size]}`}
        style={{
          borderTopColor: '#1e40af',
          borderRightColor: '#3b82f6',
          background: 'conic-gradient(from 0deg, transparent, rgba(30, 64, 175, 0.1))',
        }}
      />
      {message && <p className="mt-3 text-sm font-medium text-slate-600">{message}</p>}
    </div>
  )
}

export default LoadingSpinner
