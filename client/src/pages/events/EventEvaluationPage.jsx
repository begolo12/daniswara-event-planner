import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Star, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { evaluations } from '../../services/eventSubService';
import aiService from '../../services/aiService';
import { formatDate } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import FormInput from '../../components/ui/FormInput';
import FormTextarea from '../../components/ui/FormTextarea';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const StarRating = ({ value, onChange, readOnly = false }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
        >
          <Star
            size={20}
            className={
              star <= (hover || value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }
          />
        </button>
      ))}
    </div>
  );
};

const initialForm = {
  rating: 0,
  comment: '',
  category: 'overall',
};

const categoryOptions = [
  { value: 'overall', label: 'Keseluruhan' },
  { value: 'venue', label: 'Tempat' },
  { value: 'catering', label: 'Catering' },
  { value: 'organization', label: 'Organisasi' },
  { value: 'entertainment', label: 'Hiburan' },
];

export default function EventEvaluationPage() {
  const { id: eventId } = useParams();
  const [evalList, setEvalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchEvals = useCallback(async () => {
    try {
      const res = await evaluations.list(eventId);
      setEvalList(res.data.data || []);
    } catch {
      toast.error('Gagal memuat evaluasi');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvals();
  }, [fetchEvals]);

  const averageRating = useMemo(() => {
    if (evalList.length === 0) return 0;
    const total = evalList.reduce((sum, e) => sum + (Number(e.rating) || 0), 0);
    return (total / evalList.length).toFixed(1);
  }, [evalList]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) {
      toast.error('Beri rating terlebih dahulu');
      return;
    }
    setSubmitting(true);
    try {
      await evaluations.create(eventId, form);
      toast.success('Evaluasi berhasil ditambahkan');
      setShowForm(false);
      setForm(initialForm);
      fetchEvals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan evaluasi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await evaluations.delete(eventId, deleteTarget.id || deleteTarget._id);
      toast.success('Evaluasi berhasil dihapus');
      setDeleteTarget(null);
      fetchEvals();
    } catch {
      toast.error('Gagal menghapus evaluasi');
    }
  };

  const handleGenerateSummary = async () => {
    setGenerating(true);
    try {
      const res = await aiService.generate(eventId, 'evaluation', {});
      toast.success('Ringkasan evaluasi berhasil digenerate');
      // Could open a modal or show the result
      console.log('AI evaluation summary:', res.data.data);
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
        <h2 className="text-xl font-semibold text-dark-900">Evaluasi Event</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Sparkles />}
            onClick={handleGenerateSummary}
            loading={generating}
          >
            Generate Ringkasan dengan AI
          </Button>
          <Button variant="primary" size="sm" icon={<Plus />} onClick={() => setShowForm(true)}>
            Tambah Evaluasi
          </Button>
        </div>
      </div>

      {/* Average Rating */}
      {evalList.length > 0 && (
        <Card>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-dark-900">{averageRating}</p>
              <p className="text-xs text-dark-400">dari 5</p>
            </div>
            <div>
              <StarRating value={Math.round(Number(averageRating))} readOnly />
              <p className="text-sm text-dark-500 mt-1">{evalList.length} evaluasi</p>
            </div>
          </div>
        </Card>
      )}

      {/* New Evaluation Form */}
      {showForm && (
        <Card className="border-brand-200">
          <h3 className="font-semibold text-dark-900 mb-4">Tambah Evaluasi Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Rating</label>
              <StarRating value={form.rating} onChange={(val) => setForm((p) => ({ ...p, rating: val }))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {categoryOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <FormInput
                label="Evaluator"
                name="evaluator"
                value={form.evaluator || ''}
                onChange={(e) => setForm((p) => ({ ...p, evaluator: e.target.value }))}
                placeholder="Nama evaluator"
              />
            </div>
            <FormTextarea
              label="Komentar"
              name="comment"
              value={form.comment}
              onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
              placeholder="Tulis komentar evaluasi..."
              rows={4}
            />
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setShowForm(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit" loading={submitting}>
                Simpan
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Evaluations List */}
      {evalList.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Belum ada evaluasi"
          message="Tambahkan evaluasi pertama untuk event ini."
          action={<Button variant="primary" icon={<Plus />} onClick={() => setShowForm(true)}>Tambah Evaluasi</Button>}
        />
      ) : (
        <div className="space-y-3">
          {evalList.map((evalItem) => (
            <Card key={evalItem.id || evalItem._id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <StarRating value={Number(evalItem.rating) || 0} readOnly />
                    {evalItem.category && (
                      <span className="text-xs bg-gray-100 text-dark-600 px-2 py-0.5 rounded-full">
                        {categoryOptions.find((c) => c.value === evalItem.category)?.label || evalItem.category}
                      </span>
                    )}
                  </div>
                  {evalItem.comment && (
                    <p className="text-sm text-dark-700">{evalItem.comment}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-dark-400">
                    {evalItem.evaluator && <span>Oleh: {evalItem.evaluator}</span>}
                    <span>{formatDate(evalItem.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteTarget(evalItem)}
                  className="p-1.5 rounded-lg text-dark-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                >
                  Hapus
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Evaluasi"
        message="Hapus evaluasi ini?"
        confirmText="Hapus"
      />
    </div>
  );
}
