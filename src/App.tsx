// src/App.tsx
import { useState, useEffect } from 'react'
import { useStore } from '@/store/store'
import { AnimatePresence, motion } from 'framer-motion'
import { useSession } from '@/hooks/useSession'
import { useTorrents } from '@/hooks/useTorrents'
import { client } from '@/lib/api/client'
import { configManager } from '@/lib/config'
import Header from '@/components/layout/Header'
import StatusBar from '@/components/layout/StatusBar'
import TorrentsList from '@/components/torrents/TorrentsList'
import TorrentDetails from '@/features/torrents/details/TorrentDetails'
import InitializationDialog from '@/components/InitializationDialog'
import Toast from '@/components/Toast'
import SettingsDialog from '@/features/settings/SettingsDialog'

function App() {
  const startPolling = useStore(state => state.startPolling)
  const { error } = useSession()
  const { selectedIds } = useTorrents()
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const detailsOpen = selectedIds.size === 1;

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true)
      try {
        // Check if we have saved configuration
        const initialized = await configManager.isInitialized()
        const config = await configManager.getConfig()

        if (initialized && config) {
          try {
            // Update client with saved settings
            const fullUrl = `${config.isSecure ? 'https' : 'http'}://${config.url}:${config.port}/transmission/rpc`
            client.updateSettings({
              url: fullUrl,
              port: config.port,
              username: config.username,
              password: config.password
            })

            // Test connection
            const response = await client.getSession()
            if (response.result === 'success') {
              setIsInitialized(true)
              
              // Start polling for updates
              const stopPolling = startPolling()
              return () => stopPolling()
            } else {
              throw new Error('Failed to connect with saved configuration')
            }
          } catch (error) {
            console.error('Failed to initialize client:', error)
            // If initialization fails, clear config and show init dialog
            await configManager.clearConfig()
            setToastMessage('Failed to connect with saved configuration')
            setIsInitialized(false)
          }
        } else {
          setIsInitialized(false)
        }
      } catch (error) {
        console.error('Failed to initialize:', error)
        setIsInitialized(false)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [startPolling])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isInitialized) {
    return <InitializationDialog />
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Connection Error</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <div className="mt-4 space-y-2">
            <button
              onClick={async () => {
                await configManager.clearConfig()
                window.location.reload()
              }}
              className="w-full rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground"
            >
              Reset Configuration
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Update Settings
            </button>
          </div>
        </div>
        {showSettings && (
          <SettingsDialog 
            isOpen={true}
            onClose={() => {
              setShowSettings(false)
              window.location.reload()
            }} 
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background p-4 space-y-4">
      <Header />
      <main className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex flex-1 overflow-hidden rounded-xl border border-border/50 bg-card shadow-lg">
          <div className="flex-1 overflow-auto">
            <TorrentsList />
          </div>

          <AnimatePresence>
            {detailsOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 384, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="border-l border-border/50 bg-card-elevated"
              >
                <div className="w-96 h-full">
                  <TorrentDetails />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <StatusBar />

      {toastMessage && (
        <Toast 
          message={toastMessage} 
          onClose={() => setToastMessage(null)} 
        />
      )}
    </div>
  )
}

export default App