import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

import { cn } from '@/src/utils/cn'

interface EnhancedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: ReactNode
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  onRightIconClick?: () => void
  variant?: 'default' | 'filled' | 'glass'
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    { className, label, error, helperText, leftIcon, rightIcon, onRightIconClick, variant = 'default', id, ...props },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    const baseInputClasses = cn(
      'w-full h-12 rounded-lg border transition-all duration-200 outline-none',
      'text-foreground placeholder:text-muted-foreground',
      'focus:ring-2 focus:ring-offset-0',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      leftIcon ? 'pl-12' : 'pl-4',
      rightIcon ? 'pr-12' : 'pr-4',
    )

    const variantClasses = {
      default: cn(
        'border-input bg-background',
        'focus:border-primary focus:ring-primary/20',
        error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
      ),
      filled: cn(
        'border-input bg-muted/50',
        'focus:border-primary focus:ring-primary/20 focus:bg-background',
        error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
      ),
      glass: cn(
        'border-input bg-background/50 backdrop-blur-sm',
        'focus:border-primary focus:ring-primary/20 focus:bg-background',
        error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
      ),
    }

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className={cn('text-foreground block text-sm font-semibold', error && 'text-destructive')}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && <div className="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2">{leftIcon}</div>}

          <input
            ref={ref}
            id={inputId}
            className={cn(baseInputClasses, variantClasses[variant], className)}
            {...props}
          />

          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className={cn(
                'absolute top-1/2 right-4 -translate-y-1/2',
                'text-muted-foreground hover:text-foreground',
                'hover:bg-accent rounded-md p-1',
                'transition-colors duration-200',
                !onRightIconClick && 'cursor-default hover:bg-transparent',
              )}
              disabled={props.disabled}
            >
              {rightIcon}
            </button>
          )}
        </div>

        {(error || helperText) && (
          <div className={cn('text-xs', error ? 'text-destructive' : 'text-muted-foreground')}>
            {error || helperText}
          </div>
        )}
      </div>
    )
  },
)

EnhancedInput.displayName = 'EnhancedInput'
