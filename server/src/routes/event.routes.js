import { Router } from 'express';
import { list, create, getDetail, update, remove, changeStatus, submitForApproval, approve, reject } from '../controllers/event.controller.js';
import auth from '../middleware/auth.js';
import rbac from '../middleware/rbac.js';
import { createEventValidation, handleValidation } from '../middleware/validate.js';
import { body } from 'express-validator';

const router = Router();

router.use(auth);

router.get('/', list);
router.post('/', rbac('super_admin', 'admin_event', 'pic_event'), createEventValidation, handleValidation, create);
router.get('/:id', getDetail);
router.put('/:id', rbac('super_admin', 'admin_event', 'pic_event'), update);
router.delete('/:id', rbac('super_admin', 'admin_event'), remove);

// Status management
router.put('/:id/status', rbac('super_admin', 'admin_event', 'pic_event'), [
  body('status').notEmpty().withMessage('Status harus diisi'),
  handleValidation,
], changeStatus);

router.post('/:id/submit', rbac('super_admin', 'admin_event', 'pic_event'), submitForApproval);
router.post('/:id/submit-approval', rbac('super_admin', 'admin_event', 'pic_event'), submitForApproval);
router.post('/:id/approve', rbac('super_admin', 'admin_event'), approve);
router.post('/:id/reject', rbac('super_admin', 'admin_event'), [
  body('notes').optional().isString(),
  handleValidation,
], reject);

export default router;
