// src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { join } from 'path';
import { Low } from '@commonify/lowdb';
import { JSONFile } from '@commonify/lowdb/lib/adapters/JSONFile.js';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Define schema for config validation
const TransmissionConfigSchema = z.object({
  url: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  username: z.string(),
  password: z.string(),
  isSecure: z.boolean()
});

// Define database structure
interface DbSchema {
  config: z.infer<typeof TransmissionConfigSchema> | null;
}

// Default data
const defaultData: DbSchema = {
  config: null
}

// Initialize database
const file = join(__dirname, '../db.json');
const adapter = new JSONFile<DbSchema>(file);
const db = new Low(adapter);

// Ensure db.data is initialized
await db.read();
if (db.data === null) {
  db.data = defaultData;
  await db.write();
}

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(limiter);
app.use(cors());

// Routes
app.get('/config', async (_req: Request, res: Response) => {
  try {
    await db.read();
    res.json(db.data?.config || null);
  } catch {
    res.status(500).json({ error: 'Failed to read configuration' });
  }
});

app.post('/config', async (req: Request, res: Response) => {
  try {
    const config = TransmissionConfigSchema.parse(req.body);
    await db.read();
    if (!db.data) {
      db.data = defaultData;
    }
    db.data.config = config;
    await db.write();
    res.json(config);
  } catch {
    res.status(400).json({ error: 'Invalid configuration' });
  }
});

app.delete('/config', async (_req: Request, res: Response) => {
  try {
    await db.read();
    if (!db.data) {
      db.data = defaultData;
    }
    db.data.config = null;
    await db.write();
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'Failed to clear configuration' });
  }
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Config server listening at http://localhost:${port}`);
});