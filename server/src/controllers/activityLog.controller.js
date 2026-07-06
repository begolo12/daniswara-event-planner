import { Op } from 'sequelize';
import { ActivityLog, User } from '../models/index.js';
import { paginate, paginationMeta, formatResponse } from '../utils/helpers.js';

export async function list(req, res) {
  try {
    const { page = 1, limit = 20, user_id = '', action = '', start_date = '', end_date = '' } = req.query;
    const { limit: lim, offset } = paginate(page, limit);

    const where = {};
    if (user_id) where.user_id = user_id;
    if (action) where.action = { [Op.like]: `%${action}%` };
    if (start_date && end_date) {
      where.createdAt = { [Op.between]: [start_date, end_date] };
    } else if (start_date) {
      where.createdAt = { [Op.gte]: start_date };
    } else if (end_date) {
      where.createdAt = { [Op.lte]: end_date };
    }

    const { count, rows } = await ActivityLog.findAndCountAll({
      where,
      limit: lim,
      offset,
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });

    return formatResponse(res, {
      data: rows,
      pagination: paginationMeta(count, page, lim),
    });
  } catch (error) {
    console.error('List activity logs error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengambil data activity log', statusCode: 500 });
  }
}
