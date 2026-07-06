import { Op } from 'sequelize';
import { User } from '../models/index.js';
import { paginate, paginationMeta, formatResponse } from '../utils/helpers.js';

export async function list(req, res) {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const { limit: lim, offset } = paginate(page, limit);

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { division: { [Op.like]: `%${search}%` } },
      ];
    }
    if (role) where.role = role;

    const { count, rows } = await User.findAndCountAll({
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
    console.error('List users error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengambil data user', statusCode: 500 });
  }
}

export async function create(req, res) {
  try {
    const { name, email, password, role, division, position, phone } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) {
      return formatResponse(res, { success: false, message: 'Email sudah terdaftar', statusCode: 409 });
    }

    const user = await User.create({ name, email, password_hash: password, role, division, position, phone });
    return formatResponse(res, { data: user.toJSON(), message: 'User berhasil dibuat', statusCode: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return formatResponse(res, { success: false, message: 'Email sudah terdaftar', statusCode: 409 });
    }
    return formatResponse(res, { success: false, message: 'Gagal membuat user', statusCode: 500 });
  }
}

export async function getDetail(req, res) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return formatResponse(res, { success: false, message: 'User tidak ditemukan', statusCode: 404 });
    }
    return formatResponse(res, { data: user.toJSON() });
  } catch (error) {
    console.error('Get user error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengambil data user', statusCode: 500 });
  }
}

export async function update(req, res) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return formatResponse(res, { success: false, message: 'User tidak ditemukan', statusCode: 404 });
    }

    const { name, email, role, division, position, phone, avatar_url, password } = req.body;

    // Check email uniqueness if changed
    if (email && email !== user.email) {
      const existing = await User.findByEmail(email);
      if (existing) {
        return formatResponse(res, { success: false, message: 'Email sudah digunakan', statusCode: 409 });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (division !== undefined) updateData.division = division;
    if (position !== undefined) updateData.position = position;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (password) updateData.password_hash = password;

    await user.update(updateData);
    return formatResponse(res, { data: user.toJSON(), message: 'User berhasil diperbarui' });
  } catch (error) {
    console.error('Update user error:', error);
    return formatResponse(res, { success: false, message: 'Gagal memperbarui user', statusCode: 500 });
  }
}

export async function remove(req, res) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return formatResponse(res, { success: false, message: 'User tidak ditemukan', statusCode: 404 });
    }

    await user.destroy(); // soft delete (paranoid)
    return formatResponse(res, { message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Delete user error:', error);
    return formatResponse(res, { success: false, message: 'Gagal menghapus user', statusCode: 500 });
  }
}

export async function toggleActive(req, res) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return formatResponse(res, { success: false, message: 'User tidak ditemukan', statusCode: 404 });
    }

    await user.update({ is_active: !user.is_active });
    return formatResponse(res, {
      data: user.toJSON(),
      message: `User berhasil ${user.is_active ? 'diaktifkan' : 'dinonaktifkan'}`,
    });
  } catch (error) {
    console.error('Toggle user error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengubah status user', statusCode: 500 });
  }
}
