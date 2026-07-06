import {
  Event, EventTheme, EventTimeline, EventRundown, EventChecklist,
  EventTask, EventBudget, EventVendor, EventDocument, EventApproval,
  EventEvaluation, EventFeedback, RiskBackupPlan,
} from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';
import { Op } from 'sequelize';

// ── Generic CRUD Factory ──────────────────────────────
function createSubController(Model, alias, eventName = 'sub-resource') {
  return {
    async list(req, res) {
      try {
        const items = await Model.findAll({
          where: { event_id: req.params.eventId },
          order: [['sort_order', 'ASC'], ['createdAt', 'ASC']],
        });
        return formatResponse(res, { data: items });
      } catch (error) {
        console.error(`List ${eventName} error:`, error);
        return formatResponse(res, { success: false, message: `Gagal mengambil data ${eventName}`, statusCode: 500 });
      }
    },

    async create(req, res) {
      try {
        const event = await Event.findByPk(req.params.eventId);
        if (!event) return formatResponse(res, { success: false, message: 'Event tidak ditemukan', statusCode: 404 });

        const item = await Model.create({ ...req.body, event_id: req.params.eventId });
        return formatResponse(res, { data: item, message: `${eventName} berhasil dibuat`, statusCode: 201 });
      } catch (error) {
        console.error(`Create ${eventName} error:`, error);
        return formatResponse(res, { success: false, message: `Gagal membuat ${eventName}`, statusCode: 500 });
      }
    },

    async getDetail(req, res) {
      try {
        const item = await Model.findOne({
          where: { id: req.params.id, event_id: req.params.eventId },
        });
        if (!item) return formatResponse(res, { success: false, message: `${eventName} tidak ditemukan`, statusCode: 404 });
        return formatResponse(res, { data: item });
      } catch (error) {
        console.error(`Get ${eventName} error:`, error);
        return formatResponse(res, { success: false, message: `Gagal mengambil data ${eventName}`, statusCode: 500 });
      }
    },

    async update(req, res) {
      try {
        const item = await Model.findOne({
          where: { id: req.params.id, event_id: req.params.eventId },
        });
        if (!item) return formatResponse(res, { success: false, message: `${eventName} tidak ditemukan`, statusCode: 404 });

        await item.update(req.body);
        return formatResponse(res, { data: item, message: `${eventName} berhasil diperbarui` });
      } catch (error) {
        console.error(`Update ${eventName} error:`, error);
        return formatResponse(res, { success: false, message: `Gagal memperbarui ${eventName}`, statusCode: 500 });
      }
    },

    async remove(req, res) {
      try {
        const item = await Model.findOne({
          where: { id: req.params.id, event_id: req.params.eventId },
        });
        if (!item) return formatResponse(res, { success: false, message: `${eventName} tidak ditemukan`, statusCode: 404 });

        await item.destroy();
        return formatResponse(res, { message: `${eventName} berhasil dihapus` });
      } catch (error) {
        console.error(`Delete ${eventName} error:`, error);
        return formatResponse(res, { success: false, message: `Gagal menghapus ${eventName}`, statusCode: 500 });
      }
    },
  };
}

// ── Instantiate CRUD controllers ──────────────────────
export const themes = createSubController(EventTheme, 'themes', 'Tema');
export const timelines = createSubController(EventTimeline, 'timelines', 'Timeline');
export const rundowns = createSubController(EventRundown, 'rundowns', 'Rundown');
export const checklists = createSubController(EventChecklist, 'checklists', 'Checklist');
export const tasks = createSubController(EventTask, 'tasks', 'Tugas');
export const budgets = createSubController(EventBudget, 'budgets', 'Budget');
export const vendors = createSubController(EventVendor, 'vendors', 'Vendor');
export const documents = createSubController(EventDocument, 'documents', 'Dokumen');
export const risks = createSubController(RiskBackupPlan, 'risks', 'Risiko');

