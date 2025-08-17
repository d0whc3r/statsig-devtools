import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/src/utils/cn'

const tabsVariants = cva(
  cn('relative items-center inline-flex justify-center rounded-lg transition-all duration-300 w-full'),
  {
    variants: {
      variant: {
        default: 'bg-background border border-border',
        ghost: 'bg-transparent',
        underline: 'bg-transparent border-b border-border rounded-none',
      },
      size: {
        sm: 'h-9 p-1',
        default: 'h-10 p-1.5',
        lg: 'h-12 p-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const tabTriggerVariants = cva(
  'relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1',
  {
    variants: {
      variant: {
        default:
          'text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:bg-primary data-[state=active]:shadow-sm',
        ghost:
          'text-muted-foreground hover:text-foreground hover:bg-accent data-[state=active]:text-foreground data-[state=active]:bg-accent',
        underline: 'text-muted-foreground hover:text-foreground data-[state=active]:text-foreground rounded-none',
      },
      size: {
        sm: 'px-2.5 py-1 text-xs',
        default: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface TabItem {
  id: string
  label?: string
  icon?: React.ReactNode
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof tabsVariants> {
  items: TabItem[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  indicatorColor?: string
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      className,
      variant,
      size,
      items,
      defaultValue,
      value,
      onValueChange,
      indicatorColor = 'hsl(var(--primary))',
      ...props
    },
    ref,
  ) => {
    const [activeValue, setActiveValue] = React.useState(value ?? defaultValue ?? items[0]?.id)
    const [activeTabBounds, setActiveTabBounds] = React.useState({
      left: 0,
      width: 0,
    })

    const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([])

    React.useEffect(() => {
      if (value !== undefined) {
        setActiveValue(value)
      }
    }, [value])

    React.useEffect(() => {
      const activeIndex = items.findIndex((item: TabItem) => item.id === activeValue)
      const activeTab = tabRefs.current[activeIndex]

      if (activeTab) {
        const tabRect = activeTab.getBoundingClientRect()
        const containerRect = activeTab.parentElement?.getBoundingClientRect()

        if (containerRect) {
          setActiveTabBounds({
            left: tabRect.left - containerRect.left,
            width: tabRect.width,
          })
        }
      }
    }, [activeValue, items])

    const handleTabClick = (tabId: string) => {
      setActiveValue(tabId)
      onValueChange?.(tabId)
    }

    return (
      <div ref={ref} className={cn(tabsVariants({ variant, size }), className, 'relative')} {...props}>
        {/* Active tab indicator */}
        {variant !== 'underline' && (
          <div
            className="absolute z-10 rounded-md transition-all duration-300"
            style={{
              left: activeTabBounds.left,
              width: activeTabBounds.width,
              height: variant === 'default' ? 'calc(100% - 0.5rem)' : '100%',
              top: variant === 'default' ? '0.25rem' : 0,
              backgroundColor: indicatorColor,
              opacity: 0.1,
            }}
          />
        )}
        {variant === 'underline' && (
          <div
            className="absolute bottom-0 z-10 h-0.5 transition-all duration-300"
            style={{
              left: activeTabBounds.left,
              width: activeTabBounds.width,
              backgroundColor: indicatorColor,
            }}
          />
        )}
        {/* Tab triggers */}
        {items.map((item: TabItem, index: number) => {
          const isActive = activeValue === item.id

          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[index] = el
              }}
              className={cn(tabTriggerVariants({ variant, size }), 'relative z-20 gap-2')}
              data-state={isActive ? 'active' : 'inactive'}
              onClick={() => handleTabClick(item.id)}
              type="button"
            >
              {item.icon && <span className="[&_svg]:size-4">{item.icon}</span>}
              {item.label}
            </button>
          )
        })}
      </div>
    )
  },
)

Tabs.displayName = 'Tabs'

// Content component for tab panels
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  activeValue?: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, activeValue, children, ...props }, ref) => {
    const isActive = value === activeValue

    if (!isActive) return null

    return (
      <div
        ref={ref}
        className={cn(
          'ring-offset-background focus-visible:ring-ring animate-fade-in focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

TabsContent.displayName = 'TabsContent'

export { Tabs, TabsContent, tabsVariants }
