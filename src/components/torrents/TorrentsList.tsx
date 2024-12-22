// src/components/torrents/TorrentsList.tsx
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { 
  Download,
  Upload,
  Pause,
  Play,
  Trash2,
  Filter,
  Search,
  MoreHorizontal,
  PlayCircle,
  X
} from 'lucide-react'
import { useTorrents } from '@/hooks/useTorrents'
import { TorrentStatus, getEffectiveStatus } from '@/types/models'
import { formatBytes, formatDuration } from '@/utils/formatters'
import type { Torrent } from '@/types/models'
import ConfirmDialog from '@/components/modals/ConfirmDialog'
import TorrentFilters from '@/components/torrents/TorrentFilters'
import TorrentContextMenu from '@/components/torrents/TorrentContextMenu'
import { useSession } from '@/hooks/useSession'

type SortField = 'name' | 'status' | 'progress' | 'size' | 'downloadSpeed' | 'uploadSpeed' | 'eta'
type SortDirection = 'asc' | 'desc'

export default function TorrentsList() {
  const [filterVisible, setFilterVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([])
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const filterButtonRef = useRef<HTMLButtonElement>(null)
  const filterPanelRef = useRef<HTMLDivElement>(null)
  const [lastClickedId, setLastClickedId] = useState<number | null>(null)

  const { 
    torrents, 
    selectedIds, 
    filter, 
    removeTorrents,
    startTorrents,
    stopTorrents,
    setSelected,
    clearSelected,
    setFilter,
    torrentIndexMap,
    filteredTorrents
  } = useTorrents()

  const { sessionStats } = useSession()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setFilter({ 
      status: filter.status,
      text: value,
      labels: filter.labels 
    })
  }

  const sortTorrents = useCallback((torrents: Torrent[]) => {
    return [...torrents].sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'status':
          comparison = a.status - b.status
          break
        case 'progress':
          comparison = a.percentDone - b.percentDone
          break
        case 'size':
          comparison = a.totalSize - b.totalSize
          break
        case 'downloadSpeed':
          comparison = a.rateDownload - b.rateDownload
          break
        case 'uploadSpeed':
          comparison = a.rateUpload - b.rateUpload
          break
        case 'eta':
          comparison = (a.eta === -1 ? Infinity : a.eta) - (b.eta === -1 ? Infinity : b.eta)
          break
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Handle row selection
  const handleRowClick = (id: number, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Toggle selection for single torrent
      const newSelection = new Set(selectedIds)
      if (newSelection.has(id)) {
        newSelection.delete(id)
      } else {
        newSelection.add(id)
      }
      setSelected(Array.from(newSelection))
      setLastClickedId(id)
    } else if (event.shiftKey && lastClickedId !== null) {
      // Get the display index of the anchor point and clicked torrent
      const anchorIndex = torrentIndexMap.get(lastClickedId) ?? 0
      const clickedIndex = torrentIndexMap.get(id) ?? 0
      
      // Calculate range
      const start = Math.min(anchorIndex, clickedIndex)
      const end = Math.max(anchorIndex, clickedIndex)
      
      // Get all torrent IDs in the range based on current display order
      const rangeSelection = filteredTorrents
        .slice(start, end + 1)
        .map(t => t.id)
      
      setSelected(rangeSelection)
    } else {
      // Single selection
      setSelected([id])
      setLastClickedId(id)
    }
  }

  const handleKeyboardShortcuts = useCallback((event: KeyboardEvent) => {
    // Don't handle shortcuts if user is typing in an input
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement) {
      return
    }

    const handleDelete = (ids: number[]) => {
      removeTorrents(ids, false)
      clearSelected()
    }

    // Ctrl/Cmd + A: Select all
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.preventDefault()
      const allIds = torrents.map(t => t.id)
      setSelected(allIds)
      return
    }

    // Delete: Remove selected torrents
    if (event.key === 'Delete' && selectedIds.size > 0) {
      event.preventDefault()
      handleDelete(Array.from(selectedIds))
      return
    }

    // Space: Toggle selected torrents
    if (event.key === ' ' && selectedIds.size > 0) {
      event.preventDefault()
      // Check if any selected torrent is running
      const selectedTorrents = torrents.filter(t => selectedIds.has(t.id))
      const hasRunning = selectedTorrents.some(t => 
        t.status === TorrentStatus.Downloading || 
        t.status === TorrentStatus.Seeding
      )
      
      if (hasRunning) {
        stopTorrents(Array.from(selectedIds))
      } else {
        startTorrents(Array.from(selectedIds))
      }
      return
    }

    // Escape: Clear selection
    if (event.key === 'Escape') {
      event.preventDefault()
      clearSelected()
      setLastClickedId(null)
    }
  }, [
    torrents,
    selectedIds, 
    setSelected, 
    startTorrents, 
    stopTorrents,
    clearSelected,
    removeTorrents
  ])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts)
    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcuts)
    }
  }, [handleKeyboardShortcuts])

  // Status badge styling
  const getStatusBadge = (torrent: Torrent) => {
    const status = getEffectiveStatus(torrent);
    const baseClasses = "px-2 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case TorrentStatus.Downloading:
        return `${baseClasses} bg-emerald-500/20 text-emerald-500`;
      case TorrentStatus.Seeding:
        return `${baseClasses} bg-blue-500/20 text-blue-500`;
      case TorrentStatus.Stopped:
        return `${baseClasses} bg-muted text-muted-foreground`;
      case TorrentStatus.Stalled:
        return `${baseClasses} bg-orange-500/20 text-orange-500`;
      case TorrentStatus.CheckingMetadata:
        return `${baseClasses} bg-purple-500/20 text-purple-500`;
      case TorrentStatus.Error:
        return `${baseClasses} bg-red-500/20 text-red-500`;
      case TorrentStatus.QueuedVerify:
      case TorrentStatus.QueuedDownload:
      case TorrentStatus.QueuedSeed:
        return `${baseClasses} bg-yellow-500/20 text-yellow-500`;
      default:
        return `${baseClasses} bg-muted text-muted-foreground`;
    }
  };

  const getStatusText = (torrent: Torrent) => {
    const status = getEffectiveStatus(torrent);
    
    switch (status) {
      case TorrentStatus.Stopped:
        return torrent.isFinished ? 'Complete' : 'Paused';
      case TorrentStatus.QueuedVerify:
        return 'Queued to Verify';
      case TorrentStatus.Verifying:
        return 'Verifying';
      case TorrentStatus.QueuedDownload:
        return 'Queued';
      case TorrentStatus.Downloading:
        return 'Downloading';
      case TorrentStatus.QueuedSeed:
        return 'Queued to Seed';
      case TorrentStatus.Seeding:
        return 'Seeding';
      case TorrentStatus.Stalled:
        return torrent.isFinished ? 'Seeding (Idle)' : 'Stalled';
      case TorrentStatus.CheckingMetadata:
        return 'Retrieving Metadata';
      case TorrentStatus.Error:
        return torrent.leftUntilDone === torrent.sizeWhenDone 
          ? 'Files Missing' 
          : torrent.errorString || 'Error';
      default:
        return 'Unknown';
    }
  };

  const sortedTorrents = useMemo(() => 
    sortTorrents(torrents), 
    [sortTorrents, torrents]
  )

  const handleContextMenu = (event: React.MouseEvent, id: number) => {
    event.preventDefault()
    
    // If clicking on an unselected torrent, select only that one
    if (!selectedIds.has(id)) {
      setSelected([id])
    }
    
    setContextMenu({
      x: event.clientX,
      y: event.clientY
    })
  }

  // Keep existing filter panel click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterVisible && 
          filterButtonRef.current && 
          filterPanelRef.current && 
          !filterButtonRef.current.contains(event.target as Node) && 
          !filterPanelRef.current.contains(event.target as Node)) {
        setFilterVisible(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [filterVisible])

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-card-elevated p-4">
        {/* Left side: Action buttons */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => startTorrents(Array.from(selectedIds))}
              disabled={selectedIds.size === 0}
              className="rounded bg-blue-600 px-2 py-1 text-sm text-white disabled:opacity-50 hover:bg-blue-700"
            >
              <Play className="h-4 w-4" />
            </button>
            <button 
              onClick={() => stopTorrents(Array.from(selectedIds))}
              disabled={selectedIds.size === 0}
              className="rounded bg-secondary px-2 py-1 text-sm text-secondary-foreground disabled:opacity-50"
            >
              <Pause className="h-4 w-4" />
            </button>
            <button 
              onClick={() => {
                setPendingDeleteIds(Array.from(selectedIds))
                setDeleteDialogOpen(true)
              }}
              disabled={selectedIds.size === 0}
              className="rounded bg-destructive px-2 py-1 text-sm text-destructive-foreground disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            
            {selectedIds.size > 0 && (
              <button 
                onClick={clearSelected}
                className="rounded bg-secondary px-2 py-1 text-sm text-secondary-foreground hover:bg-secondary/80"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search torrents..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="h-8 rounded-md border border-input bg-background pl-8 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="relative">
              <button
                ref={filterButtonRef}
                onClick={() => setFilterVisible(!filterVisible)}
                className={`rounded p-1 hover:bg-muted ${
                  filterVisible ? 'bg-muted' : ''
                }`}
              >
                <Filter className="h-4 w-4" />
              </button>

              <div 
                ref={filterPanelRef}
                className={`absolute left-0 top-full z-50 mt-2 origin-top transition-all duration-200 ease-out
                  ${filterVisible 
                    ? 'scale-100 opacity-100' 
                    : 'scale-95 opacity-0 pointer-events-none'}`}
              >
                <TorrentFilters />
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Download className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-foreground">
                {formatBytes(sessionStats?.downloadSpeed || 0)}/s
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-foreground">
                {formatBytes(sessionStats?.uploadSpeed || 0)}/s
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {sessionStats?.activeTorrentCount ? (
                <PlayCircle className="h-4 w-4 text-emerald-500" />
              ) : (
                <Pause className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium text-foreground">
                {sessionStats?.activeTorrentCount || 0}/{sessionStats?.torrentCount || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Main content area */}
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-card-elevated">
            <tr className="border-b border-border">
              <th 
                onClick={() => handleSort('name')}
                className="p-2 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
              >
                <div className="flex items-center gap-1">
                  Name
                  {sortField === 'name' && (
                    sortDirection === 'asc' ? '↑' : '↓'
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort('status')}
                className="w-24 p-2 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
              >
                <div className="flex items-center gap-1">
                  Status
                  {sortField === 'status' && (
                    sortDirection === 'asc' ? '↑' : '↓'
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort('progress')}
                className="w-24 p-2 text-right text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
              >
                <div className="flex items-center justify-end gap-1">
                  Progress
                  {sortField === 'progress' && (
                    sortDirection === 'asc' ? '↑' : '↓'
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort('size')}
                className="w-28 p-2 text-right text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
              >
                <div className="flex items-center justify-end gap-1">
                  Size
                  {sortField === 'size' && (
                    sortDirection === 'asc' ? '↑' : '↓'
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort('downloadSpeed')}
                className="w-28 p-2 text-right text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
              >
                <div className="flex items-center justify-end gap-1">
                  Down
                  {sortField === 'downloadSpeed' && (
                    sortDirection === 'asc' ? '↑' : '↓'
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort('uploadSpeed')}
                className="w-28 p-2 text-right text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
              >
                <div className="flex items-center justify-end gap-1">
                  Up
                  {sortField === 'uploadSpeed' && (
                    sortDirection === 'asc' ? '↑' : ''
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort('eta')}
                className="w-24 p-2 text-right text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
              >
                <div className="flex items-center justify-end gap-1">
                  ETA
                  {sortField === 'eta' && (
                    sortDirection === 'asc' ? '↑' : '↓'
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {sortedTorrents.map((torrent) => (
              <tr
                key={torrent.id}
                onClick={(e) => handleRowClick(torrent.id, e)}
                onContextMenu={(e) => handleContextMenu(e, torrent.id)}
                className={`torrent-row h-[4.5rem] cursor-pointer transition-colors hover:bg-muted/30 ${
                  selectedIds.has(torrent.id) ? 'bg-muted' : ''
                }`}
              >
                <td className="p-2">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium line-clamp-1">{torrent.name}</span>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${torrent.percentDone * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex flex-col gap-1">
                    <span className={getStatusBadge(torrent)}>
                      {getStatusText(torrent)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(torrent.percentDone * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="p-2 text-right">
                  <div className="flex flex-col gap-1">
                    <span>{(torrent.percentDone * 100).toFixed(1)}%</span>
                    <span className="text-xs text-muted-foreground">
                      of {formatBytes(torrent.totalSize)}
                    </span>
                  </div>
                </td>
                <td className="p-2 text-right">
                  <div className="flex flex-col gap-1">
                    <span>{formatBytes(torrent.totalSize)}</span>
                    <span className="text-xs text-muted-foreground">total</span>
                  </div>
                </td>
                <td className="p-2 text-right">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-end gap-1">
                      <Download className="h-4 w-4 text-emerald-500" />
                      {formatBytes(torrent.rateDownload)}/s
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatBytes(torrent.downloadedEver)} total
                    </span>
                  </div>
                </td>
                <td className="p-2 text-right">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-end gap-1">
                      <Upload className="h-4 w-4 text-blue-500" />
                      {formatBytes(torrent.rateUpload)}/s
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatBytes(torrent.uploadedEver)} total
                    </span>
                  </div>
                </td>
                <td className="p-2 text-right">
                  <div className="flex flex-col gap-1">
                    <span>{torrent.eta > 0 ? formatDuration(torrent.eta) : '∞'}</span>
                    <span className="text-xs text-muted-foreground">remaining</span>
                  </div>
                </td>
                <td className="w-8 p-2">
                  <button className="rounded p-1 text-muted-foreground hover:bg-muted">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {contextMenu && (
        <TorrentContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDelete={(ids) => {
            removeTorrents(ids, false)
            clearSelected()
          }}
        />
      )}

      <ConfirmDialog 
        isOpen={deleteDialogOpen}
        title="Remove Torrents"
        message={`Are you sure you want to remove ${pendingDeleteIds.length} selected ${
          pendingDeleteIds.length === 1 ? 'torrent' : 'torrents'
        }?`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={() => {
          removeTorrents(pendingDeleteIds, false)
          setDeleteDialogOpen(false)
          clearSelected()
        }}
        onCancel={() => {
          setDeleteDialogOpen(false)
          setPendingDeleteIds([])
        }}
      />
    </div>
  )
}