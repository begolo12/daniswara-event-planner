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

// Update task progress
router.put('/my-tasks/:id/progress', auth, async (req, res) => {
  try {
    const task = await EventTask.findOne({ where: { id: req.params.id, pic_id: req.user.id } });
    if (!task) return formatResponse(res, { success: false, message: 'Tugas tidak ditemukan', statusCode: 404 });

    const { progress, status } = req.body;
    const updateData = {};
    if (progress !== undefined) updateData.progress = progress;
    if (status) updateData.status = status;
    if (progress === 100 || status === 'completed' || status === 'done') {
      updateData.progress = 100;
      updateData.status = 'completed';
    }
    await task.update(updateData);
    return formatResponse(res, { data: task, message: 'Progress berhasil diperbarui' });
  } catch (error) {
    console.error('Update progress error:', error);
    return formatResponse(res, { success: false, message: 'Gagal memperbarui progress', statusCode: 500 });
  }
});

// Update task notes
router.put('/my-tasks/:id', auth, async (req, res) => {
  try {
    const task = await EventTask.findOne({ where: { id: req.params.id, pic_id: req.user.id } });
    if (!task) return formatResponse(res, { success: false, message: 'Tugas tidak ditemukan', statusCode: 404 });

    const { notes } = req.body;
    if (notes !== undefined) await task.update({ notes });
    return formatResponse(res, { data: task, message: 'Catatan berhasil diperbarui' });
  } catch (error) {
    console.error('Update task error:', error);
    return formatResponse(res, { success: false, message: 'Gagal memperbarui tugas', statusCode: 500 });
  }
});

// Upload proof
router.post('/my-tasks/:id/proof', auth, async (req, res) => {
  try {
    const task = await EventTask.findOne({ where: { id: req.params.id, pic_id: req.user.id } });
    if (!task) return formatResponse(res, { success: false, message: 'Tugas tidak ditemukan', statusCode: 404 });

    // Placeholder: in production, use multer for file upload
    await task.update({ proof_url: 'uploaded' });
    return formatResponse(res, { data: task, message: 'Bukti berhasil diupload' });
  } catch (error) {
    console.error('Upload proof error:', error);
    return formatResponse(res, { success: false, message: 'Gagal upload bukti', statusCode: 500 });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Daniswara Event Planner API is running', timestamp: new Date().toISOString() });
});

export default router;
