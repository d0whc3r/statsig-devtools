import { AlertTriangle, CheckCircle, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Badge } from '@/src/components/ui/Badge/Badge'
import { useConnection } from '@/src/hooks/useConnection'
import { useDashboardStore } from '@/src/stores/dashboard-store'
import { Logger } from '@/src/utils/logger'

const logger = new Logger('ScriptStatusBadge')

type ScriptStatus = 'loading' | 'not-injected' | 'injected' | 'error'

/**
 * Component that displays the status of the injected script
 */
export function ScriptStatusBadge() {
  const { connectionStatus } = useConnection()
  const { activeTab } = useDashboardStore()
  const [status, setStatus] = useState<ScriptStatus>('loading')

  useEffect(() => {
    if (!activeTab?.id) {
      setStatus('not-injected')
      return
    }

    if (!connectionStatus.isReady) {
      setStatus('not-injected')
      return
    }

    // Simple ping to verify script is actually working
    const verifyScript = async () => {
      try {
        // Quick verification that the script responds
        const response = await chrome.tabs.sendMessage(activeTab.id, {
          type: 'PING',
        })

        if (response?.success) {
          setStatus('injected')
        } else {
          setStatus('error')
        }
      } catch (error) {
        logger.warn('Script verification failed:', error)
        setStatus('error')
      }
    }

    verifyScript()
  }, [connectionStatus.isReady, activeTab?.id])

  const getBadgeConfig = () => {
    switch (status) {
      case 'loading':
        return {
          variant: 'outline' as const,
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: 'Checking script...',
        }
      case 'not-injected':
        return {
          variant: 'destructive' as const,
          icon: <X className="h-3 w-3" />,
          text: 'Script not injected',
        }
      case 'error':
        return {
          variant: 'warning' as const,
          icon: <AlertTriangle className="h-3 w-3" />,
          text: 'Script error',
        }
      case 'injected':
        return {
          variant: 'success' as const,
          icon: <CheckCircle className="h-3 w-3" />,
          text: 'Script injected',
        }
    }
  }

  const config = getBadgeConfig()

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {config.icon}
      {config.text}
    </Badge>
  )
}
