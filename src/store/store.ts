// src/store/store.ts
import { create } from 'zustand'
import { createSessionSlice, type SessionSlice } from './session'
import { createTorrentSlice, type TorrentSlice } from './torrents'
import { devtools } from 'zustand/middleware'

export interface StoreState extends SessionSlice, TorrentSlice {
  startPolling: () => () => void
}

export const useStore = create<StoreState>()(
  devtools(
    (...args) => {
      const store = {
        ...createSessionSlice(...args),
        ...createTorrentSlice(...args),
        startPolling: () => {
          const fetchData = () => {
            store.fetchSessionInfo()
            store.fetchSessionStats()
            store.fetchTorrents()
          }
          
          fetchData()
          const interval = setInterval(fetchData, 5000)
          return () => clearInterval(interval)
        }
      }
      return store
    },
    { name: 'TransmissionStore' }
  )
)