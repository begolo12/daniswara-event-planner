import { body } from 'express-validator';

export const loginRules = [
  body('email').isEmail().withMessage('Email tidak valid').normalizeEmail(),
  body('password').notEmpty().withMessage('Password harus diisi'),
];

export const createUserRules = [
  body('name').notEmpty().withMessage('Nama harus diisi'),
  body('email').isEmail().withMessage('Email tidak valid').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password minimal 8 karakter'),
  body('role').isIn(['super_admin', 'admin_event', 'pic_event', 'viewer']).withMessage('Role tidak valid'),
];

export const updateUserRules = [
  body('name').optional().notEmpty().withMessage('Nama tidak boleh kosong'),
  body('email').optional().isEmail().withMessage('Email tidak valid').normalizeEmail(),
  body('role').optional().isIn(['super_admin', 'admin_event', 'pic_event', 'viewer']).withMessage('Role tidak valid'),
];

export const changePasswordRules = [
  body('current_password').notEmpty().withMessage('Password lama harus diisi'),
  body('new_password').isLength({ min: 8 }).withMessage('Password baru minimal 8 karakter'),
];

export const createEventRules = [
  body('name').notEmpty().withMessage('Nama event harus diisi'),
  body('event_type_id').isInt().withMessage('Tipe event harus dipilih'),
  body('event_date').notEmpty().withMessage('Tanggal event harus diisi'),
];

export const createThemeRules = [
  body('theme_name').notEmpty().withMessage('Nama tema harus diisi'),
];

export const createTimelineRules = [
  body('phase').notEmpty().withMessage('Fase harus diisi'),
  body('activity').notEmpty().withMessage('Aktivitas harus diisi'),
];

export const createRundownRules = [
  body('agenda').notEmpty().withMessage('Agenda harus diisi'),
  body('start_time').notEmpty().withMessage('Jam mulai harus diisi'),
];

export const createChecklistRules = [
  body('item_name').notEmpty().withMessage('Nama item harus diisi'),
  body('category').notEmpty().withMessage('Kategori harus diisi'),
];

export const createTaskRules = [
  body('task_name').notEmpty().withMessage('Nama tugas harus diisi'),
  body('pic_id').isInt().withMessage('PIC harus dipilih'),
];

export const createBudgetRules = [
  body('item').notEmpty().withMessage('Item harus diisi'),
  body('category').notEmpty().withMessage('Kategori harus diisi'),
];

export const createVendorRules = [
  body('vendor_name').notEmpty().withMessage('Nama vendor harus diisi'),
];

export const createDocumentRules = [
  body('doc_type').notEmpty().withMessage('Jenis dokumen harus diisi'),
  body('title').notEmpty().withMessage('Judul dokumen harus diisi'),
];

export const createApprovalRules = [
  body('status').isIn(['approved', 'revisi', 'rejected']).withMessage('Status approval tidak valid'),
];

export const createFeedbackRules = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating harus antara 1-5'),
];

export const createRiskRules = [
  body('risk').notEmpty().withMessage('Risiko harus diisi'),
];
