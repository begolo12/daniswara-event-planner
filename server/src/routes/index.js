import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import eventRoutes from './event.routes.js';
import eventSubRoutes from './eventSub.routes.js';
import aiRoutes from './ai.routes.js';
import aiSettingRoutes from './aiSetting.routes.js';
import masterRoutes from './master.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import reportRoutes from './report.routes.js';
import activityLogRoutes from './activityLog.routes.js';
import auth from '../middleware/auth.js';
import { EventTask, Event } from '../models/index.js';
import { formatResponse, paginate, paginationMeta } from '../utils/helpers.js';
import { generalLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(generalLimiter);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/events/:eventId', eventSubRoutes);
router.use('/ai', aiRoutes);
router.use('/ai-settings', aiSettingRoutes);
router.use('/master', masterRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/activity-logs', activityLogRoutes);

// My Tasks — tasks assigned to current user
router.get('/my-tasks', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const { limit: lim, offset } = paginate(page, limit);

    const where = { pic_id: req.user.id };
    if (status) where.status = status;

    const { count, rows } = await EventTask.findAndCountAll({
      where,
      include: [{ model: Event, attributes: ['id', 'name', 'event_date', 'status'] }],
      limit: lim,
      offset,
      order: [['deadline', 'ASC']],
    });

    return formatResponse(res, {
      data: rows,
      pagination: paginationMeta(count, page, lim),
    });
  } catch (error) {
    console.error('My tasks error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengambil tugas', statusCode: 500 });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Daniswara Event Planner API is running', timestamp: new Date().toISOString() });
});

export default router;
