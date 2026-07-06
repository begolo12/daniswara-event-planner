import { Router } from 'express';
import { eventTypes, vendors, venues, equipments } from '../controllers/master.controller.js';
import auth from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';
import { body } from 'express-validator';

const router = Router();

router.use(auth);

// ── Event Types ───────────────────────────────────────
router.get('/event-types', eventTypes.list);
router.post('/event-types', [
  body('name').notEmpty().withMessage('Nama harus diisi'),
  body('slug').notEmpty().withMessage('Slug harus diisi'),
  handleValidation,
], eventTypes.create);
router.get('/event-types/:id', eventTypes.getDetail);
router.put('/event-types/:id', eventTypes.update);
router.delete('/event-types/:id', eventTypes.remove);

// ── Vendors ───────────────────────────────────────────
router.get('/vendors', vendors.list);
router.post('/vendors', [
  body('name').notEmpty().withMessage('Nama vendor harus diisi'),
  handleValidation,
], vendors.create);
router.get('/vendors/:id', vendors.getDetail);
router.put('/vendors/:id', vendors.update);
router.delete('/vendors/:id', vendors.remove);

// ── Venues ────────────────────────────────────────────
router.get('/venues', venues.list);
router.post('/venues', [
  body('name').notEmpty().withMessage('Nama venue harus diisi'),
  handleValidation,
], venues.create);
router.get('/venues/:id', venues.getDetail);
router.put('/venues/:id', venues.update);
router.delete('/venues/:id', venues.remove);

// ── Equipments ────────────────────────────────────────
router.get('/equipments', equipments.list);
router.post('/equipments', [
  body('name').notEmpty().withMessage('Nama peralatan harus diisi'),
  handleValidation,
], equipments.create);
router.get('/equipments/:id', equipments.getDetail);
router.put('/equipments/:id', equipments.update);
router.delete('/equipments/:id', equipments.remove);

export default router;
