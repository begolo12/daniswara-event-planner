import { Router } from 'express';
import { AISetting } from '../models/index.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import { formatResponse } from '../utils/helpers.js';
import auth from '../middleware/auth.js';
import rbac from '../middleware/rbac.js';

const router = Router();
router.use(auth);
router.use(rbac('super_admin'));

// GET - list all AI settings
router.get('/', async (req, res) => {
  try {
    const settings = await AISetting.findAll();
    // Mask API keys
    const masked = settings.map((s) => {
      const json = s.toJSON();
      if (json.api_key_encrypted) {
        json.api_key_masked = '****' + (decrypt(json.api_key_encrypted) || '').slice(-4);
        delete json.api_key_encrypted;
      }
      return json;
    });
    return formatResponse(res, { data: masked });
  } catch (error) {
    console.error('Get AI settings error:', error);
    return formatResponse(res, { success: false, message: 'Gagal mengambil pengaturan AI', statusCode: 500 });
  }
});

// POST - create AI settings
router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.api_key) {
      data.api_key_encrypted = encrypt(data.api_key);
      delete data.api_key;
    }
    const setting = await AISetting.create(data);
    const json = setting.toJSON();
    delete json.api_key_encrypted;
    return formatResponse(res, { data: json, message: 'Pengaturan AI berhasil dibuat' });
  } catch (error) {
    console.error('Create AI settings error:', error);
    return formatResponse(res, { success: false, message: 'Gagal membuat pengaturan AI', statusCode: 500 });
  }
});

// PUT - update AI settings by ID
router.put('/:id', async (req, res) => {
  try {
    const setting = await AISetting.findByPk(req.params.id);
    if (!setting) return formatResponse(res, { success: false, message: 'Pengaturan tidak ditemukan', statusCode: 404 });

    const updateData = { ...req.body };
    // Only encrypt and update api_key if a new one is provided
    if (updateData.api_key && updateData.api_key.trim() !== '') {
      updateData.api_key_encrypted = encrypt(updateData.api_key);
    }
    delete updateData.api_key;
    // Don't clear api_key_encrypted if no new key provided
    delete updateData.api_key_encrypted_field;

    await setting.update(updateData);
    const json = setting.toJSON();
    delete json.api_key_encrypted;
    return formatResponse(res, { data: json, message: 'Pengaturan AI berhasil diperbarui' });
  } catch (error) {
    console.error('Update AI settings error:', error);
    return formatResponse(res, { success: false, message: 'Gagal memperbarui pengaturan AI', statusCode: 500 });
  }
});

// POST - test AI connection (uses active settings)
router.post('/test', async (req, res) => {
  try {
    const setting = await AISetting.findOne({ where: { is_active: true } }) || await AISetting.findByPk(1);
    if (!setting) return formatResponse(res, { success: false, message: 'Pengaturan tidak ditemukan', statusCode: 404 });

    const apiKey = setting.api_key_encrypted ? decrypt(setting.api_key_encrypted) : '';
    if (!apiKey) {
      return formatResponse(res, { success: false, message: 'API Key belum dikonfigurasi', statusCode: 400 });
    }

    // Actually test the connection with a simple request
    try {
      const OpenAI = (await import('openai')).default;
      const client = new OpenAI({
        apiKey: apiKey,
        baseURL: setting.base_url || 'https://api.openai.com/v1',
      });

      const completion = await client.chat.completions.create({
        model: setting.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Say hello in one word' }],
        max_tokens: 10,
      });

      await setting.update({ last_test_at: new Date(), last_test_status: 'success' });
      return formatResponse(res, {
        data: { response: completion.choices[0]?.message?.content },
        message: `Koneksi berhasil! Model merespon: "${completion.choices[0]?.message?.content}"`,
      });
    } catch (aiError) {
      await setting.update({ last_test_at: new Date(), last_test_status: 'failed' });
      return formatResponse(res, {
        success: false,
        message: `Koneksi gagal: ${aiError.message}`,
        statusCode: 500,
      });
    }
  } catch (error) {
    console.error('Test AI error:', error);
    return formatResponse(res, { success: false, message: 'Gagal test koneksi', statusCode: 500 });
  }
});

export default router;
