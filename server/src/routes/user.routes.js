import { Router } from 'express';
import { list, create, getDetail, update, remove, toggleActive } from '../controllers/user.controller.js';
import auth from '../middleware/auth.js';
import rbac from '../middleware/rbac.js';
import { handleValidation } from '../middleware/validate.js';
import { createUserRules, updateUserRules } from '../utils/validators.js';

const router = Router();

router.use(auth);
router.use(rbac('super_admin'));

router.get('/', list);
router.post('/', createUserRules, handleValidation, create);
router.get('/:id', getDetail);
router.put('/:id', updateUserRules, handleValidation, update);
router.delete('/:id', remove);
router.put('/:id/toggle', toggleActive);

export default router;
