import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  themes, timelines, rundowns, checklists, tasks, budgets, vendors, documents, risks,
  selectTheme, reorder, toggleChecklistStatus, updateTaskProgress, budgetSummary,
  exportDocument, approvals, evaluation, feedback,
} from '../controllers/eventSub.controller.js';
import { EventTimeline, EventRundown, EventChecklist, EventDocument } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';
import auth from '../middleware/auth.js';
import { eventIdParam, handleValidation } from '../middleware/validate.js';
import {
  createThemeRules, createTimelineRules, createRundownRules,
  createChecklistRules, createTaskRules, createBudgetRules,
  createVendorRules, createDocumentRules, createApprovalRules, createFeedbackRules,
} from '../utils/validators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/documents'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipe file tidak didukung'), false);
    }
  },
});

const router = Router({ mergeParams: true });

router.use(auth);
router.use(eventIdParam);

// ── Themes ─────────────────────────────────────────────
router.get('/themes', themes.list);
router.post('/themes', createThemeRules, handleValidation, themes.create);
router.post('/themes/:id/select', selectTheme);

// ── Timelines ──────────────────────────────────────────
router.get('/timelines', timelines.list);
router.post('/timelines', createTimelineRules, handleValidation, timelines.create);
router.put('/timelines/reorder', reorder(EventTimeline));
router.put('/timelines/:id', timelines.update);
router.delete('/timelines/:id', timelines.remove);

// ── Rundowns ───────────────────────────────────────────
router.get('/rundowns', rundowns.list);
router.post('/rundowns', createRundownRules, handleValidation, rundowns.create);
router.put('/rundowns/reorder', reorder(EventRundown));
router.put('/rundowns/:id', rundowns.update);
router.delete('/rundowns/:id', rundowns.remove);

// ── Checklists ─────────────────────────────────────────
router.get('/checklists', checklists.list);
router.post('/checklists', createChecklistRules, handleValidation, checklists.create);
router.put('/checklists/:id/status', toggleChecklistStatus);
router.put('/checklists/:id', checklists.update);
router.delete('/checklists/:id', checklists.remove);

// ── Tasks ──────────────────────────────────────────────
router.get('/tasks', tasks.list);
router.post('/tasks', createTaskRules, handleValidation, tasks.create);
router.put('/tasks/:id/progress', updateTaskProgress);
router.put('/tasks/:id', tasks.update);
router.delete('/tasks/:id', tasks.remove);

// ── Budgets ────────────────────────────────────────────
router.get('/budgets', budgets.list);
router.post('/budgets', createBudgetRules, handleValidation, budgets.create);
router.get('/budgets/summary', budgetSummary);
router.put('/budgets/:id', budgets.update);
router.delete('/budgets/:id', budgets.remove);

// ── Vendors ────────────────────────────────────────────
router.get('/vendors', vendors.list);
router.post('/vendors', createVendorRules, handleValidation, vendors.create);
router.put('/vendors/:id', vendors.update);
router.delete('/vendors/:id', vendors.remove);

// ── Documents ─────────────────────────────────────────
router.get('/documents', documents.list);
router.post('/documents', createDocumentRules, handleValidation, documents.create);
router.get('/documents/:id', documents.getDetail);
router.put('/documents/:id', documents.update);
router.delete('/documents/:id', documents.remove);
router.get('/documents/:id/export', exportDocument);

// Document file upload
router.post('/documents/:id/proof', upload.single('file'), async (req, res) => {
  try {
    const doc = await EventDocument.findOne({ where: { id: req.params.id, event_id: req.params.eventId } });
    if (!doc) return formatResponse(res, { success: false, message: 'Dokumen tidak ditemukan', statusCode: 404 });

    if (!req.file) {
      return formatResponse(res, { success: false, message: 'Tidak ada file yang diupload', statusCode: 400 });
    }

    const fileUrl = `/uploads/documents/${req.file.filename}`;
    await doc.update({
      file_url: fileUrl,
      file_name: req.file.originalname,
      file_size: req.file.size,
      file_type: req.file.mimetype,
    });

    return formatResponse(res, { data: doc, message: 'File berhasil diupload' });
  } catch (error) {
    console.error('Upload proof error:', error);
    return formatResponse(res, { success: false, message: 'Gagal upload file', statusCode: 500 });
  }
});

// ── Approvals ─────────────────────────────────────────
router.get('/approvals', approvals.list);
router.post('/approvals', createApprovalRules, handleValidation, approvals.create);

// ── Evaluation ────────────────────────────────────────
router.get('/evaluation', evaluation.get);
router.post('/evaluation', evaluation.create);

// ── Feedback ──────────────────────────────────────────
router.get('/evaluation/feedback', feedback.list);
router.post('/evaluation/feedback', createFeedbackRules, handleValidation, feedback.create);

// ── Risks ─────────────────────────────────────────────
router.get('/risks', risks.list);
router.post('/risks', risks.create);
router.put('/risks/:id', risks.update);
router.delete('/risks/:id', risks.remove);

export default router;
