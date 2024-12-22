export interface FreeSpaceResponse {
    arguments: {
      path: string;
      'size-bytes': number;
      total_size: number;
    };
    result: string;
    tag?: number;
  }