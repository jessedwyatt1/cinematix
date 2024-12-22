// src/components/torrents/TorrentFilters.tsx
import { X, Filter, Tag } from 'lucide-react'
import { useTorrents } from '@/hooks/useTorrents'
import { TorrentStatus } from '@/types/models'

interface FilterOption {
  value: TorrentStatus | undefined
  label: string
  count: number
}

export default function TorrentFilters() {
  const { torrents, filter, setFilter } = useTorrents()

  // Count torrents for each status
  const torrentArray = Array.from(torrents.values())
  const statusCounts = torrentArray.reduce((acc, torrent) => {
    acc[torrent.status] = (acc[torrent.status] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  // Get unique labels across all torrents
  const uniqueLabels = new Set<string>()
  torrentArray.forEach(torrent => {
    torrent.labels.forEach(label => uniqueLabels.add(label))
  })

  // Count torrents for each label
  const labelCounts = torrentArray.reduce((acc, torrent) => {
    torrent.labels.forEach(label => {
      acc[label] = (acc[label] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const filterOptions: FilterOption[] = [
    { value: undefined, label: 'All', count: torrentArray.length },
    { value: TorrentStatus.Downloading, label: 'Downloading', count: statusCounts[TorrentStatus.Downloading] || 0 },
    { value: TorrentStatus.Seeding, label: 'Seeding', count: statusCounts[TorrentStatus.Seeding] || 0 },
    { value: TorrentStatus.Stopped, label: 'Stopped', count: statusCounts[TorrentStatus.Stopped] || 0 },
    { value: TorrentStatus.QueuedVerify, label: 'Queued', count: 
      (statusCounts[TorrentStatus.QueuedVerify] || 0) +
      (statusCounts[TorrentStatus.QueuedDownload] || 0) +
      (statusCounts[TorrentStatus.QueuedSeed] || 0)
    },
    { value: TorrentStatus.Verifying, label: 'Verifying', count: statusCounts[TorrentStatus.Verifying] || 0 },
  ]

  const clearFilters = () => {
    setFilter({})
  }

  const toggleStatus = (status: TorrentStatus | undefined) => {
    setFilter({ ...filter, status })
  }

  const toggleLabel = (label: string) => {
    const currentLabels = filter.labels || []
    const newLabels = currentLabels.includes(label)
      ? currentLabels.filter(l => l !== label)
      : [...currentLabels, label]
    
    setFilter({ ...filter, labels: newLabels.length > 0 ? newLabels : undefined })
  }

  return (
    <div className="w-72 rounded-lg border border-border bg-card-elevated shadow-lg">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <h3 className="font-medium">Filters</h3>
          </div>
          {(filter.status !== undefined || filter.labels?.length) && (
            <button
              onClick={clearFilters}
              className="rounded p-1 text-sm text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status filters */}
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
          {filterOptions.map(option => (
            <button
              key={option.label}
              onClick={() => toggleStatus(option.value)}
              className={`flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors
                ${filter.status === option.value 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-foreground hover:bg-card'}`}
            >
              <span>{option.label}</span>
              <span className="text-xs tabular-nums">
                {option.count}
              </span>
            </button>
          ))}
        </div>

        {/* Label filters */}
        {uniqueLabels.size > 0 && (
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-medium text-muted-foreground">Labels</h4>
            {Array.from(uniqueLabels).sort().map(label => (
              <button
                key={label}
                onClick={() => toggleLabel(label)}
                className={`flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors
                  ${filter.labels?.includes(label)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-card'}`}
              >
                <div className="flex items-center gap-2">
                  <Tag className="h-3 w-3" />
                  <span>{label}</span>
                </div>
                <span className="text-xs tabular-nums">
                  {labelCounts[label]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}