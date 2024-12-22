import { useState, useMemo } from 'react'
import { useTorrents } from '@/hooks/useTorrents'
import { X, FileText, Users, Signal, Info } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { formatBytes, formatRelativeTime } from '@/utils/formatters'
import GeneralInfo from '@/features/torrents/details/GeneralInfo'
import FilesList from '@/features/torrents/details/FilesList'
import PeersList from '@/features/torrents/details/PeersList'
import TrackersList from '@/features/torrents/details/TrackersList'
import type { Torrent } from '@/types/models'

export default function TorrentDetails() {
  const [activeTab, setActiveTab] = useState('general')
  const { selectedIds, torrents, clearSelected } = useTorrents()
  
  const selectedTorrent = useMemo(() => 
    selectedIds.size === 1 
      ? torrents.find((t: Torrent) => t.id === Array.from(selectedIds)[0])
      : null,
    [selectedIds, torrents]
  )
    
  if (!selectedTorrent) return null

  return (
    <div className="h-full flex flex-col overflow-hidden torrent-details bg-card-elevated">
      {/* Header */}
      <div className="flex-none border-b border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold truncate pr-4">
            {selectedTorrent.name}
          </h2>
          <button
            onClick={() => clearSelected()}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
  
      {/* Tabs Container */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="flex-1 flex flex-col min-h-0"
      >
        {/* Tab List */}
        <div className="flex-none border-b border-border bg-card">
          <TabsList className="px-4">
            <TabsTrigger value="general" className="gap-2">
              <Info className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-2">
              <FileText className="h-4 w-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="peers" className="gap-2">
              <Users className="h-4 w-4" />
              Peers
            </TabsTrigger>
            <TabsTrigger value="trackers" className="gap-2">
              <Signal className="h-4 w-4" />
              Trackers
            </TabsTrigger>
          </TabsList>
        </div>
  
        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="general" className="m-0 h-full">
            <div className="p-4 h-full bg-card-elevated">
              <GeneralInfo torrent={selectedTorrent} />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Added</div>
                  <div className="font-medium">
                    {formatRelativeTime(selectedTorrent.addedDate)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Size</div>
                  <div className="font-medium">
                    {formatBytes(selectedTorrent.totalSize)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Downloaded</div>
                  <div className="font-medium">
                    {formatBytes(selectedTorrent.downloadedEver)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Uploaded</div>
                  <div className="font-medium">
                    {formatBytes(selectedTorrent.uploadedEver)}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="files" className="m-0 h-full">
            <div className="p-4 h-full bg-card-elevated">
              <FilesList torrent={selectedTorrent} />
            </div>
          </TabsContent>
          
          <TabsContent value="peers" className="m-0 h-full">
            <div className="p-4 h-full bg-card-elevated">
              <PeersList torrent={selectedTorrent} />
            </div>
          </TabsContent>
          
          <TabsContent value="trackers" className="m-0 h-full">
            <div className="p-4 h-full bg-card-elevated">
              <TrackersList torrent={selectedTorrent} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}