// src/features/torrents/AddTorrent.tsx
import { useState, useRef, useEffect } from 'react'
import { 
  Upload, 
  Link, 
  FolderOpen,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useTorrents } from '@/hooks/useTorrents'
import { useSession } from '@/hooks/useSession'

interface AddTorrentProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddTorrent({ isOpen, onClose }: AddTorrentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<'file' | 'magnet'>('file')
  const [torrentFile, setTorrentFile] = useState<File | null>(null)
  const [magnetUrl, setMagnetUrl] = useState('')
  const [downloadDir, setDownloadDir] = useState('')
  const [paused, setPaused] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSetInitialDir, setHasSetInitialDir] = useState(false)

  const { addTorrent } = useTorrents()
  const { sessionInfo } = useSession()

  // Set initial download directory only once
  useEffect(() => {
    if (sessionInfo?.['download-dir'] && !hasSetInitialDir) {
      setDownloadDir(sessionInfo['download-dir'])
      setHasSetInitialDir(true)
    }
  }, [sessionInfo, hasSetInitialDir])

  // Reset state when dialog is opened
  useEffect(() => {
    if (isOpen) {
      setTorrentFile(null)
      setMagnetUrl('')
      setPaused(false)
      setError(null)
      setActiveTab('file')
      setHasSetInitialDir(false) // Allow directory to be reset when dialog reopens
    }
  }, [isOpen])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setTorrentFile(file)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (activeTab === 'file' && torrentFile) {
        // Convert file to base64
        const reader = new FileReader()
        reader.onload = async (e) => {
          const base64 = (e.target?.result as string)?.split(',')[1]
          await addTorrent({
            metainfo: base64,
            'download-dir': downloadDir,
            paused
          })
          onClose()
        }
        reader.readAsDataURL(torrentFile)
      } else if (activeTab === 'magnet' && magnetUrl) {
        await addTorrent({
          filename: magnetUrl,
          'download-dir': downloadDir,
          paused
        })
        onClose()
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">Add Torrent</h2>

        {/* Tabs */}
        <div className="mb-6 flex space-x-4 border-b border-border">
          <button
            type="button"
            className={`flex items-center gap-2 border-b-2 pb-2 text-sm font-medium transition-colors
              ${activeTab === 'file'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            onClick={() => setActiveTab('file')}
          >
            <Upload className="h-4 w-4" />
            Torrent File
          </button>
          <button
            type="button"
            className={`flex items-center gap-2 border-b-2 pb-2 text-sm font-medium transition-colors
              ${activeTab === 'magnet'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            onClick={() => setActiveTab('magnet')}
          >
            <Link className="h-4 w-4" />
            Magnet URL
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File/Magnet Input */}
          {activeTab === 'file' ? (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".torrent"
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-6 transition-colors hover:bg-muted
                  ${torrentFile ? 'border-primary/50' : ''}`}
              >
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                {torrentFile ? (
                  <p className="text-sm font-medium">{torrentFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium">Click to select a torrent file</p>
                    <p className="text-xs text-muted-foreground">or drag and drop</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium">Magnet URL</label>
              <input
                type="text"
                value={magnetUrl}
                onChange={(e) => setMagnetUrl(e.target.value)}
                placeholder="magnet:?xt=urn:btih:..."
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          )}

          {/* Download Location */}
          <div>
            <label className="text-sm font-medium">Download Location</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                value={downloadDir}
                onChange={(e) => setDownloadDir(e.target.value)}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                type="button"
                className="rounded-md border border-input bg-background p-2 text-muted-foreground hover:text-foreground"
              >
                <FolderOpen className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Start Options */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="paused"
              checked={paused}
              onChange={(e) => setPaused(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="paused" className="text-sm">
              Start paused
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!torrentFile && !magnetUrl)}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Torrent
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}