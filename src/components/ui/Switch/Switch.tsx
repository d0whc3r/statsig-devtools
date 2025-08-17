import * as React from 'react'

import { cn } from '@/src/utils/cn'

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event)
      onCheckedChange?.(event.target.checked)
    }

    return (
      <label className="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" className="peer sr-only" ref={ref} onChange={handleChange} {...props} />
        <div
          className={cn(
            "peer peer-checked:bg-primary peer-focus:ring-primary/20 h-6 w-11 rounded-full bg-gray-200 peer-focus:ring-4 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full",
            className,
          )}
        />
      </label>
    )
  },
)
Switch.displayName = 'Switch'

export { Switch }
