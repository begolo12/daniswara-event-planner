import { Router } from 'express';
import { listEvents, getEventReport, generateReport, budgetReport } from '../controllers/report.controller.js';
import { Event, EventTheme, EventTimeline, EventRundown, EventChecklist, EventTask, EventBudget, RiskBackupPlan, EventDocument, EventEvaluation, EventType } from '../models/index.js';
import { generateEventBuffer } from '../services/export.service.js';
import { formatResponse } from '../utils/helpers.js';
import auth from '../middleware/auth.js';
import rbac from '../middleware/rbac.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(auth);

// List & summary routes (no :id param)
router.get('/events', listEvents);
router.get('/budget', budgetReport);

// === EXPORT ROUTES (must be before /:id routes) ===

router.get('/events/:id/export-docx', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: EventType },
        { model: EventTheme, as: 'themes' },
        { model: EventTimeline, as: 'timelines' },
        { model: EventRundown, as: 'rundowns' },
        { model: EventChecklist, as: 'checklists' },
        { model: EventTask, as: 'tasks' },
        { model: EventBudget, as: 'budgets' },
        { model: RiskBackupPlan, as: 'risks' },
        { model: EventDocument, as: 'documents' },
        { model: EventEvaluation, as: 'evaluations' },
      ],
    });

    if (!event) {
      return formatResponse(res, { success: false, message: 'Event tidak ditemukan', statusCode: 404 });
    }

    const eventData = {
      event_name: event.name,
      event_type: event.EventType?.name || '-',
      event_date: event.event_date,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location,
      event_format: event.format,
      participant_count: event.estimated_participants,
      event_goal: event.goal,
      tone: event.tone,
      budget: event.budget_max,
    };

    const aiResult = {
      event_brief: {
        event_name: event.name,
        event_type: event.EventType?.name || '-',
        event_goal: event.goal,
        main_concept: event.goal,
        tone: event.tone,
        key_message: event.notes || '-',
        success_indicators: ['Event terlaksana sesuai rencana', 'Budget tidak melebihi anggaran', 'Peserta puas dengan acara'],
      },
      themes: (event.themes || []).map(t => ({
        theme_name: t.theme_name, tagline: t.tagline, philosophy: t.philosophy,
        visual_direction: t.visual_direction, dominant_colors: t.dominant_colors, decoration_ideas: t.decoration_ideas,
      })),
      timelines: (event.timelines || []).map(t => ({
        phase: t.phase, date: t.date, activity: t.activity,
        pic: t.pic_id || '-', priority: t.priority, status: t.status,
      })),
      rundowns: (event.rundowns || []).map(r => ({
        start_time: r.start_time, end_time: r.end_time, duration: r.duration,
        agenda: r.agenda, activity_detail: r.activity_detail,
        technical_needs: r.technical_needs, mc_notes: r.mc_notes,
      })),
      checklists: (event.checklists || []).map(c => ({
        category: c.category, item_name: c.item_name, quantity: c.quantity,
        priority: c.priority, pic: c.pic_id || '-', deadline: c.deadline, estimated_cost: c.estimated_cost,
      })),
      budgets: (event.budgets || []).map(b => ({
        category: b.category, item: b.item, quantity: b.quantity, unit_price: b.unit_price,
        total_price: b.total_price, priority: b.priority, saving_alternative: b.saving_alternative,
      })),
      tasks: (event.tasks || []).map(t => ({
        task_name: t.task_name, description: t.description, pic: t.pic_id || '-',
        deadline: t.deadline, priority: t.priority, status: t.status,
      })),
      risks: (event.risks || []).map(r => ({
        risk: r.risk, impact: r.impact, probability: r.probability,
        backup_plan: r.backup_plan, pic: r.pic_id || '-',
      })),
      documents: {
        invitation_draft: (event.documents || []).find(d => d.doc_type === 'invitation')?.content || '',
        mc_script: (event.documents || []).find(d => d.doc_type === 'mc_script')?.content || '',
        director_speech: (event.documents || []).find(d => d.doc_type === 'director_speech')?.content || '',
        committee_speech: (event.documents || []).find(d => d.doc_type === 'committee_speech')?.content || '',
        event_proposal: (event.documents || []).find(d => d.doc_type === 'proposal')?.content || '',
      },
      post_event_evaluation: {
        feedback_questions: ['Apakah tujuan event tercapai?', 'Bagaimana kepuasan peserta?', 'Apakah budget sesuai?'],
        evaluation_points: event.evaluations?.[0] ? [event.evaluations[0].improvement_notes || ''] : [],
        improvement_recommendations: event.evaluations?.[0] ? [event.evaluations[0].recommendations || ''] : [],
      },
    };

    const buffer = await generateEventBuffer(eventData, aiResult);
    const filename = `Event-${(event.name || 'report').replace(/[^a-zA-Z0-9]/g, '-')}-${event.event_date || 'draft'}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Export docx error:', error);
    return formatResponse(res, { success: false, message: `Gagal export: ${error.message}`, statusCode: 500 });
  }
});

// Export AI result directly (before saving to event)
router.post('/export-ai-docx', async (req, res) => {
  try {
    const { eventData, aiResult } = req.body;
    if (!eventData || !aiResult) {
      return formatResponse(res, { success: false, message: 'Data event dan hasil AI harus diisi', statusCode: 400 });
    }
    const buffer = await generateEventBuffer(eventData, aiResult);
    const filename = `Event-${(eventData.event_name || 'AI-Generate').replace(/[^a-zA-Z0-9]/g, '-')}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Export AI docx error:', error);
    return formatResponse(res, { success: false, message: `Gagal export: ${error.message}`, statusCode: 500 });
  }
});

// === DYNAMIC :id ROUTES (after export routes) ===

router.get('/events/:id', getEventReport);
router.post('/events/:id/generate', rbac('super_admin', 'admin_event'), aiLimiter, generateReport);

export default router;
