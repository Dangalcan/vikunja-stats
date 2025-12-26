import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';
// import { connectDB, disconnectDB } from './src/db.js';
// import verifyToken from './src/middlewares/authMiddlewares.js';

// Routes
import metricsRoutes from './src/routes/metricsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cors());

// Middlewares globales
// app.use(verifyToken);

// Rutas
metricsRoutes(app);

// Export for tests
export default app;

let server;

if (process.env.NODE_ENV !== 'test') {
//   await connectDB();

  server = app.listen(PORT, () => {
    logger.info(`API running at http://localhost:${PORT}`);
    logger.info(`Metrics endpoint: http://localhost:${PORT}/api/v1/metrics`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
  });
}

async function gracefulShutdown(signal) {
  logger.warn(`${signal} received. Starting secure shutdown...`);

  if (server) {
    server.close(async () => {
      try {
        await disconnectDB();
        logger.info('DB disconnected');
      } catch (err) {
        logger.error('Error disconnecting DB', err);
      }

      process.exit(0);
    });
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
