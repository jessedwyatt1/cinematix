import { HardDrive, Database, ArrowDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { client, FreeSpaceResponse } from '@/lib/api/client';
import { useSession } from '@/hooks/useSession';
import { formatBytes } from '@/utils/formatters';

interface SpaceInfo {
  path: string;
  totalSize: number;
  freeSpace: number;
}

export default function SpaceUsage() {
  const { sessionInfo } = useSession();
  const [spaceInfo, setSpaceInfo] = useState<SpaceInfo | null>(null);
  
  useEffect(() => {
    async function fetchSpaceInfo() {
      if (sessionInfo?.['download-dir']) {
        try {
          const response = await client.rpcCall<unknown, FreeSpaceResponse>('free-space', {
            path: sessionInfo['download-dir']
          });
          
          setSpaceInfo({
            path: response.arguments?.path ?? '',
            totalSize: response.arguments?.total_size ?? 0,
            freeSpace: response.arguments?.['size-bytes'] ?? 0
          });
        } catch (error) {
          console.error('Failed to fetch space info:', error);
        }
      }
    }

    fetchSpaceInfo();
    const interval = setInterval(fetchSpaceInfo, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [sessionInfo]);

  if (!spaceInfo) return null;

  const usedSpace = spaceInfo.totalSize - spaceInfo.freeSpace;
  const usagePercent = (usedSpace / spaceInfo.totalSize) * 100;

  return (
    <div className="flex h-full flex-col justify-between">
      {/* Usage visualization */}
      <div className="mb-4">
        <div className="flex items-center justify-center">
          <div className="relative h-24 w-24">
            {/* Circular progress */}
            <svg className="h-full w-full -rotate-90 transform">
              <circle
                className="text-muted"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="44"
                cx="48"
                cy="48"
              />
              <circle
                className="text-primary"
                strokeWidth="8"
                strokeDasharray={276.46}
                strokeDashoffset={276.46 * (1 - usagePercent / 100)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="44"
                cx="48"
                cy="48"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <HardDrive className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold">
            {usagePercent.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">
            Space Used
          </div>
        </div>
      </div>

      {/* Detailed stats */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span>Total Space</span>
            </div>
            <span className="font-medium">{formatBytes(spaceInfo.totalSize)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4 text-emerald-500" />
              <span>Free Space</span>
            </div>
            <span className="font-medium">{formatBytes(spaceInfo.freeSpace)}</span>
          </div>
        </div>

        {/* Download directory */}
        <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
          <div className="text-muted-foreground">Download Directory</div>
          <div className="mt-1 truncate font-medium">
            {spaceInfo.path}
          </div>
        </div>
      </div>
    </div>
  );
}