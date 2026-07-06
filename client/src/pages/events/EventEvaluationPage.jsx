import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { evaluations } from '../../services/eventSubService';
import aiService from '../../services/aiService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import FormInput from '../../components/ui/FormInput';
import FormTextarea from '../../components/ui/FormTextarea';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function EventEvaluationPage() {
  const { id: eventId } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [hasEval, setHasEval] = useState(false);

  const [form, setForm] = useState({
    rating: '',
    actual_participants: '',
    rundown_compliance: '',
    issues_encountered: '',
    budget_planned: '',
    budget_actual: '',
    feedback_summary: '',
    documentation_notes: '',
    improvement_notes: '',
    recommendations: '',
  });

  const fetchEval = useCallback(async () => {
    try {
      const res = await evaluations.get(eventId);
      const data = res.data.data;
      if (data) {
        setHasEval(true);
        setForm({
          rating: data.rating || '',
          actual_participants: data.actual_participants || '',
          rundown_compliance: data.rundown_compliance || '',
          issues_encountered: data.issues_encountered || '',
          budget_planned: data.budget_planned || '',
          budget_actual: data.budget_actual || '',
          feedback_summary: data.feedback_summary || '',
          documentation_notes: data.documentation_notes || '',
          improvement_notes: data.improvement_notes || '',
          recommendations: data.recommendations || '',
        });
      }
    } catch {
      // No evaluation yet
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEval();
  }, [fetchEval]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        rating: form.rating ? Number(form.rating) : null,
        actual_participants: form.actual_participants ? Number(form.actual_participants) : null,
        rundown_compliance: form.rundown_compliance,
        issues_encountered: form.issues_encountered,
        budget_planned: form.budget_planned ? Number(form.budget_planned) : null,
        budget_actual: form.budget_actual ? Number(form.budget_actual) : null,
        feedback_summary: form.feedback_summary,
        documentation_notes: form.documentation_notes,
        improvement_notes: form.improvement_notes,
        recommendations: form.recommendations,
      };
      await evaluations.create(eventId, payload);
      toast.success('Evaluasi berhasil disimpan');
      setHasEval(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan evaluasi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateSummary = async () => {
    setGenerating(true);
    try {
      const res = await aiService.generate(eventId, 'evaluation', {});
      const aiData = res.data.data;
      if (aiData) {
        // Merge AI results into form
        if (aiData.improvement_notes) {
          setForm((prev) => ({ ...prev, improvement_notes: aiData.improvement_notes }));
        }
        if (aiData.recommendations) {
          setForm((prev) => ({ ...prev, recommendations: aiData.recommendations }));
        }
        if (aiData.ai_summary) {
          setForm((prev) => ({ ...prev, feedback_summary: aiData.ai_summary }));
        }
        toast.success('Ringkasan evaluasi berhasil digenerate');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal generate ringkasan');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-dark-900">Evaluasi Event</h2>
          {hasEval && (
            <p className="text-sm text-green-600 mt-1">✓ Evaluasi sudah tersimpan</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Sparkles />}
            onClick={handleGenerateSummary}
            loading={generating}
          >
            Generate dengan AI
          </Button>
        </div>
      </div>

      {/* Evaluation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Partisipan & Rundown */}
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Data Umum</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Rating Event (1-10)</label>
              <div className="relative">
                <input
                  name="rating"
                  type="number"
                  min="1"
                  max="10"
                  value={form.rating}
                  onChange={handleChange}
                  placeholder="Skor 1-10"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>
            <FormInput
              label="Jumlah Peserta Aktual"
              name="actual_participants"
              type="number"
              value={form.actual_participants}
              onChange={handleChange}
              placeholder="Jumlah peserta yang hadir"
            />
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Rencana Anggaran (Rp)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400 text-sm">Rp</span>
                <input
                  name="budget_planned"
                  type="number"
                  value={form.budget_planned}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-dark-700 mb-1.5">Realisasi Anggaran (Rp)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400 text-sm">Rp</span>
              <input
                name="budget_actual"
                type="number"
                value={form.budget_actual}
                onChange={handleChange}
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <FormTextarea
              label="Kepatuhan Rundown"
              name="rundown_compliance"
              value={form.rundown_compliance}
              onChange={handleChange}
              placeholder="Bagaimana pelaksanaan rundown berjalan? Apakah sesuai jadwal?"
              rows={3}
            />
          </div>
        </Card>

        {/* Masalah & Dokumentasi */}
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Masalah & Dokumentasi</h3>
          <FormTextarea
            label="Masalah yang Dihadapi"
            name="issues_encountered"
            value={form.issues_encountered}
            onChange={handleChange}
            placeholder="Jelaskan masalah-masalah yang terjadi selama pelaksanaan event"
            rows={4}
          />
          <div className="mt-4">
            <FormTextarea
              label="Ringkasan Umpan Balik"
              name="feedback_summary"
              value={form.feedback_summary}
              onChange={handleChange}
              placeholder="Ringkasan umpan balik dari peserta"
              rows={3}
            />
          </div>
          <div className="mt-4">
            <FormTextarea
              label="Catatan Dokumentasi"
              name="documentation_notes"
              value={form.documentation_notes}
              onChange={handleChange}
              placeholder="Catatan tentang dokumentasi event (foto, video, dll)"
              rows={3}
            />
          </div>
        </Card>

        {/* Rekomendasi & Perbaikan */}
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Rekomendasi & Perbaikan</h3>
          <FormTextarea
            label="Poin Perbaikan"
            name="improvement_notes"
            value={form.improvement_notes}
            onChange={handleChange}
            placeholder="Area yang perlu diperbaiki untuk event selanjutnya"
            rows={4}
          />
          <div className="mt-4">
            <FormTextarea
              label="Rekomendasi"
              name="recommendations"
              value={form.recommendations}
              onChange={handleChange}
              placeholder="Rekomendasi untuk event mendatang"
              rows={4}
            />
          </div>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="primary" type="submit" loading={submitting} icon={<Save />}>
            {hasEval ? 'Perbarui Evaluasi' : 'Simpan Evaluasi'}
          </Button>
        </div>
      </form>
    </div>
  );
}
