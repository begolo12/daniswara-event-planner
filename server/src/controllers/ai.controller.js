import AIService from '../services/ai.service.js';
import { AIGenerationLog } from '../models/index.js';
import { paginate, paginationMeta, formatResponse } from '../utils/helpers.js';

const aiService = new AIService();

export async function generateEvent(req, res) {
  try {
    // Accept both { eventData: {...} } and flat fields
    let eventData = req.body.eventData;
    const outputs = req.body.outputs || ['theme', 'timeline', 'rundown', 'checklist', 'budget', 'risks'];

    if (!eventData) {
      // Build eventData from flat fields
      const { event_name, event_type, event_date, start_time, end_time, location,
              event_format, participant_count, target_participants, event_goal,
              tone, budget, division, pic_main, notes } = req.body;

      if (!event_name && !req.body.name) {
        return formatResponse(res, { success: false, message: 'Data event harus diisi', statusCode: 400 });
      }

      eventData = {
        event_name: event_name || req.body.name,
        event_type: event_type || req.body.type || '',
        event_date: event_date || req.body.date || '',
        start_time: start_time || req.body.startTime || '',
        end_time: end_time || req.body.endTime || '',
        location: location || '',
        event_format: event_format || req.body.format || 'offline',
        participant_count: participant_count || req.body.participants || 0,
        event_goal: event_goal || req.body.goal || '',
        tone: tone || 'formal',
        budget: budget || req.body.budget_max || 0,
        division: division || '',
        pic_main: pic_main || '',
        notes: notes || '',
      };
    }

    console.log('[AI Generate] eventData:', JSON.stringify(eventData).substring(0, 200));
    console.log('[AI Generate] outputs:', outputs);

    const result = await aiService.generate(eventData, outputs, req.user.id);
    return formatResponse(res, { data: result.data, message: 'Generasi AI berhasil' });
  } catch (error) {
    console.error('AI generate event error:', error);
    return formatResponse(res, { success: false, message: `Gagal generate: ${error.message}`, statusCode: 500 });
  }
}

export async function generate(req, res) {
  try {
    const { type, context, event_id } = req.body;
    if (!type || !context) {
      return formatResponse(res, { success: false, message: 'Tipe dan context harus diisi', statusCode: 400 });
    }

    const result = await aiService.generatePartial(type, context, req.user.id, event_id);
    return formatResponse(res, { data: result.data, message: `Generasi ${type} berhasil` });
  } catch (error) {
    console.error('AI generate partial error:', error);
    return formatResponse(res, { success: false, message: `Gagal generate: ${error.message}`, statusCode: 500 });
  }
}

export async function getLogs(req, res) {
  try {
    const { page = 1, limit = 20, event_id = '', user_id = '' } = req.query;
    const { limit: lim, offset } = paginate(page, limit);

    const where = {};
    if (event_id) where.event_id = event_id;
    if (user_id) where.user_id = user_id;

    const { count, rows } = await AIGenerationLog.findAndCountAll({
      where,
      limit: lim,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return formatResponse(res, {
      data: rows,
      pagination: paginationMeta(count, page, lim),
    });
  } catch (error) {
    console.error('Get AI logs error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengambil log AI', statusCode: 500 });
  }
}

export async function testConnection(req, res) {
  try {
    const result = await aiService.testConnection();
    return formatResponse(res, { data: result, message: 'Koneksi AI berhasil' });
  } catch (error) {
    console.error('AI test connection error:', error);
    return formatResponse(res, { success: false, message: `Koneksi gagal: ${error.message}`, statusCode: 500 });
  }
}
