// src/components/InitializationDialog.tsx
import { useState, useRef } from 'react';
import { Settings, AlertCircle, Loader2 } from 'lucide-react';
import { configManager } from '@/lib/config';
import { client } from '@/lib/api/client';
import Toast from './Toast';

export default function InitializationDialog() {
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState(9091);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSecure, setIsSecure] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

//   const constructUrl = (host: string, port: number): string => {
//     // Remove any protocol prefix if present
//     let cleanHost = host.replace(/^https?:\/\//, '');
//     // Remove any trailing slashes
//     cleanHost = cleanHost.replace(/\/+$/, '');
//     // Add appropriate protocol
//     const protocol = isSecure ? 'https' : 'http';
//     return `${protocol}://${cleanHost}:${port}/transmission/rpc`;
//   };

  const validateForm = (): boolean => {
    if (!host.trim()) {
      setError('Host is required');
      return false;
    }
    if (!port || port < 1 || port > 65535) {
      setError('Port must be between 1 and 65535');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError(null);
    setIsSubmitting(true);

    try {
      // Construct the Transmission RPC URL
      const transmissionUrl = `${isSecure ? 'https' : 'http'}://${host}:${port}/transmission/rpc`;

      // Update Transmission client settings
      client.updateSettings({
        url: transmissionUrl,
        port,
        username: username || undefined,
        password: password || undefined
      });

      // Test connection to Transmission
      const response = await client.getSession();
      if (response.result === 'success') {
        // If connection successful, save config to our config server
        await configManager.saveConfig({
          url: host,
          port,
          username,
          password,
          isSecure
        });
        
        setToastMessage('Configuration saved successfully');
        window.location.reload();
      } else {
        throw new Error('Failed to connect to Transmission');
      }
    } catch (err) {
      console.error('Connection error:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('401')) {
          setError('Authentication failed. Please check your username and password.');
        } else if (err.message.includes('ECONNREFUSED')) {
          setError('Connection refused. Please check if Transmission is running and the port is correct.');
        } else if (err.message.includes('Network Error')) {
          setError('Network error. Please check your host and port settings.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to connect to Transmission');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      formRef.current?.requestSubmit();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Welcome to Cinematix</h1>
        </div>

        <p className="mb-6 text-muted-foreground">
          Please configure your Transmission connection settings to get started.
        </p>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" onKeyDown={handleKeyDown}>
          <div>
            <label className="text-sm font-medium">Host</label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="localhost"
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Enter hostname or IP address (e.g., localhost, 192.168.1.100)
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Port</label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value))}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              min="1"
              max="65535"
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Default Transmission port is 9091
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Username (optional)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password (optional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="secure"
              checked={isSecure}
              onChange={(e) => setIsSecure(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="secure" className="text-sm font-medium">
              Use HTTPS
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </span>
            ) : (
              'Save Configuration'
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            The connection will be tested before saving
          </p>
        </form>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}