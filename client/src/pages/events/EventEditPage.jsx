import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function EventEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventTypeOptions, setEventTypeOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '',
    eventType: '',
    startDate: '',
    startTime: '',
    endTime: '',
    location: '',
    venue: '',
    format: 'offline',
    targetParticipants: '',
    goal: '',
    tone: '',
    budget: '',
    division: '',
    picMain: '',
    notes: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventRes, typesRes] = await Promise.all([
          eventService.getById(id),
          eventTypesService.list(),
        ]);
        const event = eventRes.data.data;
        const types = typesRes.data.data;

        setEventTypeOptions(
          (Array.isArray(types) ? types : []).map((t) => ({
            value: t.id,
            label: t.name,
          }))
        );

        setForm({
          name: event.name || '',
          eventType: event.event_type_id || '',
          startDate: event.event_date || '',
          startTime: event.start_time || '',
          endTime: event.end_time || '',
          location: event.location || '',
          venue: event.venue || '',
          format: event.format || 'offline',
          targetParticipants: event.estimated_participants || '',
          goal: event.goal || '',
          tone: event.tone || '',
          budget: event.budget_max || '',
          division: event.division || '',
          picMain: event.pic_main?.name || event.pic_main || event.picMain?.name || event.picMain || '',
          notes: event.notes || '',
        });
      } catch {
        toast.error('Gagal memuat data event');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

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
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        event_type_id: form.eventType || null,
        event_date: form.startDate,
        start_time: form.startTime || '09:00',
        end_time: form.endTime || '17:00',
        location: form.location,
        venue: form.venue,
        format: form.format,
        estimated_participants: form.targetParticipants ? Number(form.targetParticipants) : null,
        goal: form.goal,
        tone: form.tone,
        budget_max: form.budget ? Number(form.budget) : null,
        division: form.division,
        notes: form.notes,
      };
      await eventService.update(id, payload);
      toast.success('Event berhasil diperbarui');
      navigate(`/events/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const formatOptions = Object.entries(EVENT_FORMATS).map(([k, v]) => ({ value: k, label: v }));
  const toneOptions = Object.entries(EVENT_TONES).map(([k, v]) => ({ value: k, label: v }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-900">Edit Event</h1>
        <Button variant="outline" icon={<ArrowLeft />} onClick={() => navigate(`/events/${id}`)}>
          Kembali
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
            <FormSelect label="Tipe Event" name="eventType" value={form.eventType} onChange={handleChange} options={eventTypeOptions} placeholder="Pilih tipe" />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-dark-900 mb-4">Waktu & Lokasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Tanggal" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
            <FormInput label="Jam Mulai" name="startTime" type="time" value={form.startTime} onChange={handleChange} />
            <FormInput label="Jam Selesai" name="endTime" type="time" value={form.endTime} onChange={handleChange} />
            <FormInput label="Lokasi" name="location" value={form.location} onChange={handleChange} />
            <FormInput label="Venue" name="venue" value={form.venue} onChange={handleChange} />
            <FormSelect label="Format" name="format" value={form.format} onChange={handleChange} options={formatOptions} />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-dark-900 mb-4">Detail Event</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Target Peserta" name="targetParticipants" type="number" value={form.targetParticipants} onChange={handleChange} />
            <FormSelect label="Tone" name="tone" value={form.tone} onChange={handleChange} options={toneOptions} placeholder="Pilih tone" />
            <FormTextarea label="Tujuan" name="goal" value={form.goal} onChange={handleChange} className="md:col-span-2" />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-dark-900 mb-4">PIC & Budget</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Divisi" name="division" value={form.division} onChange={handleChange} />
            <FormInput label="PIC Utama" name="picMain" value={form.picMain} onChange={handleChange} />
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Budget (Rp)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400 text-sm">Rp</span>
                <input name="budget" type="number" value={form.budget} onChange={handleChange} placeholder="0"
                  className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-dark-900 mb-4">Catatan</h2>
          <FormTextarea name="notes" value={form.notes} onChange={handleChange} rows={4} />
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate(`/events/${id}`)}>Batal</Button>
          <Button variant="primary" type="submit" loading={saving} icon={<Save />}>Simpan Perubahan</Button>
        </div>
      </form>
    </div>
  );
}
