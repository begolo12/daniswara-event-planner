import { Router } from 'express';
import {
  themes, timelines, rundowns, checklists, tasks, budgets, vendors, documents, risks,
  selectTheme, reorder, toggleChecklistStatus, updateTaskProgress, budgetSummary,
  exportDocument, approvals, evaluation, feedback,
} from '../controllers/eventSub.controller.js';
import { EventTimeline, EventRundown, EventChecklist } from '../models/index.js';
import auth from '../middleware/auth.js';
import { eventIdParam, handleValidation } from '../middleware/validate.js';
import {
  createThemeRules, createTimelineRules, createRundownRules,
  createChecklistRules, createTaskRules, createBudgetRules,
  createVendorRules, createDocumentRules, createApprovalRules, createFeedbackRules,
} from '../utils/validators.js';

const router = Router({ mergeParams: true });

router.use(auth);
router.use(eventIdParam);

// ── Themes ────────────────────────────────────────────
router.get('/themes', themes.list);
router.post('/themes', createThemeRules, handleValidation, themes.create);
router.get('/themes/:id', themes.getDetail);
router.put('/themes/:id', themes.update);
router.delete('/themes/:id', themes.remove);
router.put('/themes/:id/select', selectTheme);

// ── Timelines ─────────────────────────────────────────
router.get('/timelines', timelines.list);
router.post('/timelines', createTimelineRules, handleValidation, timelines.create);
router.get('/timelines/:id', timelines.getDetail);
router.put('/timelines/:id', timelines.update);
router.delete('/timelines/:id', timelines.remove);
router.put('/timelines-reorder', reorder(EventTimeline));

// ── Rundowns ──────────────────────────────────────────
router.get('/rundowns', rundowns.list);
router.post('/rundowns', createRundownRules, handleValidation, rundowns.create);
router.get('/rundowns/:id', rundowns.getDetail);
router.put('/rundowns/:id', rundowns.update);
router.delete('/rundowns/:id', rundowns.remove);
router.put('/rundowns-reorder', reorder(EventRundown));

// ── Checklists ────────────────────────────────────────
router.get('/checklists', checklists.list);
router.post('/checklists', createChecklistRules, handleValidation, checklists.create);
router.get('/checklists/:id', checklists.getDetail);
router.put('/checklists/:id', checklists.update);
router.delete('/checklists/:id', checklists.remove);
router.put('/checklists/:id/status', toggleChecklistStatus);

// ── Tasks ─────────────────────────────────────────────
router.get('/tasks', tasks.list);
router.post('/tasks', createTaskRules, handleValidation, tasks.create);
router.get('/tasks/:id', tasks.getDetail);
router.put('/tasks/:id', tasks.update);
router.delete('/tasks/:id', tasks.remove);
router.put('/tasks/:id/progress', updateTaskProgress);

// ── Budgets ───────────────────────────────────────────
router.get('/budgets', budgets.list);
router.get('/budgets/summary', budgetSummary);
router.post('/budgets', createBudgetRules, handleValidation, budgets.create);
router.get('/budgets/:id', budgets.getDetail);
router.put('/budgets/:id', budgets.update);
router.delete('/budgets/:id', budgets.remove);

// ── Vendors ───────────────────────────────────────────
router.get('/vendors', vendors.list);
router.post('/vendors', createVendorRules, handleValidation, vendors.create);
router.get('/vendors/:id', vendors.getDetail);
router.put('/vendors/:id', vendors.update);
router.delete('/vendors/:id', vendors.remove);

// ── Documents ─────────────────────────────────────────
router.get('/documents', documents.list);
router.post('/documents', createDocumentRules, handleValidation, documents.create);
router.get('/documents/:id', documents.getDetail);
router.put('/documents/:id', documents.update);
router.delete('/documents/:id', documents.remove);
router.get('/documents/:id/export', exportDocument);

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
router.get('/risks/:id', risks.getDetail);
router.put('/risks/:id', risks.update);
router.delete('/risks/:id', risks.remove);

export default router;
