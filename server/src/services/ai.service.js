import OpenAI from 'openai';
import { AISetting, AIGenerationLog } from '../models/index.js';
import { decrypt } from '../utils/crypto.js';
import { buildSystemPrompt, buildEventGenerationPrompt, buildPartialPrompt } from '../utils/prompts.js';

export default class AIService {
  constructor() {
    this.settings = null;
    this.client = null;
  }

  async _loadSettings() {
    if (this.settings) return this.settings;
    this.settings = await AISetting.findOne({ where: { is_active: true } });
    return this.settings;
  }

  async _getClient() {
    if (this.client) return this.client;
    const settings = await this._loadSettings();
    if (!settings) throw new Error('Pengaturan AI tidak ditemukan');

    const apiKey = settings.api_key_encrypted ? decrypt(settings.api_key_encrypted) : '';
    this.client = new OpenAI({
      apiKey: apiKey || 'sk-placeholder',
      baseURL: settings.base_url || 'https://api.openai.com/v1',
    });
    return this.client;
  }

  _decryptKey(encrypted) {
    return decrypt(encrypted);
  }

  async _callAI(systemPrompt, userPrompt) {
    const settings = await this._loadSettings();
    if (!settings) throw new Error('Pengaturan AI tidak ditemukan');

    const client = await this._getClient();
    const startTime = Date.now();

    try {
      const response = await client.chat.completions.create({
        model: settings.model || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: parseFloat(settings.temperature) || 0.7,
        max_tokens: settings.max_tokens || 8000,
      });

      const duration = Date.now() - startTime;
      return {
        content: response.choices[0].message.content,
        model_used: response.model,
        token_input: response.usage?.prompt_tokens || 0,
        token_output: response.usage?.completion_tokens || 0,
        duration_ms: duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      throw Object.assign(error, { duration_ms: duration });
    }
  }

  _parseJSON(response) {
    // Try to extract JSON from the response (handles markdown code blocks)
    let text = response.trim();
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) text = jsonMatch[1].trim();
    else {
      const braceMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (braceMatch) text = braceMatch[1];
    }
    return JSON.parse(text);
  }

  async _logGeneration(data) {
    try {
      await AIGenerationLog.create(data);
    } catch (err) {
      console.error('Failed to log AI generation:', err.message);
    }
  }

  async generate(eventData, outputs, userId, eventId = null) {
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildEventGenerationPrompt(eventData, outputs);

    const result = await this._callAI(systemPrompt, userPrompt);
    const parsed = this._parseJSON(result.content);

    await this._logGeneration({
      user_id: userId,
      event_id: eventId,
      generation_type: 'full_event',
      prompt: userPrompt,
      response: result.content,
      model_used: result.model_used,
      token_input: result.token_input,
      token_output: result.token_output,
      status: 'success',
      duration_ms: result.duration_ms,
    });

    return { data: parsed, meta: { model_used: result.model_used, duration_ms: result.duration_ms } };
  }

  async generatePartial(type, context, userId, eventId = null) {
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildPartialPrompt(type, context);

    const result = await this._callAI(systemPrompt, userPrompt);
    const parsed = this._parseJSON(result.content);

    await this._logGeneration({
      user_id: userId,
      event_id: eventId,
      generation_type: type,
      prompt: userPrompt,
      response: result.content,
      model_used: result.model_used,
      token_input: result.token_input,
      token_output: result.token_output,
      status: 'success',
      duration_ms: result.duration_ms,
    });

    return { data: parsed, meta: { model_used: result.model_used, duration_ms: result.duration_ms } };
  }

  async testConnection() {
    const systemPrompt = 'Kamu adalah AI assistant. Jawab dengan singkat.';
    const userPrompt = 'Test koneksi. Jawab: "Koneksi berhasil! Saya adalah AI Event Planner Daniswara."';

    const result = await this._callAI(systemPrompt, userPrompt);

    // Update test status
    const settings = await this._loadSettings();
    if (settings) {
      await settings.update({ last_test_at: new Date(), last_test_status: 'success' });
    }

    return { success: true, message: result.content, model_used: result.model_used };
  }
}
