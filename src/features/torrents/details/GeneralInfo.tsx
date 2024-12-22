import { Download, Upload, HardDrive, Users } from 'lucide-react'
import type { Torrent } from '@/types/models'
import { formatBytes } from '@/utils/formatters'

interface GeneralInfoProps {
  torrent: Torrent
}

export default function GeneralInfo({ torrent }: GeneralInfoProps) {
  return (
    <div className="space-y-6">
      {/* Transfer Rates */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Transfer Rates</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-green-500" />
              <span>Download</span>
            </div>
            <div className="text-xl font-medium">
              {formatBytes(torrent.rateDownload)}/s
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-500" />
              <span>Upload</span>
            </div>
            <div className="text-xl font-medium">
              {formatBytes(torrent.rateUpload)}/s
            </div>
          </div>
        </div>
      </div>

      {/* Peers */}
      <div>
        <h3 className="mb-2 flex items-center gap-2 font-medium">
          <Users className="h-4 w-4" />
          Connected Peers
        </h3>
        <div className="grid gap-4 rounded-lg border border-border p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Connected</div>
              <div className="text-2xl font-medium">
                {torrent.peersConnected}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Swarm Size</div>
              <div className="text-2xl font-medium">
                {torrent.trackerStats.reduce((sum, tracker) => 
                  sum + tracker.seederCount + tracker.leecherCount, 0
                )}
              </div>
            </div>
          </div>
          
          {/* Download sources */}
          <div>
            <div className="mb-1 text-sm text-muted-foreground">Sources</div>
            <div className="space-y-2">
              {torrent.peers.map(peer => (
                <div 
                  key={`${peer.address}:${peer.port}`}
                  className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      peer.isDownloadingFrom ? 'bg-emerald-500' : 'bg-muted-foreground'
                    }`} />
                    <span>{peer.clientName || 'Unknown Client'}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {formatBytes(peer.rateToClient)}/s
                  </div>
                </div>
              )).slice(0, 5)}
            </div>
          </div>
        </div>
      </div>

      {/* Storage */}
      <div>
        <h3 className="mb-2 flex items-center gap-2 font-medium">
          <HardDrive className="h-4 w-4" />
          Storage
        </h3>
        <div className="space-y-4 rounded-lg border border-border p-4">
          <div>
            <div className="text-sm text-muted-foreground">Location</div>
            <div className="mt-1 rounded-md bg-muted/50 px-3 py-2 font-medium">
              {torrent.downloadDir}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Size</div>
              <div className="text-xl font-medium">
                {formatBytes(torrent.totalSize)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Downloaded</div>
              <div className="text-xl font-medium">
                {formatBytes(torrent.downloadedEver)}
              </div>
            </div>
          </div>
          
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {(torrent.percentDone * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${torrent.percentDone * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}