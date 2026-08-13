import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const DB_FILE = path.join(process.cwd(), 'db.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ availabilityStore: {}, isStoreOpen: true }));
}

function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { availabilityStore: {}, isStoreOpen: true };
  }
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to write to DB', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Disable caching for API routes
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // API Routes
  app.get('/api/store-status', (req, res) => {
    const db = readDB();
    res.json({ isOpen: db.isStoreOpen });
  });

  app.post('/api/store-status', (req, res) => {
    const { isOpen } = req.body;
    if (typeof isOpen === 'boolean') {
      const db = readDB();
      db.isStoreOpen = isOpen;
      writeDB(db);
      res.json({ success: true, isOpen: db.isStoreOpen });
    } else {
      res.status(400).json({ error: 'Invalid data' });
    }
  });

  app.get('/api/availability', (req, res) => {
    const db = readDB();
    res.json(db.availabilityStore);
  });

  app.post('/api/availability', (req, res) => {
    const { id, available } = req.body;
    if (typeof id === 'string' && typeof available === 'boolean') {
      const db = readDB();
      db.availabilityStore[id] = available;
      writeDB(db);
      res.json({ success: true, availability: db.availabilityStore });
    } else {
      res.status(400).json({ error: 'Invalid data' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
