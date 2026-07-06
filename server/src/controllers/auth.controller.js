import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';

function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
  return { accessToken, refreshToken };
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return formatResponse(res, { success: false, message: 'Email atau password salah', statusCode: 401 });
    }
    if (!user.is_active) {
      return formatResponse(res, { success: false, message: 'Akun tidak aktif', statusCode: 403 });
    }

    const valid = await user.validatePassword(password);
    if (!valid) {
      return formatResponse(res, { success: false, message: 'Email atau password salah', statusCode: 401 });
    }

    await user.update({ last_login_at: new Date() });
    const tokens = generateTokens(user);

    return formatResponse(res, {
      data: { user: user.toJSON(), ...tokens },
      message: 'Login berhasil',
    });
  } catch (error) {
    console.error('Login error:', error);
    return formatResponse(res, { success: false, message: 'Terjadi kesalahan server', statusCode: 500 });
  }
}

export async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return formatResponse(res, { success: false, message: 'Refresh token harus diisi', statusCode: 400 });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return formatResponse(res, { success: false, message: 'User tidak valid', statusCode: 401 });
    }

    const tokens = generateTokens(user);
    return formatResponse(res, { data: tokens, message: 'Token berhasil diperbarui' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return formatResponse(res, { success: false, message: 'Refresh token tidak valid', statusCode: 401 });
    }
    console.error('Refresh error:', error);
    return formatResponse(res, { success: false, message: 'Terjadi kesalahan server', statusCode: 500 });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return formatResponse(res, { success: false, message: 'User tidak ditemukan', statusCode: 404 });
    }
    return formatResponse(res, { data: user.toJSON() });
  } catch (error) {
    console.error('Me error:', error);
    return formatResponse(res, { success: false, message: 'Terjadi kesalahan server', statusCode: 500 });
  }
}

export async function changePassword(req, res) {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findByPk(req.user.id);

    const valid = await user.validatePassword(current_password);
    if (!valid) {
      return formatResponse(res, { success: false, message: 'Password lama salah', statusCode: 400 });
    }

    await user.update({ password_hash: new_password });
    return formatResponse(res, { message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Change password error:', error);
    return formatResponse(res, { success: false, message: 'Terjadi kesalahan server', statusCode: 500 });
  }
}
