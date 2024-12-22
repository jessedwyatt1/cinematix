// src/lib/config.ts
import { configClient, TransmissionConfig } from './api/configClient';
import { client } from './api/client';

export const configManager = {
  saveConfig: async (config: TransmissionConfig): Promise<void> => {
    try {
      await configClient.saveConfig(config);
      
      // After saving config, update the Transmission client settings
      const baseUrl = `${config.isSecure ? 'https' : 'http'}://${config.url}`;
      client.updateSettings({
        url: baseUrl,
        port: config.port,
        username: config.username || undefined,
        password: config.password || undefined
      });
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  },

  getConfig: async (): Promise<TransmissionConfig | null> => {
    try {
      const config = await configClient.getConfig();
      
      if (config) {
        // Update Transmission client with stored settings
        const baseUrl = `${config.isSecure ? 'https' : 'http'}://${config.url}`;
        client.updateSettings({
          url: baseUrl,
          port: config.port,
          username: config.username || undefined,
          password: config.password || undefined
        });
      }
      
      return config;
    } catch (error) {
      console.error('Failed to get config:', error);
      return null;
    }
  },

  isInitialized: async (): Promise<boolean> => {
    try {
      const config = await configClient.getConfig();
      return config !== null;
    } catch {
      return false;
    }
  },

  clearConfig: async (): Promise<void> => {
    try {
      await configClient.clearConfig();
      // Reset Transmission client with empty settings
      client.updateSettings({ url: '', port: 9091 });
    } catch (error) {
      console.error('Failed to clear config:', error);
      throw error;
    }
  }
};