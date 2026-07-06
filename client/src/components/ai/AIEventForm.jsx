import React, { useState } from 'react';
import { Sparkles, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';

const eventTypes = [
  { value: 'seminar', label: 'Seminar' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'conference', label: 'Konferensi' },
  { value: 'exhibition', label: 'Pameran' },
  { value: 'concert', label: 'Konser' },
  { value: 'gala', label: 'Gala Dinner' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'social', label: 'Sosial' },
];

const formatOptions = [
  { value: 'offline', label: 'Offline' },
  { value: 'online', label: 'Online' },
  { value: 'hybrid', label: 'Hybrid' },
];

const toneOptions = [
  { value: 'formal', label: 'Formal' },
  { value: 'semi_formal', label: 'Semi Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'festive', label: 'Festive' },
];

/**
 * Output options for the comprehensive AI proposal.
 * Each option maps to a section in the AI response.
 */
const outputOptions = [
  { key: 'event_identity', label: 'Identitas Event', category: 'core' },
  { key: 'idea_options', label: 'Ide Konsep (35 Pilihan)', category: 'core' },
  { key: 'recommended_concept', label: 'Konsep Rekomendasi', category: 'core' },
  { key: 'background', label: 'Latar Belakang', category: 'content' },
  { key: 'objectives', label: 'Tujuan & Objektif', category: 'content' },
  { key: 'concept', label: 'Konsep Detail', category: 'content' },
  { key: 'theme_philosophy', label: 'Tema & Filosofi', category: 'design' },
  { key: 'participant_targets', label: 'Target Peserta', category: 'content' },
  { key: 'benefits', label: 'Manfaat Event', category: 'content' },
  { key: 'key_messages', label: 'Pesan Kunci', category: 'content' },
  { key: 'committee', label: 'Susunan Panitia', category: 'planning' },
  { key: 'timeline', label: 'Timeline Persiapan', category: 'planning' },
  { key: 'rundown', label: 'Rundown Acara', category: 'planning' },
  { key: 'equipment_needs', label: 'Kebutuhan Peralatan', category: 'planning' },
  { key: 'budget', label: 'Rincian Anggaran', category: 'planning' },
  { key: 'budget_summary', label: 'Ringkasan Budget', category: 'planning' },
  { key: 'materials_content', label: 'Materi & Konten', category: 'content' },
  { key: 'post_event_outputs', label: 'Output Pasca Event', category: 'planning' },
  { key: 'risks', label: 'Risiko & Mitigasi', category: 'planning' },
  { key: 'checklists', label: 'Checklist Persiapan', category: 'planning' },
  { key: 'final_recommendation', label: 'Rekomendasi Akhir', category: 'core' },
];

const outputCategories = [
  { key: 'core', label: 'Inti Proposal' },
  { key: 'content', label: 'Konten & Materi' },
  { key: 'design', label: 'Desain & Tema' },
  { key: 'planning', label: 'Perencanaan & Eksekusi' },
];

const initialForm = {
  name: '',
  eventType: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  location: '',
  venue: '',
  format: 'offline',
  targetParticipants: '',
  targetAudience: '',
  goal: '',
  tone: 'formal',
  budget: '',
  division: '',
  picMain: '',
  notes: '',
};

function FormInput({ label, required, error, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-dark-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className={`w-full border ${error ? 'border-red-400' : 'border-gray-200'} rounded-lg px-3 py-2 text-sm text-dark-800 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function FormSelect({ label, required, options, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-dark-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-dark-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        {...props}
      >
        <option value="">Pilih...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function FormTextarea({ label, required, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-dark-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-dark-800 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
        rows={3}
        {...props}
      />
    </div>
  );
}

export default function AIEventForm({ onSubmit, loading = false, initialValues }) {
  const [form, setForm] = useState({ ...initialForm, ...initialValues });
  const [outputs, setOutputs] = useState(() => {
    const initial = {};
    outputOptions.forEach((opt) => { initial[opt.key] = true; });
    return initial;
  });
  const [errors, setErrors] = useState({});
  const [expandedCategories, setExpandedCategories] = useState(
    outputCategories.reduce((acc, cat) => ({ ...acc, [cat.key]: true }), {})
  );

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleOutputToggle = (key) => {
    setOutputs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleCategory = (categoryKey) => {
    const categoryOptions = outputOptions.filter(opt => opt.category === categoryKey);
    const allSelected = categoryOptions.every(opt => outputs[opt.key]);
    setOutputs(prev => {
      const next = { ...prev };
      categoryOptions.forEach(opt => { next[opt.key] = !allSelected; });
      return next;
    });
  };

  const handleToggleAll = () => {
    const allSelected = outputOptions.every(opt => outputs[opt.key]);
    setOutputs(prev => {
      const next = {};
      outputOptions.forEach(opt => { next[opt.key] = !allSelected; });
      return next;
    });
  };

  const selectedCount = Object.values(outputs).filter(Boolean).length;

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Nama event wajib diisi';
    if (!form.eventType) newErrors.eventType = 'Jenis event wajib dipilih';
    if (!form.startDate) newErrors.startDate = 'Tanggal mulai wajib diisi';
    if (!form.targetParticipants) newErrors.targetParticipants = 'Jumlah peserta wajib diisi';
    if (!form.goal.trim()) newErrors.goal = 'Tujuan event wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (onSubmit) onSubmit({ ...form, outputs });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-dark-900">Informasi Dasar</h3>

        <FormInput
          label="Nama Event"
          required
          placeholder="Contoh: Tech Conference 2024"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Jenis Event"
            required
            options={eventTypes}
            value={form.eventType}
            onChange={(e) => handleChange('eventType', e.target.value)}
          />
          <FormSelect
            label="Format"
            options={formatOptions}
            value={form.format}
            onChange={(e) => handleChange('format', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Tanggal Mulai"
            required
            type="date"
            value={form.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            error={errors.startDate}
          />
          <FormInput
            label="Tanggal Selesai"
            type="date"
            value={form.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Waktu Mulai"
            type="time"
            value={form.startTime}
            onChange={(e) => handleChange('startTime', e.target.value)}
          />
          <FormInput
            label="Waktu Selesai"
            type="time"
            value={form.endTime}
            onChange={(e) => handleChange('endTime', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Lokasi"
            placeholder="Kota atau platform"
            value={form.location}
            onChange={(e) => handleChange('location', e.target.value)}
          />
          <FormInput
            label="Venue"
            placeholder="Nama tempat"
            value={form.venue}
            onChange={(e) => handleChange('venue', e.target.value)}
          />
        </div>
      </div>

      {/* Target & Goal */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-dark-900">Target & Tujuan</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Target Peserta"
            required
            type="number"
            placeholder="Jumlah peserta"
            value={form.targetParticipants}
            onChange={(e) => handleChange('targetParticipants', e.target.value)}
            error={errors.targetParticipants}
          />
          <FormInput
            label="Target Audiens"
            placeholder="Contoh: Karyawan, Mahasiswa"
            value={form.targetAudience}
            onChange={(e) => handleChange('targetAudience', e.target.value)}
          />
        </div>

        <FormTextarea
          label="Tujuan Event"
          required
          placeholder="Jelaskan tujuan dan目标 event..."
          value={form.goal}
          onChange={(e) => handleChange('goal', e.target.value)}
          error={errors.goal}
        />

        <FormSelect
          label="Tone/Acorn"
          options={toneOptions}
          value={form.tone}
          onChange={(e) => handleChange('tone', e.target.value)}
        />
      </div>

      {/* Budget & PIC */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-dark-900">Anggaran & Penanggung Jawab</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Anggaran (Rp)"
            type="number"
            placeholder="Contoh: 50000000"
            value={form.budget}
            onChange={(e) => handleChange('budget', e.target.value)}
          />
          <FormInput
            label="Divisi"
            placeholder="Divisi yang bertanggung jawab"
            value={form.division}
            onChange={(e) => handleChange('division', e.target.value)}
          />
        </div>

        <FormInput
          label="PIC Utama"
          placeholder="Nama penanggung jawab"
          value={form.picMain}
          onChange={(e) => handleChange('picMain', e.target.value)}
        />

        <FormTextarea
          label="Catatan Tambahan"
          placeholder="Informasi lain yang relevan..."
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
        />
      </div>

      {/* Output Selection - Comprehensive AI Proposal */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-dark-900">Output yang Ingin Dibuat</h3>
            <p className="text-sm text-dark-500">Pilih bagian proposal yang ingin dibuat oleh AI ({selectedCount}/{outputOptions.length} dipilih)</p>
          </div>
          <button
            type="button"
            onClick={handleToggleAll}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            {outputOptions.every(opt => outputs[opt.key]) ? 'Batal Pilih Semua' : 'Pilih Semua'}
          </button>
        </div>

        {outputCategories.map((cat) => {
          const catOptions = outputOptions.filter(opt => opt.category === cat.key);
          const allSelected = catOptions.every(opt => outputs[opt.key]);
          const someSelected = catOptions.some(opt => outputs[opt.key]);
          const isExpanded = expandedCategories[cat.key];

          return (
            <div key={cat.key} className="border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setExpandedCategories(prev => ({ ...prev, [cat.key]: !prev[cat.key] }))}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors cursor-pointer ${
                      allSelected
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : someSelected
                        ? 'bg-brand-200 border-brand-400 text-brand-700'
                        : 'border-gray-300 bg-white'
                    }`}
                    onClick={(e) => { e.stopPropagation(); handleToggleCategory(cat.key); }}
                  >
                    {allSelected && <span className="text-xs">✓</span>}
                    {someSelected && !allSelected && <span className="text-xs">−</span>}
                  </div>
                  <span className="text-sm font-semibold text-dark-700">{cat.label}</span>
                  <span className="text-xs text-dark-400">
                    {catOptions.filter(opt => outputs[opt.key]).length}/{catOptions.length}
                  </span>
                </div>
                {isExpanded ? <ChevronDown size={16} className="text-dark-400" /> : <ChevronRight size={16} className="text-dark-400" />}
              </div>

              {isExpanded && (
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {catOptions.map((opt) => (
                    <label
                      key={opt.key}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                        outputs[opt.key]
                          ? 'border-brand-400 bg-brand-50 text-brand-700'
                          : 'border-gray-200 hover:border-gray-300 text-dark-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={outputs[opt.key]}
                        onChange={() => handleOutputToggle(opt.key)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        loading={loading}
        disabled={loading}
        icon={loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
        className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold py-4 text-base"
      >
        {loading ? 'AI sedang membuat perencanaan event...' : 'Buat Rencana dengan AI'}
      </Button>

      {loading && (
        <div className="text-center text-sm text-dark-500">
          <p>Ini mungkin memakan waktu beberapa menit. Jangan tutup halaman ini.</p>
        </div>
      )}
    </form>
  );
}
