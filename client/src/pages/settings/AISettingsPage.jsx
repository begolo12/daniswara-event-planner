import { useState, useEffect } from 'react';
import { Eye, EyeOff, Zap, Save, TestTube, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import FormInput from '../../components/ui/FormInput';
import FormSelect from '../../components/ui/FormSelect';
import FormTextarea from '../../components/ui/FormTextarea';
import api from '../../services/api';

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'ollama', label: 'Ollama (Local)' },
  { value: 'custom', label: 'Custom (DeepSeek, Groq, dll)' },
];

const MODEL_PLACEHOLDERS = {
  openai: 'gpt-4o, gpt-4o-mini',
  anthropic: 'claude-sonnet-4-20250514',
  ollama: 'llama3, mistral',
  custom: 'deepseek-chat, groq-llama, etc.',
};

const BASE_URL_PLACEHOLDERS = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com',
  ollama: 'http://localhost:11434/v1',
  custom: 'https://api.deepseek.com',
};

export default function AISettingsPage() {
  const [config, setConfig] = useState({
    provider_name: 'custom',
    base_url: '',
    api_key: '',
    model: '',
    default_system_prompt: '',
    temperature: 0.7,
    max_tokens: 2048,
  });
  const [settingId, setSettingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState('idle');
  const [testMessage, setTestMessage] = useState('');

  // Load settings from backend
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.get('/ai-settings');
      const data = res.data.data;
      if (Array.isArray(data) && data.length > 0) {
        const s = data[0];
        setSettingId(s.id);
        setConfig({
          provider_name: s.provider_name || 'custom',
          base_url: s.base_url || '',
          api_key: '', // Don't load encrypted key into form
          model: s.model || '',
          default_system_prompt: s.default_system_prompt || '',
          temperature: s.temperature ?? 0.7,
          max_tokens: s.max_tokens || 2048,
        });
      }
    } catch (err) {
      console.error('Failed to load AI settings:', err);
      toast.error('Gagal memuat pengaturan AI');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setConfig((c) => ({ ...c, [field]: value }));
  };

  const handleTest = async () => {
    setTestStatus('testing');
    setTestMessage('');
    try {
      // Save first, then test from DB
      if (settingId && config.api_key) {
        await api.put(`/ai-settings/${settingId}`, config);
      }
      const res = await api.post('/ai-settings/test');
      setTestStatus('success');
      setTestMessage(res.data?.message || 'Koneksi berhasil!');
    } catch (err) {
      setTestStatus('error');
      setTestMessage(err.response?.data?.message || 'Koneksi gagal');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (settingId) {
        await api.put(`/ai-settings/${settingId}`, config);
      } else {
        const res = await api.post('/ai-settings', config);
        setSettingId(res.data?.data?.id);
      }
      toast.success('Pengaturan AI berhasil disimpan');
      // Clear API key from form after save for security
      setConfig((c) => ({ ...c, api_key: '' }));
      loadSettings();
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Pengaturan AI</h1>
        <p className="text-sm text-dark-500 mt-1">Konfigurasi koneksi provider AI (OpenAI, DeepSeek, Groq, dll)</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        {/* Provider */}
        <FormSelect
          label="Provider"
          name="provider_name"
          value={config.provider_name}
          onChange={(e) => updateField('provider_name', e.target.value)}
          options={PROVIDERS}
        />

        {/* Base URL */}
        <FormInput
          label="Base URL"
          name="base_url"
          value={config.base_url}
          onChange={(e) => updateField('base_url', e.target.value)}
          placeholder={BASE_URL_PLACEHOLDERS[config.provider_name] || 'https://api.example.com/v1'}
        />

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1.5">
            API Key {settingId && !config.api_key && <span className="text-xs text-green-600">(sudah tersimpan)</span>}
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={config.api_key}
              onChange={(e) => updateField('api_key', e.target.value)}
              placeholder={settingId ? 'Kosongkan jika tidak ingin mengubah' : 'sk-...'}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-400 hover:text-dark-600"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Model */}
        <FormInput
          label="Model"
          name="model"
          value={config.model}
          onChange={(e) => updateField('model', e.target.value)}
          placeholder={MODEL_PLACEHOLDERS[config.provider_name] || 'model name'}
        />

        {/* System Prompt */}
        <FormTextarea
          label="System Prompt"
          name="default_system_prompt"
          value={config.default_system_prompt}
          onChange={(e) => updateField('default_system_prompt', e.target.value)}
          placeholder="Kamu adalah AI Event Planner profesional untuk perusahaan..."
          rows={6}
        />

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1.5">
            Temperature: <span className="text-brand-600 font-semibold">{config.temperature}</span>
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={config.temperature}
            onChange={(e) => updateField('temperature', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-brand-600"
          />
          <div className="flex justify-between text-xs text-dark-400 mt-1">
            <span>0 (Presisi)</span>
            <span>1 (Seimbang)</span>
            <span>2 (Kreatif)</span>
          </div>
        </div>

        {/* Max Tokens */}
        <FormInput
          label="Max Tokens"
          name="max_tokens"
          type="number"
          value={config.max_tokens}
          onChange={(e) => updateField('max_tokens', parseInt(e.target.value) || 2048)}
          placeholder="2048"
        />

        {/* Test Result */}
        {testStatus !== 'idle' && (
          <div className={`p-4 rounded-lg border ${
            testStatus === 'testing' ? 'bg-blue-50 border-blue-200'
            : testStatus === 'success' ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {testStatus === 'testing' && <Loader2 size={16} className="text-blue-600 animate-spin" />}
              {testStatus === 'success' && <CheckCircle size={16} className="text-green-600" />}
              {testStatus === 'error' && <XCircle size={16} className="text-red-600" />}
              <span className={`text-sm font-medium ${
                testStatus === 'testing' ? 'text-blue-700'
                : testStatus === 'success' ? 'text-green-700'
                : 'text-red-700'
              }`}>
                {testStatus === 'testing' ? 'Menguji koneksi...' : testMessage}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            icon={<Zap size={16} />}
            onClick={handleTest}
            loading={testStatus === 'testing'}
            disabled={!config.api_key && !settingId}
          >
            Tes Koneksi
          </Button>
          <Button icon={<Save size={16} />} onClick={handleSave} loading={saving}>
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}
