// src/features/torrents/details/FilesList.tsx
import { useState, useMemo, useCallback } from 'react'
import { client } from '@/lib/api/client'
import { 
  File, 
  ChevronRight, 
  ChevronDown,
  Download,
  ArrowUp,
  MinusSquare,
  CheckSquare,
  Square,
} from 'lucide-react'
import type { Torrent, TorrentFile } from '@/types/models'
import { formatBytes } from '@/utils/formatters'

interface FilesListProps {
  torrent: Torrent
}

interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  size: number
  progress: number
  priority: number
  wanted: boolean
  children: FileNode[]
}

export default function FilesList({ torrent }: FilesListProps) {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(() => {
    const topLevelDirs = new Set<string>()
    torrent.files.forEach((file: TorrentFile) => {
      const parts = file.name.split('/')
      if (parts.length > 1) {
        topLevelDirs.add(parts[0])
      }
    })
    return topLevelDirs
  })

  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(() => {
    const selected = new Set<string>()
    torrent.files.forEach((file: TorrentFile, index: number) => {
      if (torrent.fileStats[index].wanted) {
        selected.add(file.name)
      }
    })
    return selected
  })

  const [lastClickedPath, setLastClickedPath] = useState<string | null>(null)

  const setWanted = useCallback(async (fileIndices: number[], wanted: boolean) => {
    try {
      await client.rpcCall('torrent-set', {
        ids: [torrent.id],
        'files-wanted': wanted ? fileIndices : undefined,
        'files-unwanted': !wanted ? fileIndices : undefined
      })
    } catch (error) {
      console.error('Failed to set wanted:', error)
    }
  }, [torrent.id])

  // Helper functions
  const isDirPartiallySelected = useCallback((node: FileNode) => {
    if (!node.isDirectory) return false
    
    const getAllChildFiles = (node: FileNode): string[] => {
      if (!node.isDirectory) return [node.path]
      return node.children.flatMap(child => getAllChildFiles(child))
    }
    
    const allChildren = getAllChildFiles(node)
    const selectedCount = allChildren.filter(file => selectedFiles.has(file)).length
    return selectedCount > 0 && selectedCount < allChildren.length
  }, [selectedFiles])

  const toggleSelection = useCallback(async (node: FileNode) => {
    const getAllChildFiles = (node: FileNode): string[] => {
      if (!node.isDirectory) return [node.path]
      return node.children.flatMap(child => getAllChildFiles(child))
    }
    
    const filePaths = getAllChildFiles(node)
    const fileIndices = filePaths.map(path => 
      torrent.files.findIndex(f => f.name === path)
    ).filter(i => i !== -1)

    const isSelecting = !node.wanted
    
    setSelectedFiles(prev => {
      const next = new Set(prev)
      filePaths.forEach(path => {
        if (isSelecting) {
          next.add(path)
        } else {
          next.delete(path)
        }
      })
      return next
    })

    await setWanted(fileIndices, isSelecting)
  }, [torrent.files, setWanted])

  const buildFileTree = useCallback(() => {
    const root: FileNode[] = []
    
    torrent.files.forEach((file, index) => {
      const parts = file.name.split('/')
      let currentLevel = root
      let currentPath = ''
      
      parts.forEach((part, i) => {
        currentPath += (i === 0 ? '' : '/') + part
        
        if (i === parts.length - 1) {
          currentLevel.push({
            name: part,
            path: currentPath,
            isDirectory: false,
            size: file.length,
            progress: file.bytesCompleted / file.length,
            priority: torrent.fileStats[index].priority,
            wanted: torrent.fileStats[index].wanted,
            children: []
          })
        } else {
          let dir = currentLevel.find(
            node => node.isDirectory && node.name === part
          )
          
          if (!dir) {
            dir = {
              name: part,
              path: currentPath,
              isDirectory: true,
              size: 0,
              progress: 0,
              priority: 0,
              wanted: true,
              children: []
            }
            currentLevel.push(dir)
          }
          
          currentLevel = dir.children
        }
      })
    })

    // Calculate directory stats and wanted state
    const calculateDirStats = (node: FileNode) => {
      if (!node.isDirectory) return node
      
      let totalSize = 0
      let completedSize = 0
      
      node.children.forEach(child => {
        calculateDirStats(child)
        totalSize += child.size
        completedSize += child.size * child.progress
      })
      
      node.size = totalSize
      node.progress = totalSize ? completedSize / totalSize : 0
      node.wanted = node.children.every(child => child.wanted)
      
      return node
    }
    
    root.forEach(calculateDirStats)
    return root
  }, [torrent.files, torrent.fileStats])

  const fileTree = useMemo(() => buildFileTree(), [buildFileTree])

  const toggleDir = useCallback((path: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  const setPriority = useCallback(async (fileIndices: number[], priority: number) => {
    try {
      await client.rpcCall('torrent-set', {
        ids: [torrent.id],
        'priority-high': priority === 1 ? fileIndices : undefined,
        'priority-normal': priority === 0 ? fileIndices : undefined,
        'priority-low': priority === -1 ? fileIndices : undefined
      })
    } catch (error) {
      console.error('Failed to set priority:', error)
    }
  }, [torrent.id])

  const renderNode = (node: FileNode, level = 0) => {
    const isExpanded = expandedDirs.has(node.path)
    const isSelected = node.wanted
    const isPartiallySelected = isDirPartiallySelected(node)
    
    return (
      <div key={node.path}>
        <div 
          className={`grid grid-cols-[auto,auto,1fr,auto] items-center gap-4 rounded-md px-2 py-1.5 hover:bg-muted/50
            ${level === 0 ? '' : 'ml-6'}`}
          onClick={(e) => handleRowClick(node, e)}
        >
          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleSelection(node)
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            {isPartiallySelected ? (
              <MinusSquare className="h-4 w-4 text-primary" />
            ) : isSelected ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </button>

          {/* Directory/File Icon */}
          {node.isDirectory ? (
            <button onClick={() => toggleDir(node.path)}>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <File className="h-4 w-4 text-muted-foreground" />
          )}

          {/* Name and Progress */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="truncate font-medium">
                {node.name}
              </span>
              <span className="ml-2 text-sm text-muted-foreground">
                {formatBytes(node.size)}
              </span>
            </div>
            <div className="h-0.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${node.progress * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          {!node.isDirectory && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setWanted([torrent.files.findIndex(
                  f => f.name === node.path
                )], !node.wanted)}
                className={`rounded p-1 hover:bg-muted ${
                  node.wanted ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                <Download className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => setPriority([torrent.files.findIndex(
                  f => f.name === node.path
                )], 1)}
                className={`rounded p-1 hover:bg-muted ${
                  node.priority === 1 ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Render children if directory is expanded */}
        {node.isDirectory && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const handleRowClick = (node: FileNode, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Toggle selection for single file
      setSelectedFiles(prev => {
        const next = new Set(prev)
        if (next.has(node.path)) {
          next.delete(node.path)
        } else {
          next.add(node.path)
        }
        return next
      })
      setLastClickedPath(node.path)
    } else if (event.shiftKey && lastClickedPath) {
      // Build a flat array of visible files in their current display order
      const visibleFiles: FileNode[] = []
      
      const addVisibleNode = (node: FileNode) => {
        visibleFiles.push(node)
        if (node.isDirectory && expandedDirs.has(node.path)) {
          node.children.forEach(child => addVisibleNode(child))
        }
      }
      
      // Build the flat array by traversing the tree in display order
      fileTree.forEach(node => addVisibleNode(node))
      
      // Find indices of anchor and clicked files
      const anchorIndex = visibleFiles.findIndex(f => f.path === lastClickedPath)
      const clickedIndex = visibleFiles.findIndex(f => f.path === node.path)
      
      if (anchorIndex !== -1 && clickedIndex !== -1) {
        // Calculate range
        const start = Math.min(anchorIndex, clickedIndex)
        const end = Math.max(anchorIndex, clickedIndex)
        
        // Select all files in the range
        const newSelection = new Set<string>()
        for (let i = start; i <= end; i++) {
          newSelection.add(visibleFiles[i].path)
        }
        setSelectedFiles(newSelection)
      }
    } else {
      // Single selection
      setSelectedFiles(new Set([node.path]))
      setLastClickedPath(node.path)
    }
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 rounded-lg border border-border p-4">
        <div>
          <div className="text-sm text-muted-foreground">Total Size</div>
          <div className="text-2xl font-medium">
            {formatBytes(torrent.totalSize)}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Downloaded</div>
          <div className="text-2xl font-medium">
            {formatBytes(torrent.downloadedEver)}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">File Count</div>
          <div className="text-2xl font-medium">
            {torrent.files.length}
          </div>
        </div>
      </div>

      {/* Files tree */}
      <div className="rounded-lg border border-border">
        {fileTree.map(node => renderNode(node))}
      </div>
    </div>
  )
}