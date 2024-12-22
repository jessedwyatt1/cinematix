// src/hooks/useTorrents.ts
import { useStore } from '@/store/store'
import type { Torrent } from '@/types/models'

interface TorrentFilter {
  status?: number
  text?: string
  labels?: string[]
}

export function useTorrents() {
  const torrents = useStore<Map<number, Torrent>>((state) => state.torrents)
  const selectedIds = useStore<Set<number>>((state) => state.selectedIds)
  const filter = useStore<TorrentFilter>((state) => state.filter)
  const loading = useStore((state) => state.loading)
  const error = useStore((state) => state.error)
  
  const addTorrent = useStore((state) => state.addTorrent)
  const removeTorrents = useStore((state) => state.removeTorrents)
  const startTorrents = useStore((state) => state.startTorrents)
  const stopTorrents = useStore((state) => state.stopTorrents)
  const setFilter = useStore((state) => state.setFilter)
  const setSelected = useStore((state) => state.setSelected)
  const clearSelected = useStore((state) => state.clearSelected)

  // Apply filters to torrents
  const filteredTorrents = Array.from(torrents.values()).filter(torrent => {
    // Status filter
    if (filter.status !== undefined && torrent.status !== filter.status) {
      return false
    }

    // Text search filter
    if (filter.text) {
      const searchText = filter.text.toLowerCase()
      if (!torrent.name.toLowerCase().includes(searchText)) {
        return false
      }
    }

    // Labels filter
    if (filter.labels && filter.labels.length > 0) {
      if (!filter.labels.some(label => torrent.labels.includes(label))) {
        return false
      }
    }

    return true
  })

  // Create a map of displayed torrent indices for selection handling
  const torrentIndexMap = new Map(
    filteredTorrents.map((torrent, index) => [torrent.id, index])
  )

  return {
    torrents: filteredTorrents,
    selectedIds,
    filter,
    loading,
    error,
    addTorrent,
    removeTorrents,
    startTorrents,
    stopTorrents,
    setFilter,
    setSelected,
    clearSelected,
    // Add helper method for selection
    getDisplayIndex: (id: number) => torrentIndexMap.get(id),
    torrentIndexMap,
    filteredTorrents
  }
}
