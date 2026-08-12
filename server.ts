import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// In-memory availability store
// Key: item id, Value: boolean (true = available, false = unavailable)
const availabilityStore: Record<string, boolean> = {};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/availability', (req, res) => {
    res.json(availabilityStore);
  });

  app.post('/api/availability', (req, res) => {
    const { id, available } = req.body;
    if (typeof id === 'string' && typeof available === 'boolean') {
      availabilityStore[id] = available;
      res.json({ success: true, availability: availabilityStore });
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
