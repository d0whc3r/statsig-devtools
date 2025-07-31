interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
}

function LoadingSpinner({ size = 'medium', message = 'Loading...' }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  )
}

export default LoadingSpinner
