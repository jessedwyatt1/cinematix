import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Play,
  Pause,
  ChevronsUp,
  ChevronUp,
  ChevronDown,
  ChevronsDown,
  Trash2,
  CheckCircle,
  FolderOpen,
  Edit,
  Tags,
  Users,
  MousePointer,
  XCircle
} from 'lucide-react'
import { useTorrents } from '@/hooks/useTorrents'
import ConfirmDialog from '@/components/modals/ConfirmDialog'

interface TorrentContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onDelete: (ids: number[]) => void
}

export default function TorrentContextMenu({ x, y, onClose, onDelete }: TorrentContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  const {
    torrents,
    selectedIds,
    startTorrents,
    stopTorrents,
    setSelected,
    clearSelected
  } = useTorrents()

  // Adjust menu position to stay within viewport
  const getAdjustedPosition = useCallback(() => {
    if (!menuRef.current) return { x, y }
    
    const menuRect = menuRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let adjustedX = x
    let adjustedY = y

    // Adjust horizontal position if menu would overflow
    if (x + menuRect.width > viewportWidth) {
      adjustedX = viewportWidth - menuRect.width
    }

    // Adjust vertical position if menu would overflow
    if (y + menuRect.height > viewportHeight) {
      adjustedY = viewportHeight - menuRect.height
    }

    return { x: adjustedX, y: adjustedY }
  }, [x, y])

  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('.context-menu')) {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside])

  const position = getAdjustedPosition()

  return (
    <>
      <div 
        ref={menuRef}
        className="context-menu fixed z-50 min-w-[200px] rounded-md border border-border bg-card-elevated shadow-lg"
        style={{ top: position.y, left: position.x }}
      >
        <div className="flex flex-col py-1">
          <button 
            onClick={() => {
              startTorrents(Array.from(selectedIds))
              onClose()
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted"
          >
            <Play className="h-4 w-4" />
            Resume
          </button>

          <button 
            onClick={() => {
              stopTorrents(Array.from(selectedIds))
              onClose()
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted"
          >
            <Pause className="h-4 w-4" />
            Pause
          </button>

          <div className="my-1 border-t border-border" />

          <button className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted">
            <ChevronsUp className="h-4 w-4" />
            Move to Front
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted">
            <ChevronUp className="h-4 w-4" />
            Move Up
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted">
            <ChevronDown className="h-4 w-4" />
            Move Down
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted">
            <ChevronsDown className="h-4 w-4" />
            Move to Back
          </button>

          <div className="my-1 border-t border-border" />

          <button 
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted"
            >
            <Trash2 className="h-4 w-4" />
            Remove
            </button>

          <button className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted">
            <CheckCircle className="h-4 w-4" />
            Verify
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted">
            <FolderOpen className="h-4 w-4" />
            Set Location
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted">
            <Edit className="h-4 w-4" />
            Rename
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted">
            <Tags className="h-4 w-4" />
            Edit Labels
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted">
            <Users className="h-4 w-4" />
            Ask for More Peers
          </button>

          <div className="my-1 border-t border-border" />

          <button 
            onClick={() => {
              const allIds = Array.from(torrents).map(t => t.id)
              setSelected(allIds)
              onClose()
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted"
          >
            <MousePointer className="h-4 w-4" />
            Select All
          </button>

          <button 
            onClick={() => {
              clearSelected()
              onClose()
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted"
          >
            <XCircle className="h-4 w-4" />
            Deselect All
          </button>
        </div>
      </div>

        <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Remove Torrents"
        message={`Are you sure you want to remove ${selectedIds.size} selected ${
            selectedIds.size === 1 ? 'torrent' : 'torrents'
        }?`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={() => {
            onDelete(Array.from(selectedIds))
            setDeleteDialogOpen(false)
            onClose()
        }}
        onCancel={() => {
            setDeleteDialogOpen(false)
        }}
        />
    </>
  )
} 