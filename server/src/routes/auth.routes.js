import { Router } from 'express';
import { login, refresh, me, changePassword } from '../controllers/auth.controller.js';
import auth from '../middleware/auth.js';
import { loginValidation, handleValidation } from '../middleware/validate.js';
import { changePasswordRules } from '../utils/validators.js';
import { body } from 'express-validator';

const router = Router();

router.post('/login', loginValidation, login);
router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token harus diisi'),
  handleValidation,
], refresh);
router.get('/me', auth, me);
router.put('/password', auth, changePasswordRules, handleValidation, changePassword);

export default router;
