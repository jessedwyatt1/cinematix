import { useState, useEffect } from 'react'
import {
  Settings,
  Download,
  Upload,
  Clock,
  Network,
  HardDrive,
  X,
  FolderOpen,
  RefreshCw
} from 'lucide-react'
import { useSession } from '@/hooks/useSession'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SessionInfo } from '@/types/session'
import Toast from '@/components/Toast'
import { configManager } from '@/lib/config'

const formatMinutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

const parseTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours * 60) + minutes
}

export default function SettingsDialog({ isOpen, onClose }: {
  isOpen: boolean
  onClose: () => void
}) {
  const { sessionInfo, updateSessionSettings } = useSession()
  const [activeTab, setActiveTab] = useState('speed')
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<SessionInfo | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Update settings only when dialog opens
  useEffect(() => {
    if (isOpen && sessionInfo) {
      // Get the saved config to use as fallback values
      configManager.getConfig().then(config => {
        setSettings({
          ...sessionInfo,
          'transmission-secure': config?.isSecure || false,
          'transmission-url': sessionInfo['transmission-url'] || config?.url || 'localhost',
          'transmission-port': sessionInfo['transmission-port'] || config?.port || 9091,
          'transmission-username': sessionInfo['transmission-username'] || config?.username || '',
          'transmission-password': sessionInfo['transmission-password'] || config?.password || ''
        })
      })
    }
  }, [isOpen, sessionInfo])

  // Don't render anything if we don't have settings yet
  if (!isOpen || !settings) return null

  const handleSave = async () => {
    if (!settings) return
    
    setIsSaving(true)
    try {
      await updateSessionSettings(settings)
      setToastMessage("Settings saved successfully.")
      onClose()
    } catch (error) {
      console.error('Failed to save settings:', error)
      setToastMessage("Error saving settings. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSettingChange = <K extends keyof SessionInfo>(
    key: K,
    value: SessionInfo[K]
  ) => {
    if (!settings) return
    
    setSettings({
      ...settings,
      [key]: value
    })
  }

  const handleResetConfig = async () => {
    if (window.confirm('Are you sure you want to reset all configuration? This will close the application.')) {
      try {
        await configManager.clearConfig();
        window.location.reload();
      } catch (error) {
        console.error('Failed to reset config:', error);
        setToastMessage('Failed to reset configuration');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      {/* Slightly lighten the background of the dialog */}
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card/90 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content with a minimum height to prevent resizing on tab change */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4 min-h-[500px]">
          <TabsList>
            <TabsTrigger value="speed" className="gap-2">
              <Download className="h-4 w-4" />
              Speed
            </TabsTrigger>
            <TabsTrigger value="queue" className="gap-2">
              <Clock className="h-4 w-4" />
              Queue
            </TabsTrigger>
            <TabsTrigger value="network" className="gap-2">
              <Network className="h-4 w-4" />
              Network
            </TabsTrigger>
            <TabsTrigger value="storage" className="gap-2">
              <HardDrive className="h-4 w-4" />
              Storage
            </TabsTrigger>
            <TabsTrigger value="transmission" className="gap-2">
              <Settings className="h-4 w-4" />
              Transmission
            </TabsTrigger>
          </TabsList>

          {/* Speed Settings */}
          <TabsContent value="speed" className="space-y-6">
            <div>
              <h3 className="mb-4 font-medium">Speed Limits</h3>
              
              <div className="space-y-4">
                {/* Download limit */}
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    id="speed-limit-down"
                    className="mt-1 h-4 w-4 rounded border-input"
                    checked={settings['speed-limit-down-enabled']}
                    onChange={(e) => handleSettingChange('speed-limit-down-enabled', e.target.checked)}
                  />
                  <div className="flex-1">
                    <label htmlFor="speed-limit-down" className="text-sm font-medium">
                      Download speed limit
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        value={settings['speed-limit-down']}
                        onChange={(e) => handleSettingChange('speed-limit-down', parseInt(e.target.value))}
                        disabled={!settings['speed-limit-down-enabled']}
                        className="w-24 rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                      />
                      <span className="text-sm text-muted-foreground">KB/s</span>
                    </div>
                  </div>
                </div>

                {/* Upload limit */}
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    id="speed-limit-up"
                    className="mt-1 h-4 w-4 rounded border-input"
                    checked={settings['speed-limit-up-enabled']}
                    onChange={(e) => handleSettingChange('speed-limit-up-enabled', e.target.checked)}
                  />
                  <div className="flex-1">
                    <label htmlFor="speed-limit-up" className="text-sm font-medium">
                      Upload speed limit
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        value={settings['speed-limit-up']}
                        onChange={(e) => handleSettingChange('speed-limit-up', parseInt(e.target.value))}
                        disabled={!settings['speed-limit-up-enabled']}
                        className="w-24 rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                      />
                      <span className="text-sm text-muted-foreground">KB/s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-medium">Alternative Speed Limits</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    id="alt-speed-enabled"
                    className="mt-1 h-4 w-4 rounded border-input"
                    checked={settings['alt-speed-enabled']}
                    onChange={(e) => handleSettingChange('alt-speed-enabled', e.target.checked)}
                  />
                  <div className="flex-1 space-y-4">
                    <div>
                      <label htmlFor="alt-speed-enabled" className="text-sm font-medium">
                        Enable alternative speed limits
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Alternative speeds will be used during scheduled times
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Download limit</label>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="number"
                            value={settings['alt-speed-down']}
                            onChange={(e) => handleSettingChange('alt-speed-down', parseInt(e.target.value))}
                            disabled={!settings['alt-speed-enabled']}
                            className="w-24 rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                          />
                          <span className="text-sm text-muted-foreground">KB/s</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Upload limit</label>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="number"
                            value={settings['alt-speed-up']}
                            onChange={(e) => handleSettingChange('alt-speed-up', parseInt(e.target.value))}
                            disabled={!settings['alt-speed-enabled']}
                            className="w-24 rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                          />
                          <span className="text-sm text-muted-foreground">KB/s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {settings['alt-speed-enabled'] && (
              <div className="mt-4">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    id="alt-speed-time-enabled"
                    className="mt-1 h-4 w-4 rounded border-input"
                    checked={settings['alt-speed-time-enabled']}
                    onChange={(e) => handleSettingChange('alt-speed-time-enabled', e.target.checked)}
                  />
                  <div className="flex-1">
                    <label htmlFor="alt-speed-time-enabled" className="text-sm font-medium">
                      Schedule alternative speeds
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Start time</label>
                        <input
                          type="time"
                          value={formatMinutesToTime(settings['alt-speed-time-begin'])}
                          onChange={(e) => handleSettingChange('alt-speed-time-begin', parseTimeToMinutes(e.target.value))}
                          disabled={!settings['alt-speed-time-enabled']}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">End time</label>
                        <input
                          type="time"
                          value={formatMinutesToTime(settings['alt-speed-time-end'])}
                          onChange={(e) => handleSettingChange('alt-speed-time-end', parseTimeToMinutes(e.target.value))}
                          disabled={!settings['alt-speed-time-enabled']}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Queue Settings */}
          <TabsContent value="queue" className="space-y-6">
            <div>
              <h3 className="mb-4 font-medium">Download Queue</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    id="download-queue-enabled"
                    className="mt-1 h-4 w-4 rounded border-input"
                    checked={settings['download-queue-enabled']}
                    onChange={(e) => handleSettingChange('download-queue-enabled', e.target.checked)}
                  />
                  <div className="flex-1">
                    <label htmlFor="download-queue-enabled" className="text-sm font-medium">
                      Download queue size
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        value={settings['download-queue-size']}
                        onChange={(e) => handleSettingChange('download-queue-size', parseInt(e.target.value))}
                        disabled={!settings['download-queue-enabled']}
                        className="w-24 rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                      />
                      <span className="text-sm text-muted-foreground">torrents</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-medium">Seed Queue</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    id="seed-queue-enabled"
                    className="mt-1 h-4 w-4 rounded border-input"
                    checked={settings['seed-queue-enabled']}
                    onChange={(e) => handleSettingChange('seed-queue-enabled', e.target.checked)}
                  />
                  <div className="flex-1">
                    <label htmlFor="seed-queue-enabled" className="text-sm font-medium">
                      Seed queue size
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        value={settings['seed-queue-size']}
                        onChange={(e) => handleSettingChange('seed-queue-size', parseInt(e.target.value))}
                        disabled={!settings['seed-queue-enabled']}
                        className="w-24 rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                      />
                      <span className="text-sm text-muted-foreground">torrents</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-medium">Stalled Torrents</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    id="queue-stalled-enabled"
                    className="mt-1 h-4 w-4 rounded border-input"
                    checked={settings['queue-stalled-enabled']}
                    onChange={(e) => handleSettingChange('queue-stalled-enabled', e.target.checked)}
                  />
                  <div className="flex-1">
                    <label htmlFor="queue-stalled-enabled" className="text-sm font-medium">
                      Consider torrents stalled when inactive for
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        value={settings['queue-stalled-minutes']}
                        onChange={(e) => handleSettingChange('queue-stalled-minutes', parseInt(e.target.value))}
                        disabled={!settings['queue-stalled-enabled']}
                        className="w-24 rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                      />
                      <span className="text-sm text-muted-foreground">minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Network Settings */}
          <TabsContent value="network" className="space-y-6">
            <div>
              <h3 className="mb-4 font-medium">Peer Port</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Peer listening port</label>
                  <div className="mt-1 flex items-center gap-4">
                    <input
                      type="number"
                      value={settings['peer-port']}
                      onChange={(e) => handleSettingChange('peer-port', parseInt(e.target.value))}
                      className="w-32 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    />
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="peer-port-random"
                        checked={settings['peer-port-random-on-start']}
                        onChange={(e) => handleSettingChange('peer-port-random-on-start', e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-input"
                      />
                      <div>
                        <label htmlFor="peer-port-random" className="text-sm font-medium">
                          Randomize port on launch
                        </label>
                        <p className="text-sm text-muted-foreground">
                          When enabled, a random port will be chosen each time the application starts.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    id="port-forwarding"
                    checked={settings['port-forwarding-enabled']}
                    onChange={(e) => handleSettingChange('port-forwarding-enabled', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-input"
                  />
                  <div>
                    <label htmlFor="port-forwarding" className="text-sm font-medium">
                      Enable port forwarding via UPnP/NAT-PMP
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Automatically configure your router to allow incoming connections
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Storage Settings */}
          <TabsContent value="storage" className="space-y-6">
            <div>
              <h3 className="mb-4 font-medium">Download Location</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Default download directory</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={settings['download-dir']}
                      onChange={(e) => handleSettingChange('download-dir', e.target.value)}
                      className="flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    />
                    <button className="rounded-md border border-input p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                      <FolderOpen className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    id="rename-partial"
                    checked={settings['rename-partial-files']}
                    onChange={(e) => handleSettingChange('rename-partial-files', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-input"
                  />
                  <div>
                    <label htmlFor="rename-partial" className="text-sm font-medium">
                      Append ".part" to incomplete files
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Add .part extension to files while they are downloading
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </TabsContent>

          {/* Transmission Settings */}
          <TabsContent value="transmission" className="space-y-6">
            <div>
              <h3 className="mb-4 font-medium">Transmission Connection Settings</h3>
              
              <div className="space-y-4">
                {/* Host */}
                <div>
                  <label className="text-sm font-medium">Host</label>
                  <input
                    type="text"
                    value={settings['transmission-url']}
                    onChange={(e) => handleSettingChange('transmission-url', e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="localhost"
                  />
                </div>

                {/* Port */}
                <div>
                  <label className="text-sm font-medium">Port</label>
                  <input
                    type="number"
                    value={settings['transmission-port']}
                    onChange={(e) => handleSettingChange('transmission-port', parseInt(e.target.value))}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    min="1"
                    max="65535"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="text-sm font-medium">Username (optional)</label>
                  <input
                    type="text"
                    value={settings['transmission-username']}
                    onChange={(e) => handleSettingChange('transmission-username', e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm font-medium">Password (optional)</label>
                  <input
                    type="password"
                    value={settings['transmission-password']}
                    onChange={(e) => handleSettingChange('transmission-password', e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                {/* Use HTTPS */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="secure"
                    checked={settings['transmission-secure']}
                    onChange={(e) => handleSettingChange('transmission-secure', e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <label htmlFor="secure" className="text-sm font-medium">
                    Use HTTPS
                  </label>
                </div>

                {/* Reset Config Button */}
                <div className="pt-4">
                  <button
                    onClick={handleResetConfig}
                    className="flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset Configuration
                  </button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    This will clear all saved settings and return to the initialization screen.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <button
            onClick={onClose}
            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Upload className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  )
}