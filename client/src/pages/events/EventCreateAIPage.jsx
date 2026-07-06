import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Sparkles,
  Loader2,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import eventService from '../../services/eventService';
import aiService from '../../services/aiService';
import { eventTypes as eventTypesService } from '../../services/masterService';
import { EVENT_FORMATS, EVENT_TONES } from '../../utils/constants';
import { validateRequired } from '../../utils/validators';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FormInput from '../../components/ui/FormInput';
import FormSelect from '../../components/ui/FormSelect';
import FormTextarea from '../../components/ui/FormTextarea';
import Drawer from '../../components/ui/Drawer';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AIResultViewer from '../../components/ai/AIResultViewer';

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
  tone: '',
  budget: '',
  division: '',
  picMain: '',
  notes: '',
};

const OUTPUT_OPTIONS = [
  { key: 'brief_event', label: 'Brief Event' },
  { key: 'tema_konsep', label: 'Tema & Konsep' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'rundown', label: 'Rundown' },
  { key: 'checklist', label: 'Checklist' },
  { key: 'anggaran', label: 'Anggaran' },
  { key: 'tugas', label: 'Tugas' },
  { key: 'rencana_risiko', label: 'Rencana Risiko' },
  { key: 'dokumen', label: 'Dokumen' },
  { key: 'evaluasi', label: 'Evaluasi' },
];

export default function EventCreateAIPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [eventTypeOptions, setEventTypeOptions] = useState([]);
  const [aiResults, setAiResults] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [outputs, setOutputs] = useState(
    OUTPUT_OPTIONS.reduce((acc, opt) => ({ ...acc, [opt.key]: true }), {})
  );
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    eventTypesService
      .list()
      .then((res) => {
        const list = res.data.data;
        setEventTypeOptions(
          (Array.isArray(list) ? list : []).map((t) => ({
            value: t.id || t._id,
            label: t.name,
          }))
        );
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const toggleOutput = (key) => {
    setOutputs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const validate = () => {
    const errs = {};
    const nameCheck = validateRequired(form.name, 'Nama Event');
    if (!nameCheck.valid) errs.name = nameCheck.message;
    return errs;
  };

  const handleGenerate = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setGenerating(true);
    try {
      const payload = { ...form, outputs };
      if (payload.targetParticipants) payload.targetParticipants = Number(payload.targetParticipants);
      if (payload.budget) payload.budget = Number(payload.budget);
      const res = await aiService.generateEvent(payload);
      setAiResults(res.data.data);
      setShowDrawer(true);
      toast.success('AI selesai membuat perencanaan');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal generate dengan AI');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.targetParticipants) payload.targetParticipants = Number(payload.targetParticipants);
      if (payload.budget) payload.budget = Number(payload.budget);
      const eventRes = await eventService.create(payload);
      const eventId = eventRes.data.data.id || eventRes.data.data._id;
      // Save AI results as sub-documents if available
      if (aiResults) {
        const { documents: docService } = await import('../../services/eventSubService');
        for (const [type, content] of Object.entries(aiResults)) {
          if (content && typeof content === 'object') {
            try {
              await docService.create(eventId, {
                title: `Output AI - ${type}`,
                type: 'other',
                content: JSON.stringify(content),
                status: 'draft',
              });
            } catch { /* skip individual failures */ }
          }
        }
      }
      toast.success('Event dan hasil AI berhasil disimpan');
      navigate(`/events/${eventId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  };

  const formatOptions = Object.entries(EVENT_FORMATS).map(([k, v]) => ({ value: k, label: v }));
  const toneOptions = Object.entries(EVENT_TONES).map(([k, v]) => ({ value: k, label: v }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-dark-900">Buat Event dengan AI</h1>

      {/* Form */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold text-dark-900 mb-4">Informasi Dasar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Nama Event"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder="Nama event"
            />
            <FormSelect
              label="Tipe Event"
              name="eventType"
              value={form.eventType}
              onChange={handleChange}
              options={eventTypeOptions}
              placeholder="Pilih tipe event"
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-dark-900 mb-4">Waktu & Lokasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Tanggal Mulai" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
            <FormInput label="Tanggal Selesai" name="endDate" type="date" value={form.endDate} onChange={handleChange} />
            <FormInput label="Jam Mulai" name="startTime" type="time" value={form.startTime} onChange={handleChange} />
            <FormInput label="Jam Selesai" name="endTime" type="time" value={form.endTime} onChange={handleChange} />
            <FormInput label="Lokasi" name="location" value={form.location} onChange={handleChange} placeholder="Kota / wilayah" />
            <FormInput label="Venue" name="venue" value={form.venue} onChange={handleChange} placeholder="Nama gedung / tempat" />
            <FormSelect label="Format" name="format" value={form.format} onChange={handleChange} options={formatOptions} />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-dark-900 mb-4">Detail Event</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Target Peserta" name="targetParticipants" type="number" value={form.targetParticipants} onChange={handleChange} placeholder="Jumlah peserta" />
            <FormSelect label="Tone Acara" name="tone" value={form.tone} onChange={handleChange} options={toneOptions} placeholder="Pilih tone" />
            <FormTextarea label="Target Audiens" name="targetAudience" value={form.targetAudience} onChange={handleChange} placeholder="Siapa yang menjadi target peserta" className="md:col-span-2" />
            <FormTextarea label="Tujuan Event" name="goal" value={form.goal} onChange={handleChange} placeholder="Tujuan dari event ini" className="md:col-span-2" />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-dark-900 mb-4">Penanggung Jawab</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Divisi" name="division" value={form.division} onChange={handleChange} placeholder="Divisi penanggung jawab" />
            <FormInput label="PIC Utama" name="picMain" value={form.picMain} onChange={handleChange} placeholder="Nama PIC" />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-dark-900 mb-4">Anggaran</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Budget</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400 text-sm">Rp</span>
                <input
                  name="budget"
                  type="number"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-dark-900 mb-4">Catatan</h2>
          <FormTextarea name="notes" value={form.notes} onChange={handleChange} placeholder="Catatan tambahan..." rows={4} />
        </Card>

        {/* Output Checkboxes */}
        <Card>
          <h2 className="text-lg font-semibold text-dark-900 mb-4">Output yang Ingin Dibuat</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {OUTPUT_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  outputs[opt.key]
                    ? 'border-brand-300 bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-dark-600 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                    outputs[opt.key]
                      ? 'bg-brand-600 border-brand-600 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {outputs[opt.key] && <Check size={12} />}
                </div>
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" icon={<ArrowLeft />} onClick={() => navigate(-1)}>
            Batal
          </Button>
          <Button
            variant="primary"
            type="button"
            size="lg"
            loading={generating}
            icon={generating ? <Loader2 className="animate-spin" /> : <Sparkles />}
            onClick={handleGenerate}
            className="min-w-[220px]"
          >
            {generating ? 'Menggenerate...' : 'Generate dengan AI'}
          </Button>
        </div>
      </form>

      {/* Generating Overlay */}
      {generating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-4 max-w-sm">
            <LoadingSpinner size="lg" />
            <p className="text-dark-900 font-medium text-center">AI sedang membuat perencanaan event...</p>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      {/* Results Drawer */}
      <Drawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        title="Hasil Generate AI — Dokumen Siap Print"
        size="xl"
      >
        {aiResults && (
          <AIResultViewer
            results={aiResults}
            eventData={form}
            onSave={handleSaveAll}
            onRegenerate={handleGenerate}
          />
        )}
      </Drawer>
    </div>
  );
}
