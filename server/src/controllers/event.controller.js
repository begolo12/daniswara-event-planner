import { Op } from 'sequelize';
import { Event, EventType, User, EventTheme, EventTimeline, EventRundown, EventChecklist, EventTask, EventBudget, EventVendor, EventDocument, EventApproval, EventEvaluation, EventFeedback, RiskBackupPlan } from '../models/index.js';
import { paginate, paginationMeta, formatResponse, statusTransitions } from '../utils/helpers.js';

const fullIncludes = [
  { model: EventType },
  { model: User, as: 'picMain' },
  { model: User, as: 'creator' },
  { model: User, as: 'approver' },
  { model: EventTheme, as: 'themes' },
  { model: EventTimeline, as: 'timelines', include: [{ model: User, as: 'pic' }], order: [['sort_order', 'ASC']] },
  { model: EventRundown, as: 'rundowns', include: [{ model: User, as: 'pic' }], order: [['sort_order', 'ASC']] },
  { model: EventChecklist, as: 'checklists', include: [{ model: User, as: 'pic' }], order: [['sort_order', 'ASC']] },
  { model: EventTask, as: 'tasks', include: [{ model: User, as: 'pic' }] },
  { model: EventBudget, as: 'budgets', order: [['sort_order', 'ASC']] },
  { model: EventVendor, as: 'vendors', order: [['sort_order', 'ASC']] },
  { model: EventDocument, as: 'documents', include: [{ model: User, as: 'creator' }, { model: User, as: 'approver' }] },
  { model: EventApproval, as: 'approvals', include: [{ model: User, as: 'reviewer' }] },
  { model: EventEvaluation, as: 'evaluations' },
  { model: EventFeedback, as: 'feedbacks' },
  { model: RiskBackupPlan, as: 'risks', include: [{ model: User, as: 'pic' }] },
];

export async function list(req, res) {
  try {
    const { page = 1, limit = 10, search = '', status = '', event_type_id = '', start_date = '', end_date = '' } = req.query;
    const { limit: lim, offset } = paginate(parseInt(page), parseInt(limit));

    const where = {};
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (status) where.status = status;
    if (event_type_id) where.event_type_id = event_type_id;
    if (start_date && end_date) {
      where.event_date = { [Op.between]: [start_date, end_date] };
    } else if (start_date) {
      where.event_date = { [Op.gte]: start_date };
    } else if (end_date) {
      where.event_date = { [Op.lte]: end_date };
    }

    console.log('[Events List] where:', JSON.stringify(where), 'limit:', lim, 'offset:', offset);

    const result = await Event.findAndCountAll({
      where,
      limit: lim,
      offset,
      include: [
        { model: EventType, attributes: ['id', 'name', 'slug', 'icon', 'color'] },
        { model: User, as: 'picMain', attributes: ['id', 'name', 'email', 'division', 'position'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
      order: [['event_date', 'DESC']],
      subQuery: false,
    });

    console.log('[Events List] count:', result.count, 'rows:', result.rows.length);

    return formatResponse(res, {
      data: result.rows,
      pagination: paginationMeta(result.count, page, lim),
    });
  } catch (error) {
    console.error('List events error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengambil data event', statusCode: 500 });
  }
}

export async function create(req, res) {
  try {
    const data = { ...req.body, created_by: req.user.id };
    const event = await Event.create(data);

    const full = await Event.findByPk(event.id, {
      include: [
        { model: EventType },
        { model: User, as: 'picMain', attributes: { exclude: ['password_hash'] } },
        { model: User, as: 'creator', attributes: { exclude: ['password_hash'] } },
      ],
    });

    return formatResponse(res, { data: full, message: 'Event berhasil dibuat', statusCode: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    return formatResponse(res, { success: false, message: 'Gagal membuat event', statusCode: 500 });
  }
}

export async function getDetail(req, res) {
  try {
    const event = await Event.findByPk(req.params.id, { include: fullIncludes });
    if (!event) {
      return formatResponse(res, { success: false, message: 'Event tidak ditemukan', statusCode: 404 });
    }
    return formatResponse(res, { data: event });
  } catch (error) {
    console.error('Get event error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengambil data event', statusCode: 500 });
  }
}

export async function update(req, res) {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return formatResponse(res, { success: false, message: 'Event tidak ditemukan', statusCode: 404 });
    }

    await event.update(req.body);
    const full = await Event.findByPk(event.id, { include: fullIncludes });

    return formatResponse(res, { data: full, message: 'Event berhasil diperbarui' });
  } catch (error) {
    console.error('Update event error:', error);
    return formatResponse(res, { success: false, message: 'Gagal memperbarui event', statusCode: 500 });
  }
}

export async function remove(req, res) {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return formatResponse(res, { success: false, message: 'Event tidak ditemukan', statusCode: 404 });
    }
    if (event.status !== 'draft') {
      return formatResponse(res, { success: false, message: 'Hanya event draft yang bisa dihapus', statusCode: 400 });
    }

    await event.destroy();
    return formatResponse(res, { message: 'Event berhasil dihapus' });
  } catch (error) {
    console.error('Delete event error:', error);
    return formatResponse(res, { success: false, message: 'Gagal menghapus event', statusCode: 500 });
  }
}

