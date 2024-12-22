// src/hooks/useWebSocket.ts
import { useEffect, useRef } from 'react'
import { useStore } from '@/store/store'

interface WebSocketMessage {
  type: 'torrent-changed' | 'session-changed'
  data: unknown
}

export function useWebSocket(url: string) {
  const ws = useRef<WebSocket>()
  const store = useStore()
  
  useEffect(() => {
    ws.current = new WebSocket(url)
    
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data) as WebSocketMessage
      
      switch (message.type) {
        case 'torrent-changed':
          store.fetchTorrents()
          break
        case 'session-changed':
          store.fetchSessionStats()
          break
      }
    }
    
    return () => {
      ws.current?.close()
    }
  }, [store, url])

  return ws.current
}