// ── Theme: Select ─────────────────────────────────────
export async function selectTheme(req, res) {
  try {
    const theme = await EventTheme.findOne({
      where: { id: req.params.id, event_id: req.params.eventId },
    });
    if (!theme) return formatResponse(res, { success: false, message: 'Tema tidak ditemukan', statusCode: 404 });

    // Deselect all themes for this event
    await EventTheme.update({ is_selected: false }, { where: { event_id: req.params.eventId } });
    // Select this one
    await theme.update({ is_selected: true });

    return formatResponse(res, { data: theme, message: 'Tema berhasil dipilih' });
  } catch (error) {
    console.error('Select theme error:', error);
    return formatResponse(res, { success: false, message: 'Gagal memilih tema', statusCode: 500 });
  }
}

// ── Reorder: Generic for any sorted model ─────────────
export function reorder(Model) {
  return async (req, res) => {
    try {
      const { items } = req.body; // [{ id, sort_order }]
      if (!Array.isArray(items)) {
        return formatResponse(res, { success: false, message: 'Format data tidak valid', statusCode: 400 });
      }

      for (const item of items) {
        await Model.update(
          { sort_order: item.sort_order },
          { where: { id: item.id, event_id: req.params.eventId } }
        );
      }

      return formatResponse(res, { message: 'Urutan berhasil diperbarui' });
    } catch (error) {
      console.error('Reorder error:', error);
      return formatResponse(res, { success: false, message: 'Gagal memperbarui urutan', statusCode: 500 });
    }
  };
}

// ── Checklist: Toggle Status ──────────────────────────
export async function toggleChecklistStatus(req, res) {
  try {
    const item = await EventChecklist.findOne({
      where: { id: req.params.id, event_id: req.params.eventId },
    });
    if (!item) return formatResponse(res, { success: false, message: 'Checklist tidak ditemukan', statusCode: 404 });

    const cycle = { not_started: 'in_progress', in_progress: 'done', done: 'not_started' };
    await item.update({ status: cycle[item.status] });

    return formatResponse(res, { data: item, message: 'Status checklist berhasil diubah' });
  } catch (error) {
    console.error('Toggle checklist error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengubah status', statusCode: 500 });
  }
}

// ── Task: Update Progress ─────────────────────────────
export async function updateTaskProgress(req, res) {
  try {
    const task = await EventTask.findOne({
      where: { id: req.params.id, event_id: req.params.eventId },
    });
    if (!task) return formatResponse(res, { success: false, message: 'Tugas tidak ditemukan', statusCode: 404 });

    const { progress } = req.body;
    const updateData = { progress: Math.min(100, Math.max(0, progress)) };
    if (updateData.progress === 100) updateData.status = 'done';
    else if (updateData.progress > 0) updateData.status = 'in_progress';
    else updateData.status = 'not_started';

    await task.update(updateData);
    return formatResponse(res, { data: task, message: 'Progress tugas berhasil diperbarui' });
  } catch (error) {
    console.error('Update task progress error:', error);
    return formatResponse(res, { success: false, message: 'Gagal memperbarui progress', statusCode: 500 });
  }
}

// ── Budget: Summary ───────────────────────────────────
export async function budgetSummary(req, res) {
  try {
    const budgets = await EventBudget.findAll({
      where: { event_id: req.params.eventId },
    });

    const event = await Event.findByPk(req.params.eventId);
    const totalEstimated = budgets.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
    const totalActual = budgets.reduce((sum, b) => sum + parseFloat(b.actual_cost || 0), 0);

    const byCategory = budgets.reduce((acc, b) => {
      if (!acc[b.category]) acc[b.category] = { estimated: 0, actual: 0 };
      acc[b.category].estimated += parseFloat(b.total_price || 0);
      acc[b.category].actual += parseFloat(b.actual_cost || 0);
      return acc;
    }, {});

    return formatResponse(res, {
      data: {
        budget_max: event?.budget_max || 0,
        total_estimated: totalEstimated,
        total_actual: totalActual,
        remaining: parseFloat(event?.budget_max || 0) - totalActual,
        by_category: byCategory,
        items_count: budgets.length,
      },
    });
  } catch (error) {
    console.error('Budget summary error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengambil ringkasan budget', statusCode: 500 });
  }
}

