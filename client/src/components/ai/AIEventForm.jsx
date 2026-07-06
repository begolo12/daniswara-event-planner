import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
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

const outputOptions = [
  { key: 'brief', label: 'Brief Event' },
  { key: 'themes', label: 'Tema & Konsep' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'rundown', label: 'Rundown' },
  { key: 'checklist', label: 'Checklist' },
  { key: 'budget', label: 'Anggaran' },
  { key: 'tasks', label: 'Tugas' },
  { key: 'risks', label: 'Rencana Risiko' },
  { key: 'documents', label: 'Dokumen' },
  { key: 'evaluation', label: 'Evaluasi' },
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

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleOutputToggle = (key) => {
    setOutputs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

      {/* Output Selection */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-dark-900">Output yang Ingin Dibuat</h3>
        <p className="text-sm text-dark-500">Pilih dokumen/rencana yang ingin dibuat oleh AI</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {outputOptions.map((opt) => (
            <label
              key={opt.key}
              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors
                ${outputs[opt.key]
                  ? 'border-brand-400 bg-brand-50 text-brand-700'
                  : 'border-gray-200 hover:border-gray-300 text-dark-600'}`}
            >
              <input
                type="checkbox"
                checked={outputs[opt.key]}
                onChange={() => handleOutputToggle(opt.key)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-medium">{opt.label}</span>
            </label>
          ))}
        </div>
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