export async function changeStatus(req, res) {
  try {
    const { status: newStatus, notes } = req.body;
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return formatResponse(res, { success: false, message: 'Event tidak ditemukan', statusCode: 404 });
    }

    const allowed = statusTransitions(event.status);
    if (!allowed.includes(newStatus)) {
      return formatResponse(res, {
        success: false,
        message: `Transisi dari ${event.status} ke ${newStatus} tidak diperbolehkan`,
        statusCode: 400,
      });
    }

    const updateData = { status: newStatus };
    if (notes) updateData.notes = notes;

    await event.update(updateData);
    return formatResponse(res, { data: event, message: 'Status event berhasil diubah' });
  } catch (error) {
    console.error('Change status error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengubah status', statusCode: 500 });
  }
}

export async function submitForApproval(req, res) {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return formatResponse(res, { success: false, message: 'Event tidak ditemukan', statusCode: 404 });
    }
    if (!['draft', 'planning'].includes(event.status)) {
      return formatResponse(res, { success: false, message: 'Event harus dalam status draft atau planning', statusCode: 400 });
    }

    await event.update({ status: 'waiting_approval' });
    return formatResponse(res, { data: event, message: 'Event berhasil diajukan untuk persetujuan' });
  } catch (error) {
    console.error('Submit error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengajukan event', statusCode: 500 });
  }
}

export async function approve(req, res) {
  try {
    const { notes } = req.body;
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return formatResponse(res, { success: false, message: 'Event tidak ditemukan', statusCode: 404 });
    }
    if (event.status !== 'waiting_approval') {
      return formatResponse(res, { success: false, message: 'Event harus dalam status menunggu persetujuan', statusCode: 400 });
    }

    await event.update({
      status: 'preparation',
      approved_by: req.user.id,
      approved_at: new Date(),
      notes: notes || event.notes,
    });

    // Also log the approval
    await EventApproval.create({
      event_id: event.id,
      reviewer_id: req.user.id,
      status: 'approved',
      notes: notes || 'Disetujui oleh admin',
    });

    return formatResponse(res, { data: event, message: 'Event berhasil disetujui' });
  } catch (error) {
    console.error('Approve error:', error);
    return formatResponse(res, { success: false, message: 'Gagal menyetujui event', statusCode: 500 });
  }
}

export async function reject(req, res) {
  try {
    const { notes } = req.body;
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return formatResponse(res, { success: false, message: 'Event tidak ditemukan', statusCode: 404 });
    }

    await event.update({ status: 'cancelled', notes: notes || 'Ditolak' });

    await EventApproval.create({
      event_id: event.id,
      reviewer_id: req.user.id,
      status: 'rejected',
      notes: notes || 'Ditolak',
    });

    return formatResponse(res, { data: event, message: 'Event ditolak' });
  } catch (error) {
    console.error('Reject error:', error);
    return formatResponse(res, { success: false, message: 'Gagal menolak event', statusCode: 500 });
  }
}
