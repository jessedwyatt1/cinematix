import { Upload, Download, Repeat } from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { formatBytes } from '@/utils/formatters';

export default function RatioStats() {
  const { sessionStats } = useSession();

  const stats = sessionStats?.['cumulative-stats'] || {
    uploadedBytes: 0,
    downloadedBytes: 0,
    filesAdded: 0,
    secondsActive: 0
  };

  const ratio = stats.downloadedBytes ? (stats.uploadedBytes / stats.downloadedBytes).toFixed(2) : '0.00';
  
  // Calculate average daily transfer
  const daysActive = Math.max(1, Math.floor(stats.secondsActive / 86400));
  const avgDailyUpload = stats.uploadedBytes / daysActive;
  const avgDailyDownload = stats.downloadedBytes / daysActive;

  return (
    <div className="flex h-full flex-col justify-between">
      {/* Main ratio display */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center rounded-full bg-muted/50 px-4 py-2">
          <Repeat className="mr-2 h-5 w-5 text-primary" />
          <span className="text-2xl font-bold">{ratio}</span>
        </div>
      </div>

      {/* Transfer stats */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-500" />
              <span>Total Upload</span>
            </div>
            <span className="font-medium">{formatBytes(stats.uploadedBytes)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="pl-6">Daily Average</span>
            <span>{formatBytes(avgDailyUpload)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-emerald-500" />
              <span>Total Download</span>
            </div>
            <span className="font-medium">{formatBytes(stats.downloadedBytes)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="pl-6">Daily Average</span>
            <span>{formatBytes(avgDailyDownload)}</span>
          </div>
        </div>

        {/* Summary stats */}
        <div className="flex justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
          <div>
            <div className="text-muted-foreground">Files Added</div>
            <div className="font-medium">{stats.filesAdded}</div>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground">Days Active</div>
            <div className="font-medium">{daysActive}</div>
          </div>
        </div>
      </div>
    </div>
  );
}