import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * Virtual list item interface
 */
export interface VirtualListItem {
  id: string
  height?: number
  data: unknown
}

/**
 * Virtual list props
 */
interface VirtualizedListProps<T extends VirtualListItem> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number, isVisible: boolean) => React.ReactNode
  overscan?: number
  className?: string
  onScroll?: (scrollTop: number) => void
}

/**
 * Virtualized list component for handling large datasets efficiently
 */
export function VirtualizedList<T extends VirtualListItem>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  /**
   * Calculate visible range
   */
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(startIndex + Math.ceil(containerHeight / itemHeight), items.length - 1)

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(items.length - 1, endIndex + overscan),
    }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  /**
   * Get visible items
   */
  const visibleItems = useMemo(() => items.slice(visibleRange.start, visibleRange.end + 1), [items, visibleRange])

  /**
   * Handle scroll events
   */
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = event.currentTarget.scrollTop
      setScrollTop(newScrollTop)
      onScroll?.(newScrollTop)
    },
    [onScroll],
  )

  /**
   * Total height of all items
   */
  const totalHeight = items.length * itemHeight

  /**
   * Offset for visible items
   */
  const offsetY = visibleRange.start * itemHeight

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.start + index
            const isVisible = actualIndex >= visibleRange.start && actualIndex <= visibleRange.end

            return (
              <div key={item.id} style={{ height: itemHeight }} data-index={actualIndex}>
                {renderItem(item, actualIndex, isVisible)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/**
 * Hook for managing virtual list state
 */
export function useVirtualList<T extends VirtualListItem>(items: T[], itemHeight: number, containerHeight: number) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(startIndex + Math.ceil(containerHeight / itemHeight), items.length - 1)

    return {
      start: Math.max(0, startIndex - 5), // 5 item overscan
      end: Math.min(items.length - 1, endIndex + 5),
    }
  }, [scrollTop, itemHeight, containerHeight, items.length])

  const visibleItems = useMemo(() => items.slice(visibleRange.start, visibleRange.end + 1), [items, visibleRange])

  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.start * itemHeight

  return {
    visibleItems,
    visibleRange,
    totalHeight,
    offsetY,
    scrollTop,
    setScrollTop,
  }
}

/**
 * Memoized list item component to prevent unnecessary re-renders
 */
export const MemoizedListItem = React.memo<{
  children: React.ReactNode
  height: number
  index: number
}>(({ children, height, index }) => (
  <div style={{ height }} data-index={index} className="flex-shrink-0">
    {children}
  </div>
))

MemoizedListItem.displayName = 'MemoizedListItem'

/**
 * Auto-sizing virtualized list that calculates item heights dynamically
 */
interface AutoSizerProps {
  children: (size: { width: number; height: number }) => React.ReactNode
  className?: string
}

export function AutoSizer({ children, className = '' }: AutoSizerProps) {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current
        setSize({ width: clientWidth, height: clientHeight })
      }
    }

    updateSize()

    const resizeObserver = new ResizeObserver(updateSize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} className={`h-full w-full ${className}`}>
      {size.width > 0 && size.height > 0 && children(size)}
    </div>
  )
}

/**
 * Performance-optimized list with search and filtering
 */
interface OptimizedListProps<T extends VirtualListItem> {
  items: T[]
  itemHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  searchQuery?: string
  filterFn?: (item: T) => boolean
  className?: string
}

export function OptimizedList<T extends VirtualListItem>({
  items,
  itemHeight,
  renderItem,
  searchQuery = '',
  filterFn,
  className = '',
}: OptimizedListProps<T>) {
  /**
   * Memoized filtered and searched items
   */
  const filteredItems = useMemo(() => {
    let result = items

    // Apply filter function
    if (filterFn) {
      result = result.filter(filterFn)
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((item) => {
        // Assuming items have a searchable text property
        const searchText = JSON.stringify(item.data).toLowerCase()
        return searchText.includes(query)
      })
    }

    return result
  }, [items, filterFn, searchQuery])

  return (
    <AutoSizer className={className}>
      {({ height }) => (
        <VirtualizedList
          items={filteredItems}
          itemHeight={itemHeight}
          containerHeight={height}
          renderItem={renderItem}
          overscan={3}
        />
      )}
    </AutoSizer>
  )
}

/**
 * Debounced search hook for performance
 */
/**
 * Hook for debounced search with immediate input response
 * Returns both immediate value for input display and debounced value for filtering
 */
export function useDebouncedSearch(initialValue: string = '', delay: number = 300) {
  const [value, setValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return [debouncedValue, setValue, value] as const
}
