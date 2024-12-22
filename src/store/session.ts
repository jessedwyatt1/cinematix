// src/store/session.ts
import { StateCreator } from 'zustand'
import { SessionInfo, SessionStats } from '@/types/models'
import { client } from '@/lib/api/client'
import { StoreState } from './store'

export interface SessionSlice {
  sessionInfo: SessionInfo | null
  sessionStats: SessionStats | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchSessionInfo: () => Promise<void>
  fetchSessionStats: () => Promise<void>
  updateSessionSettings: (settings: Partial<SessionInfo>) => Promise<void>
}

// Type guard to check if an object matches SessionInfo interface
function isSessionInfo(obj: unknown): obj is SessionInfo {
  const info = obj as Partial<SessionInfo>
  return (
    typeof info === 'object' &&
    info !== null &&
    typeof info.version === 'string' &&
    (!('transmission-url' in info) || typeof info['transmission-url'] === 'string') &&
    (!('transmission-port' in info) || typeof info['transmission-port'] === 'number') &&
    (!('transmission-username' in info) || typeof info['transmission-username'] === 'string') &&
    (!('transmission-password' in info) || typeof info['transmission-password'] === 'string') &&
    (!('alt-speed-down' in info) || typeof info['alt-speed-down'] === 'number') &&
    (!('alt-speed-enabled' in info) || typeof info['alt-speed-enabled'] === 'boolean') &&
    (!('alt-speed-up' in info) || typeof info['alt-speed-up'] === 'number') &&
    (!('download-dir' in info) || typeof info['download-dir'] === 'string') &&
    (!('peer-port' in info) || typeof info['peer-port'] === 'number') &&
    (!('transmission-secure' in info) || typeof info['transmission-secure'] === 'boolean')
  )
}

// Type guard for SessionStats
function isSessionStats(obj: unknown): obj is SessionStats {
  const stats = obj as Partial<SessionStats>
  return (
    typeof stats === 'object' &&
    stats !== null &&
    typeof stats.activeTorrentCount === 'number' &&
    typeof stats.downloadSpeed === 'number' &&
    typeof stats.uploadSpeed === 'number' &&
    typeof stats.pausedTorrentCount === 'number' &&
    typeof stats.torrentCount === 'number' &&
    typeof stats['cumulative-stats'] === 'object' &&
    typeof stats['current-stats'] === 'object'
  )
}

// Type guard for transmission settings
function hasTransmissionSettings(settings: Partial<SessionInfo>): boolean {
  return (
    'transmission-url' in settings ||
    'transmission-port' in settings ||
    'transmission-username' in settings ||
    'transmission-password' in settings ||
    'transmission-secure' in settings
  );
}

export const createSessionSlice: StateCreator<
  StoreState,
  [],
  [],
  SessionSlice
> = (set, get) => ({
  sessionInfo: null,
  sessionStats: null,
  loading: false,
  error: null,

  fetchSessionInfo: async () => {
    set({ loading: true, error: null })
    try {
      const response = await client.getSession([
        'alt-speed-down',
        'alt-speed-enabled',
        'alt-speed-up',
        'alt-speed-time-enabled',
        'alt-speed-time-begin',
        'alt-speed-time-end',
        'download-dir',
        'download-queue-enabled',
        'download-queue-size',
        'peer-port',
        'peer-port-random-on-start',
        'port-forwarding-enabled',
        'queue-stalled-enabled',
        'queue-stalled-minutes',
        'rename-partial-files',
        'seed-queue-enabled',
        'seed-queue-size',
        'speed-limit-down',
        'speed-limit-down-enabled',
        'speed-limit-up',
        'speed-limit-up-enabled',
        'transmission-url',
        'transmission-port',
        'transmission-username',
        'transmission-password',
        'version'
      ])
      
      if (response.arguments && isSessionInfo(response.arguments)) {
        set({ sessionInfo: response.arguments, loading: false })
      } else {
        throw new Error('Invalid session info response')
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error', 
        loading: false 
      })
    }
  },

  fetchSessionStats: async () => {
    try {
      const response = await client.getSessionStats()
      if (response.result === 'success' && response.arguments && isSessionStats(response.arguments)) {
        set({ sessionStats: response.arguments })
      } else {
        throw new Error('Invalid session stats response')
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  },

  updateSessionSettings: async (settings) => {
    try {
      const currentInfo = get().sessionInfo
      if (!currentInfo) throw new Error('No session info available')

      // Update local state optimistically
      set({ 
        sessionInfo: { ...currentInfo, ...settings },
        error: null
      })

      // Update client if transmission settings changed
      if (hasTransmissionSettings(settings)) {
        client.updateSettings({
          url: (settings['transmission-url'] ?? currentInfo['transmission-url']),
          port: (settings['transmission-port'] ?? currentInfo['transmission-port']),
          username: (settings['transmission-username'] ?? currentInfo['transmission-username']),
          password: (settings['transmission-password'] ?? currentInfo['transmission-password'])
        })
      }

      // Send the update to the server
      await client.setSession(settings)
      
      // Fetch fresh session info
      await get().fetchSessionInfo()
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  },
})