import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import eventService from '../../services/eventService';
import { eventTypes as eventTypesService } from '../../services/masterService';
import { EVENT_FORMATS, EVENT_TONES } from '../../utils/constants';
import { validateRequired } from '../../utils/validators';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FormInput from '../../components/ui/FormInput';
import FormSelect from '../../components/ui/FormSelect';
import FormTextarea from '../../components/ui/FormTextarea';

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

export default function EventCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [eventTypeOptions, setEventTypeOptions] = useState([]);

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

  const validate = () => {
    const errs = {};
    const nameCheck = validateRequired(form.name, 'Nama Event');
    if (!nameCheck.valid) errs.name = nameCheck.message;
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.targetParticipants) payload.targetParticipants = Number(payload.targetParticipants);
      if (payload.budget) payload.budget = Number(payload.budget);
      await eventService.create(payload);
      toast.success('Event berhasil dibuat');
      navigate('/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat event');
    } finally {
      setLoading(false);
    }
  };

  const formatOptions = Object.entries(EVENT_FORMATS).map(([k, v]) => ({ value: k, label: v }));
  const toneOptions = Object.entries(EVENT_TONES).map(([k, v]) => ({ value: k, label: v }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-dark-900">Buat Event Baru</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informasi Dasar */}
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

        {/* Waktu & Lokasi */}
        <Card>
          <h2 className="text-lg font-semibold text-dark-900 mb-4">Waktu & Lokasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Tanggal Mulai"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
            />
            <FormInput
              label="Tanggal Selesai"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
            />
            <FormInput
              label="Jam Mulai"
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={handleChange}
            />
            <FormInput
              label="Jam Selesai"
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={handleChange}
            />
            <FormInput
              label="Lokasi"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Kota / wilayah"
            />
            <FormInput
              label="Venue"
              name="venue"
              value={form.venue}
              onChange={handleChange}
              placeholder="Nama gedung / tempat"
            />
            <FormSelect
              label="Format"
              name="format"
              value={form.format}
              onChange={handleChange}
              options={formatOptions}
            />
          </div>
        </Card>

        {/* Detail Event */}
        <Card>
          <h2 className="text-lg font-semibold text-dark-900 mb-4">Detail Event</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Target Peserta"
              name="targetParticipants"
              type="number"
              value={form.targetParticipants}
              onChange={handleChange}
              placeholder="Jumlah peserta"
            />
            <FormSelect
              label="Tone Acara"
              name="tone"
              value={form.tone}
              onChange={handleChange}
              options={toneOptions}
              placeholder="Pilih tone"
            />
            <FormTextarea
              label="Target Audiens"
              name="targetAudience"
              value={form.targetAudience}
              onChange={handleChange}
              placeholder="Siapa yang menjadi target peserta"
              className="md:col-span-2"
            />
            <FormTextarea
              label="Tujuan Event"
              name="goal"
              value={form.goal}
              onChange={handleChange}
              placeholder="Tujuan dari event ini"
              className="md:col-span-2"
            />
          </div>
        </Card>

        {/* Penanggung Jawab */}
        <Card>
          <h2 className="text-lg font-semibold text-dark-900 mb-4">Penanggung Jawab</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Divisi"
              name="division"
              value={form.division}
              onChange={handleChange}
              placeholder="Divisi penanggung jawab"
            />
            <FormInput
              label="PIC Utama"
              name="picMain"
              value={form.picMain}
              onChange={handleChange}
              placeholder="Nama PIC"
            />
          </div>
        </Card>

        {/* Anggaran */}
        <Card>
          <h2 className="text-lg font-semibold text-dark-900 mb-4">Anggaran</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Budget</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400 text-sm">
                  Rp
                </span>
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

        {/* Catatan */}
        <Card>
          <h2 className="text-lg font-semibold text-dark-900 mb-4">Catatan</h2>
          <FormTextarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Catatan tambahan..."
            rows={4}
          />
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" icon={<ArrowLeft />} onClick={() => navigate(-1)}>
            Batal
          </Button>
          <Button variant="primary" type="submit" loading={loading} icon={<Save />}>
            Simpan Draft
          </Button>
        </div>
      </form>
    </div>
  );
}
