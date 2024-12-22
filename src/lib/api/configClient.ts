// src/lib/api/configClient.ts
import axios from 'axios';

export interface TransmissionConfig {
  url: string;
  port: number;
  username: string;
  password: string;
  isSecure: boolean;
}

class ConfigClient {
  private client;

  constructor() {
    this.client = axios.create({
      baseURL: '/api/config',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getConfig(): Promise<TransmissionConfig | null> {
    try {
      const response = await this.client.get('/');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('Failed to get config:', error);
      throw error;
    }
  }

  async saveConfig(config: TransmissionConfig): Promise<void> {
    try {
      await this.client.post('/', config);
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  }

  async clearConfig(): Promise<void> {
    try {
      await this.client.delete('/');
    } catch (error) {
      console.error('Failed to clear config:', error);
      throw error;
    }
  }
}

export const configClient = new ConfigClient();