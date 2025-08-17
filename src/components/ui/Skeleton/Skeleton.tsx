import { cn } from '@/src/utils/cn'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn('bg-muted animate-pulse rounded-md', className)} {...props} />
}
