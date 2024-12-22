// src/features/torrents/details/PeersList.tsx
import { Users, Upload, Download, Lock, Globe } from 'lucide-react'
import type { Torrent } from '@/types/models'
import { formatBytes } from '@/utils/formatters'

interface PeersListProps {
  torrent: Torrent
}

export default function PeersList({ torrent }: PeersListProps) {
  // Calculate aggregate stats
  const totalDownload = torrent.peers.reduce(
    (sum, peer) => sum + peer.rateToClient,
    0
  )
  const totalUpload = torrent.peers.reduce(
    (sum, peer) => sum + peer.rateToPeer,
    0
  )
  const encryptedCount = torrent.peers.filter(
    peer => peer.isEncrypted
  ).length
  
  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 rounded-lg border border-border p-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            Connected
          </div>
          <div className="text-2xl font-medium">
            {torrent.peers.length}
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Download className="h-4 w-4" />
            Downloading
          </div>
          <div className="text-2xl font-medium">
            {formatBytes(totalDownload)}/s
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Upload className="h-4 w-4" />
            Uploading
          </div>
          <div className="text-2xl font-medium">
            {formatBytes(totalUpload)}/s
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            Encrypted
          </div>
          <div className="text-2xl font-medium">
            {encryptedCount}
          </div>
        </div>
      </div>

      {/* Peers table */}
      <div className="rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                  Client
                </th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                  Flags
                </th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">
                  Download
                </th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">
                  Upload
                </th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {torrent.peers.map((peer) => (
                <tr key={`${peer.address}:${peer.port}`}>
                  <td className="p-3">
                    <div>
                      <div className="font-medium">
                        {peer.clientName || 'Unknown Client'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        {peer.address}:{peer.port}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {peer.isEncrypted && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                          🔒 Encrypted
                        </span>
                      )}
                      {peer.isUTP && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                          µTP
                        </span>
                      )}
                      {peer.isIncoming && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                          Incoming
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="font-medium text-emerald-500">
                      {formatBytes(peer.rateToClient)}/s
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="font-medium text-blue-500">
                      {formatBytes(peer.rateToPeer)}/s
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24">
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${peer.progress * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {(peer.progress * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}