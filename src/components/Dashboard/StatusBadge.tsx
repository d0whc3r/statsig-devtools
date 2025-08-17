import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'

import { Badge } from '@/src/components/ui/Badge/Badge'
import { cn } from '@/src/utils/cn'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'default'
}

export function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'running':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    const iconSize = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'

    switch (status) {
      case 'active':
      case 'running':
        return <CheckCircle className={iconSize} />
      case 'inactive':
      case 'paused':
        return <AlertCircle className={iconSize} />
      case 'completed':
        return <CheckCircle className={iconSize} />
      case 'draft':
        return <Clock className={iconSize} />
      default:
        return <XCircle className={iconSize} />
    }
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center gap-1',
        size === 'sm' ? 'h-4 px-1.5 text-xs' : 'text-xs',
        getStatusColor(status),
      )}
    >
      {getStatusIcon(status)}
      <span className={size === 'sm' ? 'text-xs' : ''}>{status}</span>
    </Badge>
  )
}
