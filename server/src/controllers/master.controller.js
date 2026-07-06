import { Op } from 'sequelize';
import { EventType, MasterVendor, MasterVenue, MasterEquipment } from '../models/index.js';
import { paginate, paginationMeta, formatResponse } from '../utils/helpers.js';

// ── Generic Master CRUD Factory ───────────────────────
function createMasterController(Model, name) {
  return {
    async list(req, res) {
      try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const { limit: lim, offset } = paginate(page, limit);

        const where = {};
        if (search) {
          where[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
          ];
          // Add category search if model has it
          if (Model.rawAttributes.category) {
            where[Op.or].push({ category: { [Op.like]: `%${search}%` } });
          }
        }

        const { count, rows } = await Model.findAndCountAll({
          where,
          limit: lim,
          offset,
          order: [['name', 'ASC']],
        });

        return formatResponse(res, {
          data: rows,
          pagination: paginationMeta(count, page, lim),
        });
      } catch (error) {
        console.error(`List ${name} error:`, error);
        return formatResponse(res, { success: false, message: `Gagal mengambil data ${name}`, statusCode: 500 });
      }
    },

    async create(req, res) {
      try {
        const item = await Model.create(req.body);
        return formatResponse(res, { data: item, message: `${name} berhasil dibuat`, statusCode: 201 });
      } catch (error) {
        console.error(`Create ${name} error:`, error);
        return formatResponse(res, { success: false, message: `Gagal membuat ${name}`, statusCode: 500 });
      }
    },

    async getDetail(req, res) {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return formatResponse(res, { success: false, message: `${name} tidak ditemukan`, statusCode: 404 });
        return formatResponse(res, { data: item });
      } catch (error) {
        console.error(`Get ${name} error:`, error);
        return formatResponse(res, { success: false, message: `Gagal mengambil data ${name}`, statusCode: 500 });
      }
    },

    async update(req, res) {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return formatResponse(res, { success: false, message: `${name} tidak ditemukan`, statusCode: 404 });

        await item.update(req.body);
        return formatResponse(res, { data: item, message: `${name} berhasil diperbarui` });
      } catch (error) {
        console.error(`Update ${name} error:`, error);
        return formatResponse(res, { success: false, message: `Gagal memperbarui ${name}`, statusCode: 500 });
      }
    },

    async remove(req, res) {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return formatResponse(res, { success: false, message: `${name} tidak ditemukan`, statusCode: 404 });

        await item.destroy();
        return formatResponse(res, { message: `${name} berhasil dihapus` });
      } catch (error) {
        console.error(`Delete ${name} error:`, error);
        return formatResponse(res, { success: false, message: `Gagal menghapus ${name}`, statusCode: 500 });
      }
    },
  };
}

export const eventTypes = createMasterController(EventType, 'Tipe Event');
export const vendors = createMasterController(MasterVendor, 'Vendor');
export const venues = createMasterController(MasterVenue, 'Venue');
export const equipments = createMasterController(MasterEquipment, 'Peralatan');
