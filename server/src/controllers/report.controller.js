import { Op } from 'sequelize';
import { Event, EventType, User, EventBudget, EventTask, EventEvaluation, EventFeedback, EventTimeline, EventRundown } from '../models/index.js';
import { paginate, paginationMeta, formatResponse } from '../utils/helpers.js';
import AIService from '../services/ai.service.js';

const aiService = new AIService();

export async function listEvents(req, res) {
  try {
    const { page = 1, limit = 10, status = '', year = '' } = req.query;
    const { limit: lim, offset } = paginate(page, limit);

    const where = {};
    if (status) where.status = status;
    if (year) {
      where.event_date = {
        [Op.and]: [`${year}-01-01`, `${year}-12-31`],
      };
    }

    const { count, rows } = await Event.findAndCountAll({
      where,
      limit: lim,
      offset,
      include: [
        { model: EventType },
        { model: User, as: 'picMain', attributes: ['id', 'name'] },
      ],
      order: [['event_date', 'DESC']],
    });

    // Enrich with summary stats
    const enriched = await Promise.all(rows.map(async (event) => {
      const [budgetTotal, taskCount, doneTaskCount] = await Promise.all([
        EventBudget.sum('total_price', { where: { event_id: event.id } }),
        EventTask.count({ where: { event_id: event.id } }),
        EventTask.count({ where: { event_id: event.id, status: 'done' } }),
      ]);
      return {
        ...event.toJSON(),
        budget_total: budgetTotal || 0,
        task_count: taskCount,
        tasks_done: doneTaskCount,
      };
    }));

    return formatResponse(res, {
      data: enriched,
      pagination: paginationMeta(count, page, lim),
    });
  } catch (error) {
    console.error('Report list events error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengambil laporan', statusCode: 500 });
  }
}

export async function getEventReport(req, res) {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: EventType },
        { model: User, as: 'picMain', attributes: { exclude: ['password_hash'] } },
        { model: User, as: 'creator', attributes: { exclude: ['password_hash'] } },
        { model: EventBudget, as: 'budgets' },
        { model: EventTask, as: 'tasks', include: [{ model: User, as: 'pic', attributes: ['id', 'name'] }] },
        { model: EventEvaluation, as: 'evaluations' },
        { model: EventFeedback, as: 'feedbacks' },
        { model: EventTimeline, as: 'timelines' },
        { model: EventRundown, as: 'rundowns' },
      ],
    });

    if (!event) {
      return formatResponse(res, { success: false, message: 'Event tidak ditemukan', statusCode: 404 });
    }

    // Compute summary
    const budgetTotal = event.budgets?.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0) || 0;
    const budgetActual = event.budgets?.reduce((sum, b) => sum + parseFloat(b.actual_cost || 0), 0) || 0;
    const taskTotal = event.tasks?.length || 0;
    const tasksDone = event.tasks?.filter((t) => t.status === 'done').length || 0;

    return formatResponse(res, {
      data: {
        event: event.toJSON(),
        summary: {
          budget_total: budgetTotal,
          budget_actual: budgetActual,
          task_total: taskTotal,
          tasks_done: tasksDone,
          task_completion_rate: taskTotal > 0 ? Math.round((tasksDone / taskTotal) * 100) : 0,
          avg_rating: event.feedbacks?.length
            ? (event.feedbacks.reduce((sum, f) => sum + f.rating, 0) / event.feedbacks.length).toFixed(1)
            : null,
        },
      },
    });
  } catch (error) {
    console.error('Report event detail error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengambil laporan event', statusCode: 500 });
  }
}

export async function generateReport(req, res) {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: EventType },
        { model: EventBudget, as: 'budgets' },
        { model: EventTask, as: 'tasks' },
        { model: EventEvaluation, as: 'evaluations' },
        { model: EventFeedback, as: 'feedbacks' },
      ],
    });

    if (!event) {
      return formatResponse(res, { success: false, message: 'Event tidak ditemukan', statusCode: 404 });
    }

    const context = {
      eventData: {
        name: event.name,
        event_date: event.event_date,
        location: event.location,
        estimated_participants: event.estimated_participants,
        budget_max: event.budget_max,
      },
      additionalInfo: JSON.stringify({
        status: event.status,
        budgets: event.budgets?.map((b) => ({ category: b.category, item: b.item, total_price: b.total_price })),
        tasks: event.tasks?.map((t) => ({ task_name: t.task_name, status: t.status, progress: t.progress })),
        evaluation: event.evaluations?.[0],
        feedbacks_count: event.feedbacks?.length,
        avg_rating: event.feedbacks?.length
          ? (event.feedbacks.reduce((s, f) => s + f.rating, 0) / event.feedbacks.length).toFixed(1)
          : null,
      }),
    };

    const result = await aiService.generatePartial('report', context, req.user.id, event.id);
    return formatResponse(res, { data: result.data, message: 'Laporan berhasil digenerate' });
  } catch (error) {
    console.error('Generate report error:', error);
    return formatResponse(res, { success: false, message: `Gagal generate laporan: ${error.message}`, statusCode: 500 });
  }
}

export async function budgetReport(req, res) {
  try {
    const budgets = await EventBudget.findAll({
      include: [{ model: Event, attributes: ['id', 'name', 'event_date', 'budget_max', 'status'] }],
    });

    const groupedByEvent = budgets.reduce((acc, b) => {
      const eName = b.Event?.name || 'Unknown';
      if (!acc[eName]) acc[eName] = { event: b.Event, items: [], total_estimated: 0, total_actual: 0 };
      acc[eName].items.push(b);
      acc[eName].total_estimated += parseFloat(b.total_price || 0);
      acc[eName].total_actual += parseFloat(b.actual_cost || 0);
      return acc;
    }, {});

    return formatResponse(res, { data: groupedByEvent });
  } catch (error) {
    console.error('Budget report error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengambil laporan budget', statusCode: 500 });
  }
}
