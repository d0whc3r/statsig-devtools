import { Check, ChevronDown } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/src/utils/cn'

interface SelectContextType<T = string> {
  value: T
  onValueChange: (value: T) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType<unknown> | null>(null)

function useSelectContext<T = string>() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error('Select components must be used within a Select')
  }
  return context as SelectContextType<T>
}

interface SelectProps<T = string> {
  value: T
  onValueChange: (value: T) => void
  children: React.ReactNode
}

function Select<T = string>({ value, onValueChange, children }: SelectProps<T>) {
  const [open, setOpen] = React.useState(false)

  return (
    <SelectContext.Provider value={{ value, onValueChange: onValueChange as (value: unknown) => void, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelectContext()

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'border-input bg-background text-foreground focus:border-ring focus:ring-ring/20 flex h-9 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm shadow-sm shadow-black/5 focus:ring-[3px] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn('text-muted-foreground/80 h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>
    )
  },
)
SelectTrigger.displayName = 'SelectTrigger'

interface SelectValueProps {
  placeholder?: string
  children?: React.ReactNode
}

function SelectValue({ placeholder, children }: SelectValueProps) {
  const { value } = useSelectContext()

  if (children) {
    return <>{children}</>
  }

  return <span className={cn(!value && 'text-muted-foreground/70')}>{value || placeholder}</span>
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

function SelectContent({ children, className }: SelectContentProps) {
  const { open, setOpen } = useSelectContext()
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      className={cn(
        'border-input bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 absolute top-full z-50 mt-1 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border shadow-lg shadow-black/5',
        className,
      )}
    >
      <div className="p-1">{children}</div>
    </div>
  )
}

interface SelectItemProps<T = string> {
  value: T
  children: React.ReactNode
  className?: string
}

function SelectItem<T = string>({ value, children, className }: SelectItemProps<T>) {
  const { value: selectedValue, onValueChange, setOpen } = useSelectContext<T>()
  const isSelected = value === selectedValue

  return (
    <div
      className={cn(
        'hover:bg-accent hover:text-accent-foreground relative flex w-full cursor-default items-center rounded-md py-1.5 pr-2 pl-8 text-sm outline-none select-none',
        isSelected && 'bg-accent text-accent-foreground',
        className,
      )}
      onClick={() => {
        onValueChange(value)
        setOpen(false)
      }}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  )
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
