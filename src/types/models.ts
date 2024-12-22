// src/types/models.ts

export interface SessionInfo {
  // Transmission connection settings
  'transmission-url': string;
  'transmission-port': number;
  'transmission-username': string;
  'transmission-password': string;
  
  // Speed limits
  'speed-limit-down-enabled': boolean;
  'speed-limit-down': number;
  'speed-limit-up-enabled': boolean;
  'speed-limit-up': number;
  'alt-speed-enabled': boolean;
  'alt-speed-down': number;
  'alt-speed-up': number;
  'alt-speed-time-enabled': boolean;
  'alt-speed-time-begin': number;
  'alt-speed-time-end': number;
  'alt-speed-time-day': number;

  // Queue settings
  'download-queue-enabled': boolean;
  'download-queue-size': number;
  'seed-queue-enabled': boolean;
  'seed-queue-size': number;
  'queue-stalled-enabled': boolean;
  'queue-stalled-minutes': number;

  // Network settings
  'peer-port': number;
  'peer-port-random-on-start': boolean;
  'port-forwarding-enabled': boolean;
  'dht-enabled': boolean;
  'pex-enabled': boolean;
  'lpd-enabled': boolean;
  'utp-enabled': boolean;

  // Storage settings
  'download-dir': string;
  'rename-partial-files': boolean;
  'cache-size-mb': number;
  'incomplete-dir': string;
  'incomplete-dir-enabled': boolean;
  'start-added-torrents': boolean;
  'port-is-open': boolean;
  version: string;
}

export interface SessionStats {
  activeTorrentCount: number;
  downloadSpeed: number;
  uploadSpeed: number;
  pausedTorrentCount: number;
  torrentCount: number;
  'cumulative-stats': {
    uploadedBytes: number;
    downloadedBytes: number;
    filesAdded: number;
    sessionCount: number;
    secondsActive: number;
  };
  'current-stats': {
    uploadedBytes: number;
    downloadedBytes: number;
    filesAdded: number;
    sessionCount: number;
    secondsActive: number;
  };
}
  
export interface TrackerStats {
  id: number;
  host: string;
  announce: string;
  lastAnnounceSucceeded: boolean;
  lastAnnounceResult: string;
  seederCount: number;
  leecherCount: number;
}

export interface TorrentFile {
  name: string;
  length: number;
  bytesCompleted: number;
}

export interface TorrentFileStat {
  wanted: boolean;
  priority: number;
}

export interface PeerInfo {
  address: string;
  port: number;
  clientName: string;
  rateToClient: number;
  rateToPeer: number;
  isEncrypted: boolean;
  isUTP: boolean;
  isIncoming: boolean;
  isDownloadingFrom: boolean;
}

export interface Torrent {
  id: number;
  name: string;
  status: TorrentStatus;
  error: number;
  errorString: string;
  eta: number;
  isFinished: boolean;
  isStalled: boolean;
  leftUntilDone: number;
  metadataPercentComplete: number;
  peersConnected: number;
  peersGettingFromUs: number;
  peersSendingToUs: number;
  percentDone: number;
  queuePosition: number;
  rateDownload: number;
  rateUpload: number;
  recheckProgress: number;
  seedRatioMode: number;
  sizeWhenDone: number;
  totalSize: number;
  uploadRatio: number;
  uploadedEver: number;
  downloadedEver: number;
  addedDate: number;
  labels: string[];
  trackerStats: TrackerStats[];
  peers: PeerInfo[];
  files: TorrentFile[];
  fileStats: TorrentFileStat[];
}

export enum TorrentStatus {
  Stopped = 0,
  QueuedVerify = 1,
  Verifying = 2,
  QueuedDownload = 3,
  Downloading = 4,
  QueuedSeed = 5,
  Seeding = 6,
  // Virtual statuses for UI
  Stalled = 100,
  CheckingMetadata = 101,
  Error = 102
}

export function getEffectiveStatus(torrent: Torrent): TorrentStatus {
  // Check for errors first
  if (torrent.error !== 0) {
    return TorrentStatus.Error;
  }
  
  // Check if metadata is still being retrieved
  if (torrent.metadataPercentComplete < 1) {
    return TorrentStatus.CheckingMetadata;
  }
  
  // If torrent is stopped/paused
  if (torrent.status === TorrentStatus.Stopped) {
    // If it's complete and files exist
    if (torrent.isFinished && torrent.leftUntilDone === 0) {
      return TorrentStatus.Stopped;
    }
    // Only mark as error if we've previously downloaded some data but now it's missing
    if (torrent.downloadedEver > 0 && torrent.leftUntilDone === torrent.sizeWhenDone) {
      return TorrentStatus.Error;
    }
    return TorrentStatus.Stopped;
  }
  
  // For active torrents
  if (torrent.status === TorrentStatus.Downloading || torrent.status === TorrentStatus.Seeding) {
    // If it's complete but stalled
    if (torrent.isFinished && torrent.leftUntilDone === 0) {
      return torrent.status; // Keep original status (Seeding)
    }
    // If it's stalled during download
    if (torrent.isStalled && !torrent.isFinished) {
      return TorrentStatus.Stalled;
    }
  }
  
  return torrent.status;
}