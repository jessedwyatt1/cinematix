// src/components/layout/Header.tsx
import { useState, useCallback, useMemo } from 'react'
import { 
  Settings, 
  Zap,
  Plus
} from 'lucide-react'
import { useSession } from '@/hooks/useSession'
import AddTorrent from '@/features/torrents/AddTorrent'
import MovieSearchBar from '@/components/movies/MovieSearchBar'
import SettingsDialog from '@/features/settings/SettingsDialog'
import { APP_VERSION } from '@/lib/constants'

export default function Header() {
  const [addTorrentOpen, setAddTorrentOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { sessionInfo, updateSessionSettings } = useSession()

  // Use useMemo for derived state instead of useEffect + useState
  const speedLimitEnabled = useMemo(() => 
    !(sessionInfo?.['speed-limit-down-enabled'] ?? false),
    [sessionInfo]
  )

  const toggleSpeedLimit = useCallback(async () => {
    if (!sessionInfo) return
    
    const newState = !speedLimitEnabled
    
    try {
      await updateSessionSettings({
        'speed-limit-down-enabled': !newState,
        'speed-limit-up-enabled': !newState
      })
    } catch (error) {
      console.error('Failed to update speed limit:', error)
    }
  }, [sessionInfo, speedLimitEnabled, updateSessionSettings])

  return (
    <header className="rounded-xl border border-border/50 overflow-hidden shadow-lg">
      {/* Main header content */}
      <div className="bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">Cinematix</h1>
            <span className="text-xs text-muted-foreground">v{APP_VERSION}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSpeedLimit}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  speedLimitEnabled ? 'bg-blue-600' : 'bg-blue-200'
                }`}
                role="switch"
                aria-checked={speedLimitEnabled}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full bg-white transition-transform ${
                    speedLimitEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                >
                  <Zap className="h-3 w-3 text-gray-600" />
                </span>
              </button>
            </div>

            <MovieSearchBar />

            <button
              onClick={() => setAddTorrentOpen(true)}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Torrent
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700 shadow-sm"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Torrent Dialog */}
      <AddTorrent 
        isOpen={addTorrentOpen} 
        onClose={() => setAddTorrentOpen(false)} 
      />

      <SettingsDialog
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </header>
  )
}