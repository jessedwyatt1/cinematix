// src/store/torrents.ts
import { StateCreator } from 'zustand'
import { Torrent } from '@/types/models'
import { client, AddTorrentArgs } from '@/lib/api/client'

export interface TorrentSlice {
  torrents: Map<number, Torrent>
  selectedIds: Set<number>
  filter: {
    status?: number
    text?: string
    labels?: string[]
  }
  loading: boolean
  error: string | null
  
  // Actions
  fetchTorrents: () => Promise<void>
  addTorrent: (args: AddTorrentArgs) => Promise<void>
  removeTorrents: (ids: number[], deleteData: boolean) => Promise<void>
  startTorrents: (ids: number[]) => Promise<void>
  stopTorrents: (ids: number[]) => Promise<void>
  setFilter: (filter: TorrentSlice['filter']) => void
  setSelected: (ids: number[]) => void
  clearSelected: () => void
}

export const createTorrentSlice: StateCreator<
  TorrentSlice,
  [],
  [],
  TorrentSlice
> = (set, get) => ({
  torrents: new Map(),
  selectedIds: new Set(),
  filter: {},
  loading: false,
  error: null,

  fetchTorrents: async () => {
    set({ loading: true, error: null })
    try {
      const fields = [
        'id', 'name', 'status', 'totalSize', 'percentDone',
        'downloadedEver', 'uploadedEver', 'rateDownload', 'rateUpload',
        'peersConnected', 'eta', 'queuePosition', 'error', 'errorString',
        'addedDate', 'downloadDir', 'isFinished', 'isStalled', 'labels',
        'files', 'fileStats', 'peers', 'trackerStats'
      ]
      const response = await client.getTorrents(fields)
      if (response.arguments?.torrents) {
        const torrentsMap = new Map(
          (response.arguments.torrents as Torrent[]).map(t => [t.id, t])
        )
        set({ torrents: torrentsMap, loading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  addTorrent: async (args) => {
    try {
      await client.addTorrent(args)
      get().fetchTorrents()
    } catch (error) {
      set((state) => ({ 
        error: (error as Error).message,
        torrents: state.torrents 
      }))
    }
  },

  removeTorrents: async (ids, deleteData) => {
    try {
      await client.removeTorrent(ids, deleteData)
      const torrents = get().torrents
      ids.forEach(id => torrents.delete(id))
      set({ torrents: new Map(torrents) })
    } catch (error) {
      set((state) => ({ 
        error: (error as Error).message,
        torrents: state.torrents
      }))
    }
  },

  startTorrents: async (ids) => {
    try {
      await client.startTorrent(ids)
      get().fetchTorrents()
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  stopTorrents: async (ids) => {
    try {
      await client.stopTorrent(ids)
      get().fetchTorrents()
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  setFilter: (filter) => set({ filter }),
  setSelected: (ids) => set({ selectedIds: new Set(ids) }),
  clearSelected: () => set({ selectedIds: new Set() }),
})