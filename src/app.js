import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import authRoutes from './routes/auth.routes.js';
import catchRoutes from './routes/catches.routes.js';
import spotRoutes from './routes/spots.routes.js';
import statsRoutes from './routes/stats.routes.js';
import forecastRoutes from './routes/forecast.routes.js';
import aiRoutes from './routes/ai.routes.js';
import communityRoutes from './routes/community.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import reportRoutes from './routes/report.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          'https://nominatim.openstreetmap.org',
          'https://api.open-meteo.com',
        ],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        fontSrc: ["'self'"],
        workerSrc: ["'self'"],
        manifestSrc: ["'self'"],
      },
    },
  })
);
app.use(cors());
app.use(express.json({ limit: '10mb' })); // larger limit for base64 images
app.use(morgan('dev'));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'anglemate-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/catches', catchRoutes);
app.use('/api/spots', spotRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/community', communityRoutes);
app.use('/api', leaderboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin',  adminRoutes);

if (process.env.NODE_ENV === 'production') {
  const clientDist = join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(join(clientDist, 'index.html'));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
