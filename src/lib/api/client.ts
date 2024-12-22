// src/lib/api/client.ts
import axios, { AxiosInstance } from 'axios';
import { SessionInfo, Torrent } from '@/types/models';

export interface TransmissionSettings {
  url: string;
  port: number;
  username?: string;
  password?: string;
}

export interface FreeSpaceRequest {
  path: string;
}

export interface FreeSpaceArguments {
  path: string;
  "size-bytes": number;
  total_size: number;
}

export interface FreeSpaceResponse {
  result: string;
  arguments: FreeSpaceArguments;
  tag?: number;
}

export interface FreeSpaceResult {
  path: string;
  freeSpace: number;
  totalSize: number;
}

export interface AddTorrentArgs {
  filename?: string;
  metainfo?: string;
  'download-dir'?: string;
  paused?: boolean;
}

export interface TorrentsGetResponse {
  result: string;
  arguments?: {
    torrents: Torrent[];
  };
}

export class TransmissionClient {
  private client!: AxiosInstance;
  private sessionId: string | null = null;
  private requestTag = 0;
  private settings: TransmissionSettings;

  constructor(settings?: TransmissionSettings) {
    this.settings = settings || { url: '', port: 9091 };
    this.initializeClient();
  }

  private initializeClient() {
    if (!this.settings.url) return;

    let baseURL = this.settings.url;
    if (!baseURL.startsWith('http://') && !baseURL.startsWith('https://')) {
      baseURL = `http://${baseURL}`;
    }
    if (!baseURL.endsWith('/transmission/rpc')) {
      baseURL = `${baseURL}:${this.settings.port}/transmission/rpc`;
    }

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      },
      auth: this.settings.username ? {
        username: this.settings.username,
        password: this.settings.password || ''
      } : undefined
    });

    this.client.interceptors.request.use(config => {
      if (this.sessionId) {
        config.headers['X-Transmission-Session-Id'] = this.sessionId;
      }
      return config;
    });

    this.client.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 409) {
          const newSessionId = error.response.headers['x-transmission-session-id'];
          if (newSessionId) {
            this.sessionId = newSessionId;
            const newRequest = {
              ...error.config,
              headers: {
                ...error.config.headers,
                'X-Transmission-Session-Id': newSessionId
              }
            };
            try {
              return await axios(newRequest);
            } catch (retryError) {
              return Promise.reject(retryError);
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  public updateSettings(settings: TransmissionSettings) {
    this.settings = settings;
    this.initializeClient();
  }

  public async rpcCall<TArgs = unknown, TResponse = unknown>(
    method: string,
    args?: TArgs
  ): Promise<{ result: string; arguments?: TResponse }> {
    if (!this.client) {
      this.initializeClient();
      if (!this.client) {
        throw new Error('Client not initialized - no valid URL provided');
      }
    }

    const request = {
      method,
      arguments: args,
      tag: ++this.requestTag
    };

    const { data } = await this.client.post('', request);
    
    if (data.result !== 'success') {
      throw new Error(`RPC call failed: ${data.result}`);
    }

    return data;
  }

  public async getSession(fields?: string[]) {
    return this.rpcCall<{ fields?: string[] }, Partial<SessionInfo>>('session-get', fields ? { fields } : undefined);
  }

  public async getSessionStats() {
    return this.rpcCall('session-stats');
  }

  public async setSession(settings: Partial<SessionInfo>) {
    return this.rpcCall('session-set', settings);
  }

  public async getTorrents(fields: string[]) {
    const response = await this.rpcCall<{ fields: string[] }, { torrents: Torrent[] }>('torrent-get', {
      fields
    });
    return response;
  }

  public async addTorrent(args: {
    filename?: string;
    metainfo?: string;
    'download-dir'?: string;
    paused?: boolean;
  }) {
    return this.rpcCall<typeof args>('torrent-add', args);
  }

  public async startTorrent(ids: number[]) {
    return this.rpcCall('torrent-start-now', { ids });
  }

  public async stopTorrent(ids: number[]) {
    return this.rpcCall('torrent-stop', { ids });
  }

  public async removeTorrent(ids: number[], deleteData: boolean) {
    return this.rpcCall('torrent-remove', {
      ids,
      'delete-local-data': deleteData
    });
  }

  public async setTorrentLocation(ids: number[], location: string, move: boolean) {
    return this.rpcCall('torrent-set-location', {
      ids,
      location,
      move
    });
  }

  public async renameTorrentPath(ids: number[], path: string, name: string) {
    return this.rpcCall('torrent-rename-path', {
      ids,
      path,
      name
    });
  }

  public async verifyTorrents(ids: number[]) {
    return this.rpcCall('torrent-verify', { ids });
  }

  public async setTorrentProperties(id: number, properties: {
    'priority-high'?: number[];
    'priority-normal'?: number[];
    'priority-low'?: number[];
    downloadLimit?: number;
    downloadLimited?: boolean;
    uploadLimit?: number;
    uploadLimited?: boolean;
    seedRatioLimit?: number;
    seedRatioMode?: number;
  }) {
    return this.rpcCall('torrent-set', {
      ids: [id],
      ...properties
    });
  }

  public async moveTorrentInQueue(ids: number[], action: 'top' | 'up' | 'down' | 'bottom') {
    const method = `queue-move-${action}`
    return this.rpcCall(method, { ids });
  }

  // Singleton instance
  static instance: TransmissionClient;
  static getInstance(settings?: TransmissionSettings): TransmissionClient {
    if (!TransmissionClient.instance) {
      TransmissionClient.instance = new TransmissionClient(settings);
    }
    return TransmissionClient.instance;
  }
}

export const client = TransmissionClient.getInstance();