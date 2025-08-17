import { type ButtonHTMLAttributes, forwardRef } from 'react'

import { cn } from '@/src/utils/cn'

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  loadingText?: string
}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText = 'Loading...',
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center gap-2 rounded-lg font-semibold',
      'transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
      !disabled && !isLoading && 'hover:scale-[1.02] active:scale-[0.98]',
    )

    const variantClasses = {
      primary: cn(
        'bg-gradient-to-r from-primary via-primary to-primary/90',
        'hover:from-primary/90 hover:via-primary/95 hover:to-primary/80',
        'text-primary-foreground shadow-lg hover:shadow-xl',
        'focus:ring-primary/50',
      ),
      secondary: cn(
        'bg-gradient-to-r from-secondary via-secondary to-secondary/90',
        'hover:from-secondary/90 hover:via-secondary/95 hover:to-secondary/80',
        'text-secondary-foreground shadow-lg hover:shadow-xl',
        'focus:ring-secondary/50',
      ),
      success: cn(
        'bg-gradient-to-r from-green-500 via-green-600 to-green-500',
        'hover:from-green-600 hover:via-green-700 hover:to-green-600',
        'text-white shadow-lg hover:shadow-xl',
        'focus:ring-green-500/50',
      ),
      warning: cn(
        'bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500',
        'hover:from-yellow-600 hover:via-yellow-700 hover:to-yellow-600',
        'text-white shadow-lg hover:shadow-xl',
        'focus:ring-yellow-500/50',
      ),
      danger: cn(
        'bg-gradient-to-r from-red-500 via-red-600 to-red-500',
        'hover:from-red-600 hover:via-red-700 hover:to-red-600',
        'text-white shadow-lg hover:shadow-xl',
        'focus:ring-red-500/50',
      ),
    }

    const sizeClasses = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    }

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {loadingText}
          </>
        ) : (
          children
        )}
      </button>
    )
  },
)

GradientButton.displayName = 'GradientButton'
