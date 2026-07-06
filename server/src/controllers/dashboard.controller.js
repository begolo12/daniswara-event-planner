import { Op, fn, col, literal } from 'sequelize';
import { Event, EventTask, EventTimeline, User, EventType } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';

export async function stats(req, res) {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = `${currentYear}-01-01`;
    const endOfYear = `${currentYear}-12-31`;

    const [totalEvents, running, completed, pendingApproval, overdueTasks] = await Promise.all([
      Event.count({ where: { event_date: { [Op.between]: [startOfYear, endOfYear] } } }),
      Event.count({ where: { status: { [Op.in]: ['planning', 'preparation', 'ready', 'on_going'] } } }),
      Event.count({ where: { status: { [Op.in]: ['done', 'evaluated'] } } }),
      Event.count({ where: { status: 'waiting_approval' } }),
      EventTask.count({ where: { deadline: { [Op.lt]: new Date() }, status: { [Op.ne]: 'done' } } }),
    ]);

    // Budget summary from all events
    const events = await Event.findAll({
      where: { budget_max: { [Op.not]: null } },
      attributes: ['budget_max'],
    });
    const totalBudget = events.reduce((sum, e) => sum + parseFloat(e.budget_max || 0), 0);

    // Task summary
    const totalTasks = await EventTask.count();
    const completedTasks = await EventTask.count({ where: { status: 'done' } });

    return formatResponse(res, {
      data: {
        total_events: totalEvents,
        running,
        completed,
        pending_approval: pendingApproval,
        overdue_tasks: overdueTasks,
        total_budget: totalBudget,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        task_completion_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengambil statistik', statusCode: 500 });
  }
}

export async function calendar(req, res) {
  try {
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endMonth = parseInt(month) + 1;
    const endDate = endMonth > 12 ? `${parseInt(year) + 1}-01-01` : `${year}-${String(endMonth).padStart(2, '0')}-01`;

    const events = await Event.findAll({
      where: {
        event_date: { [Op.gte]: startDate, [Op.lt]: endDate },
      },
      include: [{ model: EventType }],
      order: [['event_date', 'ASC']],
    });

    return formatResponse(res, { data: events });
  } catch (error) {
    console.error('Calendar error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengambil data kalender', statusCode: 500 });
  }
}

export async function upcoming(req, res) {
  try {
    const events = await Event.findAll({
      where: {
        event_date: { [Op.gte]: new Date().toISOString().split('T')[0] },
        status: { [Op.notIn]: ['cancelled', 'done', 'evaluated'] },
      },
      include: [
        { model: EventType },
        { model: User, as: 'picMain', attributes: { exclude: ['password_hash'] } },
      ],
      order: [['event_date', 'ASC']],
      limit: 5,
    });

    return formatResponse(res, { data: events });
  } catch (error) {
    console.error('Upcoming error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengambil event mendatang', statusCode: 500 });
  }
}

export async function overdue(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [overdueTasks, overdueTimelines] = await Promise.all([
      EventTask.findAll({
        where: { deadline: { [Op.lt]: today }, status: { [Op.ne]: 'done' } },
        include: [
          { model: User, as: 'pic', attributes: ['id', 'name', 'email'] },
          { model: Event, attributes: ['id', 'name', 'event_date'] },
        ],
        order: [['deadline', 'ASC']],
      }),
      EventTimeline.findAll({
        where: { deadline: { [Op.lt]: today }, status: { [Op.notIn]: ['done', 'cancelled'] } },
        include: [
          { model: User, as: 'pic', attributes: ['id', 'name', 'email'] },
          { model: Event, attributes: ['id', 'name', 'event_date'] },
        ],
        order: [['deadline', 'ASC']],
      }),
    ]);

    return formatResponse(res, {
      data: { tasks: overdueTasks, timelines: overdueTimelines },
    });
  } catch (error) {
    console.error('Overdue error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengambil data overdue', statusCode: 500 });
  }
}
