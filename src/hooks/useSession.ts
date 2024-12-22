// src/hooks/useSession.ts
import { useStore } from '@/store/store'
import type { SessionInfo, SessionStats } from '@/types/models'

export function useSession() {
  const sessionInfo = useStore<SessionInfo | null>((state) => state.sessionInfo)
  const sessionStats = useStore<SessionStats | null>((state) => state.sessionStats)
  const error = useStore((state) => state.error)
  const loading = useStore((state) => state.loading)
  const updateSessionSettings = useStore((state) => state.updateSessionSettings)

  return {
    sessionInfo,
    sessionStats,
    error,
    loading,
    updateSessionSettings
  }
}