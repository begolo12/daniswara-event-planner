import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';

const app = express();

// ── Middleware ─────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Root endpoint (for Render health check) ───────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Daniswara Event Planner API',
    version: '1.0.0',
    health: '/api/health',
    docs: '/api',
  });
});

// ── Static files (uploads) ────────────────────────────
app.use('/uploads', express.static('uploads'));

// ── Routes ────────────────────────────────────────────
app.use('/api', routes);

// ── 404 ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// ── Error handler ─────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan server internal' });
});

export default app;
