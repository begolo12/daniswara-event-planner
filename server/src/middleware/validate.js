import { body, param, query, validationResult } from 'express-validator';

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

export const loginValidation = [
  body('email').isEmail().withMessage('Email tidak valid').normalizeEmail(),
  body('password').notEmpty().withMessage('Password harus diisi'),
  handleValidation,
];

export const createUserValidation = [
  body('name').notEmpty().withMessage('Nama harus diisi'),
  body('email').isEmail().withMessage('Email tidak valid').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password minimal 8 karakter'),
  body('role').isIn(['super_admin', 'admin_event', 'pic_event', 'viewer']).withMessage('Role tidak valid'),
  handleValidation,
];

export const createEventValidation = [
  body('name').notEmpty().withMessage('Nama event harus diisi'),
  body('event_type_id').isInt().withMessage('Tipe event harus dipilih'),
  body('event_date').notEmpty().withMessage('Tanggal event harus diisi'),
  handleValidation,
];

export const createTimelineValidation = [
  body('phase').notEmpty().withMessage('Fase harus diisi'),
  body('activity').notEmpty().withMessage('Aktivitas harus diisi'),
  handleValidation,
];

export const createRundownValidation = [
  body('agenda').notEmpty().withMessage('Agenda harus diisi'),
  body('start_time').notEmpty().withMessage('Jam mulai harus diisi'),
  handleValidation,
];

export const createChecklistValidation = [
  body('item_name').notEmpty().withMessage('Nama item harus diisi'),
  body('category').notEmpty().withMessage('Kategori harus diisi'),
  handleValidation,
];

export const createTaskValidation = [
  body('task_name').notEmpty().withMessage('Nama tugas harus diisi'),
  body('pic_id').isInt().withMessage('PIC harus dipilih'),
  handleValidation,
];

export const createBudgetValidation = [
  body('item').notEmpty().withMessage('Item harus diisi'),
  body('category').notEmpty().withMessage('Kategori harus diisi'),
  handleValidation,
];

export const eventIdParam = [
  param('eventId').isInt().withMessage('Event ID tidak valid'),
  handleValidation,
];
