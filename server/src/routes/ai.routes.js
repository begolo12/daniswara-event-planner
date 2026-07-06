import { Router } from 'express';
import { generateEvent, generate, getLogs, testConnection } from '../controllers/ai.controller.js';
import auth from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(auth);
router.use(aiLimiter);

// Full event generation
router.post('/generate-event', [
  (req, res, next) => {
    if (!req.body.eventData && !req.body.event_name && !req.body.name) {
      return res.status(400).json({
        success: false,
        message: 'Data event harus diisi',
        errors: [{ field: 'eventData', message: 'Data event harus diisi' }],
      });
    }
    next();
  },
], generateEvent);

// Partial generation (individual types)
router.post('/generate', generate);

// Individual generation types — frontend calls /ai/generate/theme etc.
const types = ['theme', 'timeline', 'rundown', 'checklist', 'budget', 'mc-script', 'speech', 'invitation', 'proposal', 'tor', 'report', 'evaluation', 'caption', 'doc-brief', 'risk'];
types.forEach((type) => {
  router.post(`/generate/${type}`, (req, res) => {
    req.body.type = type;
    if (!req.body.context) req.body.context = req.body;
    generate(req, res);
  });
});

router.get('/logs', getLogs);
router.post('/test-connection', testConnection);

export default router;
