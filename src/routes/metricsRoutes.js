import logger from '../../logger.js';
import { getMetricsSummary } from '../services/vikunjaService.js';

export default function metricsRoutes(app) {
  app.get('/api/v1/metrics', async (req, res) => {
    try {
      const data = await getMetricsSummary();
      res.json(data);
    } catch (error) {
      logger.error(`Error obtaining metrics: ${error}`);
      res.status(500).json({ error: 'Obtaining metrics' });
    }
  });
}
