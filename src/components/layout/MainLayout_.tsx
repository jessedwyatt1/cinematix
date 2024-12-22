// src/components/layout/MainLayout.tsx
import StatusBar from './StatusBar'
import TorrentDetails from '@/features/torrents/details/TorrentDetails'
import { useTorrents } from '@/hooks/useTorrents'
import TorrentList from '../torrents/TorrentsList'

export default function MainLayout() {
  const { selectedIds } = useTorrents()

  // Show details panel when exactly one torrent is selected
  const detailsOpen = selectedIds.size === 1

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden bg-gradient-to-b from-background to-muted/50">
        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="rounded-xl border border-border/50 bg-gradient-to-b from-card to-card/95 shadow-lg">
            <TorrentList />
          </div>
        </div>

        {/* Details panel */}
        {detailsOpen && (
          <aside className="w-96 shrink-0 border-l border-border/50 bg-gradient-to-r from-card to-muted/50 shadow-lg">
            <TorrentDetails />
          </aside>
        )}
      </div>

      <StatusBar />
    </div>
  )
}