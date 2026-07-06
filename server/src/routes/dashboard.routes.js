import { Router } from 'express';
import { stats, calendar, upcoming, overdue } from '../controllers/dashboard.controller.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.get('/stats', stats);
router.get('/calendar', calendar);
router.get('/upcoming', upcoming);
router.get('/overdue', overdue);

export default router;
