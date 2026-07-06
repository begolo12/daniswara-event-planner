import { Router } from 'express';
import { list } from '../controllers/activityLog.controller.js';
import auth from '../middleware/auth.js';
import rbac from '../middleware/rbac.js';

const router = Router();

router.use(auth);
router.use(rbac('super_admin'));

router.get('/', list);

export default router;
