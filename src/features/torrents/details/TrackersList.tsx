// src/features/torrents/details/TrackersList.tsx
import { Signal, Users, Clock, AlertCircle } from 'lucide-react'
import type { Torrent } from '@/types/models'
import { formatRelativeTime } from '@/utils/formatters'

interface TrackersListProps {
  torrent: Torrent
}

export default function TrackersList({ torrent }: TrackersListProps) {
  // Group trackers by tier
  const trackersByTier = torrent.trackerStats.reduce((acc, tracker) => {
    const tier = tracker.tier
    if (!acc[tier]) {
      acc[tier] = []
    }
    acc[tier].push(tracker)
    return acc
  }, {} as Record<number, typeof torrent.trackerStats>)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 rounded-lg border border-border p-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Signal className="h-4 w-4" />
            Active Trackers
          </div>
          <div className="text-2xl font-medium">
            {torrent.trackerStats.filter(t => 
              t.lastAnnounceSucceeded
            ).length}
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            Total Peers
          </div>
          <div className="text-2xl font-medium">
            {torrent.trackerStats.reduce((sum, t) => 
              sum + t.lastAnnouncePeerCount, 0
            )}
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Next Update
          </div>
          <div className="text-2xl font-medium">
            {Math.min(...torrent.trackerStats
              .filter(t => t.nextAnnounceTime > 0)
              .map(t => t.nextAnnounceTime - Date.now()/1000)
            ).toFixed(0)}s
          </div>
        </div>
      </div>

      {/* Trackers by tier */}
      <div className="space-y-4">
        {Object.entries(trackersByTier).map(([tier, trackers]) => (
          <div key={tier} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Tier {parseInt(tier) + 1}
            </h3>
            
            <div className="rounded-lg border border-border divide-y divide-border">
              {trackers.map(tracker => (
                <div 
                  key={tracker.id}
                  className="p-4 space-y-4"
                >
                  {/* Tracker header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {tracker.host}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {tracker.announce}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {tracker.lastAnnounceSucceeded ? (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                          <Signal className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          {tracker.lastAnnounceResult || 'Error'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tracker stats */}
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Last Contact</div>
                      <div className="font-medium">
                        {tracker.lastAnnounceTime
                          ? formatRelativeTime(tracker.lastAnnounceTime)
                          : 'Never'
                        }
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-muted-foreground">Next Update</div>
                      <div className="font-medium">
                        {tracker.nextAnnounceTime
                          ? formatRelativeTime(tracker.nextAnnounceTime)
                          : 'Unknown'
                        }
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-muted-foreground">Seeders</div>
                      <div className="font-medium">
                        {tracker.seederCount}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-muted-foreground">Leechers</div>
                      <div className="font-medium">
                        {tracker.leecherCount}
                      </div>
                    </div>
                  </div>

                  {/* Error message if any */}
                  {!tracker.lastAnnounceSucceeded && tracker.lastAnnounceResult && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      {tracker.lastAnnounceResult}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}