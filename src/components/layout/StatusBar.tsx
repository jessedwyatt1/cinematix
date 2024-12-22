// src/components/layout/StatusBar.tsx
import { Circle, HardDrive } from 'lucide-react'
import { useSession } from '@/hooks/useSession'

export default function StatusBar() {
  const { sessionInfo, sessionStats, error } = useSession()

  // Format bytes to appropriate unit
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  // Calculate cumulative transfer
  const downloadedTotal = sessionStats?.['cumulative-stats'].downloadedBytes || 0
  const uploadedTotal = sessionStats?.['cumulative-stats'].uploadedBytes || 0
  const ratio = downloadedTotal ? (uploadedTotal / downloadedTotal).toFixed(2) : '0.00'

  return (
    <footer className="flex h-8 items-center justify-between border-t border-border bg-card px-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-4">
        {/* Connection status */}
        <div className="flex items-center gap-2">
          <Circle 
            className={`h-2 w-2 ${error ? 'text-destructive' : 'text-emerald-500'}`} 
            fill="currentColor" 
          />
          <span>
            {error ? 'Disconnected' : 'Connected to localhost:9091'}
          </span>
        </div>

        {/* Version info */}
        <div>
          {sessionInfo?.version || 'Unknown version'}
        </div>
      </div>

      {/* Transfer stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4" />
          <span>Ratio: {ratio}</span>
        </div>
        <div>
          ↓ {formatBytes(downloadedTotal)}
        </div>
        <div>
          ↑ {formatBytes(uploadedTotal)}
        </div>
      </div>
    </footer>
  )
}