// ── Documents: Export ─────────────────────────────────
export async function exportDocument(req, res) {
  try {
    const doc = await EventDocument.findOne({
      where: { id: req.params.id, event_id: req.params.eventId },
    });
    if (!doc) return formatResponse(res, { success: false, message: 'Dokumen tidak ditemukan', statusCode: 404 });

    return formatResponse(res, {
      data: {
        id: doc.id,
        doc_type: doc.doc_type,
        title: doc.title,
        content: doc.content,
        file_url: doc.file_url,
        version: doc.version,
        status: doc.status,
      },
    });
  } catch (error) {
    console.error('Export document error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengekspor dokumen', statusCode: 500 });
  }
}

// ── Approvals ─────────────────────────────────────────
export const approvals = {
  async list(req, res) {
    try {
      const items = await EventApproval.findAll({
        where: { event_id: req.params.eventId },
        include: [{ model: (await import('../models/index.js')).User, as: 'reviewer', attributes: { exclude: ['password_hash'] } }],
        order: [['createdAt', 'DESC']],
      });
      return formatResponse(res, { data: items });
    } catch (error) {
      console.error('List approvals error:', error);
      return formatResponse(res, { success: false, message: 'Gagal mengambil data approval', statusCode: 500 });
    }
  },

  async create(req, res) {
    try {
      const event = await Event.findByPk(req.params.eventId);
      if (!event) return formatResponse(res, { success: false, message: 'Event tidak ditemukan', statusCode: 404 });

      const approval = await EventApproval.create({
        ...req.body,
        event_id: req.params.eventId,
        reviewer_id: req.user.id,
      });
      return formatResponse(res, { data: approval, message: 'Approval berhasil dibuat', statusCode: 201 });
    } catch (error) {
      console.error('Create approval error:', error);
      return formatResponse(res, { success: false, message: 'Gagal membuat approval', statusCode: 500 });
    }
  },
};

// ── Evaluation ────────────────────────────────────────
export const evaluation = {
  async get(req, res) {
    try {
      const items = await EventEvaluation.findAll({
        where: { event_id: req.params.eventId },
      });
      return formatResponse(res, { data: items[0] || null });
    } catch (error) {
      console.error('Get evaluation error:', error);
      return formatResponse(res, { success: false, message: 'Gagal mengambil data evaluasi', statusCode: 500 });
    }
  },

  async create(req, res) {
    try {
      const event = await Event.findByPk(req.params.eventId);
      if (!event) return formatResponse(res, { success: false, message: 'Event tidak ditemukan', statusCode: 404 });

      // Upsert: update if exists, create if not
      const [evalRecord, created] = await EventEvaluation.findOrCreate({
        where: { event_id: req.params.eventId },
        defaults: { ...req.body, event_id: req.params.eventId },
      });

      if (!created) {
        await evalRecord.update(req.body);
      }

      // Update event status to evaluated
      await event.update({ status: 'evaluated' });

      return formatResponse(res, { data: evalRecord, message: 'Evaluasi berhasil disimpan' });
    } catch (error) {
      console.error('Create evaluation error:', error);
      return formatResponse(res, { success: false, message: 'Gagal menyimpan evaluasi', statusCode: 500 });
    }
  },
};

// ── Feedback ──────────────────────────────────────────
export const feedback = {
  async list(req, res) {
    try {
      const items = await EventFeedback.findAll({
        where: { event_id: req.params.eventId },
        order: [['createdAt', 'DESC']],
      });
      return formatResponse(res, { data: items });
    } catch (error) {
      console.error('List feedback error:', error);
      return formatResponse(res, { success: false, message: 'Gagal mengambil data feedback', statusCode: 500 });
    }
  },

  async create(req, res) {
    try {
      const event = await Event.findByPk(req.params.eventId);
      if (!event) return formatResponse(res, { success: false, message: 'Event tidak ditemukan', statusCode: 404 });

      const item = await EventFeedback.create({
        ...req.body,
        event_id: req.params.eventId,
      });
      return formatResponse(res, { data: item, message: 'Feedback berhasil disimpan', statusCode: 201 });
    } catch (error) {
      console.error('Create feedback error:', error);
      return formatResponse(res, { success: false, message: 'Gagal menyimpan feedback', statusCode: 500 });
    }
  },
};
