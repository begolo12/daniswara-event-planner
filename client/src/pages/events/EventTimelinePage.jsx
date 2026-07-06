import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  List,
  LayoutGrid,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { timelines } from '../../services/eventSubService';
import { TIMELINE_PHASES, TIMELINE_STATUSES, PRIORITIES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import FormInput from '../../components/ui/FormInput';
import FormSelect from '../../components/ui/FormSelect';
import FormTextarea from '../../components/ui/FormTextarea';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';

const VIEW_MODES = [
  { key: 'list', label: 'List', icon: List },
  { key: 'kanban', label: 'Kanban', icon: LayoutGrid },
];

const initialItem = {
  phase: '',
  activity: '',
  date: '',
  deadline: '',
  priority: 'medium',
  risk_if_late: '',
  status: 'not_started',
  pic_id: '',
  notes: '',
};

const phaseOptions = TIMELINE_PHASES.map((p) => ({ value: p.key, label: p.label }));
const statusOptions = Object.entries(TIMELINE_STATUSES).map(([k, v]) => ({ value: k, label: v.label }));
const priorityOptions = Object.entries(PRIORITIES).map(([k, v]) => ({ value: k, label: v.label }));

export default function EventTimelinePage() {
  const { id: eventId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(initialItem);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await timelines.list(eventId);
      setItems(res.data.data || []);
    } catch {
      toast.error('Gagal memuat timeline');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openAdd = () => {
    setEditingItem(null);
    setForm(initialItem);
    setFormErrors({});
    setShowAddModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      phase: item.phase || '',
      activity: item.activity || '',
      date: item.date ? item.date.slice(0, 10) : '',
      deadline: item.deadline ? item.deadline.slice(0, 10) : '',
      priority: item.priority || 'medium',
      risk_if_late: item.risk_if_late || '',
      status: item.status || 'not_started',
      pic_id: item.pic_id || '',
      notes: item.notes || '',
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.activity.trim()) {
      setFormErrors({ activity: 'Kegiatan wajib diisi' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        phase: form.phase,
        activity: form.activity,
        date: form.date || null,
        deadline: form.deadline || null,
        priority: form.priority,
        risk_if_late: form.risk_if_late,
        status: form.status,
        pic_id: form.pic_id ? Number(form.pic_id) : null,
        notes: form.notes,
      };
      if (editingItem) {
        await timelines.update(eventId, editingItem.id, payload);
        toast.success('Timeline berhasil diperbarui');
      } else {
        await timelines.create(eventId, payload);
        toast.success('Timeline berhasil ditambahkan');
      }
      setShowAddModal(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan timeline');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await timelines.delete(eventId, deleteTarget.id);
      toast.success('Timeline berhasil dihapus');
      setDeleteTarget(null);
      fetchItems();
    } catch {
      toast.error('Gagal menghapus timeline');
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
        <h2 className="text-xl font-semibold text-dark-900">Timeline Event</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            {VIEW_MODES.map((vm) => (
              <button
                key={vm.key}
                onClick={() => setViewMode(vm.key)}
                className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  viewMode === vm.key
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-dark-600 hover:bg-gray-50'
                }`}
              >
                <vm.icon size={14} />
                {vm.label}
              </button>
            ))}
          </div>
          <Button variant="primary" icon={<Plus />} size="sm" onClick={openAdd}>
            Tambah Item
          </Button>
        </div>
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Belum ada timeline"
          message="Tambahkan item timeline untuk memulai perencanaan."
          action={<Button variant="primary" icon={<Plus />} onClick={openAdd}>Tambah Item</Button>}
        />
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                    {TIMELINE_PHASES.find((p) => p.key === item.phase)?.label || item.phase}
                  </span>
                  <StatusBadge status={item.status} />
                  {item.priority && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      item.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      item.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {PRIORITIES[item.priority]?.label || item.priority}
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-dark-900">{item.activity}</h3>
                {item.risk_if_late && (
                  <p className="text-xs text-red-500 mt-1">⚠️ Risiko: {item.risk_if_late}</p>
                )}
                {item.notes && (
                  <p className="text-sm text-dark-500 mt-1">{item.notes}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-dark-400">
                  {item.date && <span>Tanggal: {formatDate(item.date)}</span>}
                  {item.deadline && <span>Deadline: {formatDate(item.deadline)}</span>}
                  {item.pic_id && <span>PIC ID: {item.pic_id}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-dark-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  <Edit size={16} />
                </button>
                <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg text-dark-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Kanban view */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['not_started', 'in_progress', 'done'].map((status) => (
            <div key={status} className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-dark-700 mb-3">
                {TIMELINE_STATUSES[status]?.label || status}
              </h3>
              <div className="space-y-2">
                {items.filter((i) => i.status === status).map((item) => (
                  <Card key={item.id} padding="p-3" className="cursor-pointer" onClick={() => openEdit(item)}>
                    <p className="text-sm font-medium text-dark-900">{item.activity}</p>
                    <p className="text-xs text-dark-400 mt-1">
                      {TIMELINE_PHASES.find((p) => p.key === item.phase)?.label || ''}
                    </p>
                    {item.deadline && (
                      <p className="text-xs text-dark-400 mt-0.5">Deadline: {formatDate(item.deadline)}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingItem ? 'Edit Timeline' : 'Tambah Timeline'}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={submitting}>Batal</Button>
            <Button variant="primary" loading={submitting} onClick={handleSubmit}>
              {editingItem ? 'Simpan' : 'Tambah'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormSelect label="Fase" name="phase" value={form.phase} onChange={handleChange} options={phaseOptions} placeholder="Pilih fase" />
          <FormInput label="Kegiatan" name="activity" value={form.activity} onChange={handleChange} error={formErrors.activity} required placeholder="Deskripsi kegiatan" />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Tanggal" name="date" type="date" value={form.date} onChange={handleChange} />
            <FormInput label="Deadline" name="deadline" type="date" value={form.deadline} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormSelect label="Prioritas" name="priority" value={form.priority} onChange={handleChange} options={priorityOptions} />
            <FormSelect label="Status" name="status" value={form.status} onChange={handleChange} options={statusOptions} />
          </div>
          <FormInput label="PIC ID" name="pic_id" type="number" value={form.pic_id} onChange={handleChange} placeholder="ID penanggung jawab" />
          <FormInput label="Risiko Jika Terlambat" name="risk_if_late" value={form.risk_if_late} onChange={handleChange} placeholder="Jelaskan risiko jika terlambat" />
          <FormTextarea label="Catatan" name="notes" value={form.notes} onChange={handleChange} placeholder="Catatan tambahan" rows={3} />
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Timeline"
        message={`Hapus item "${deleteTarget?.activity}" dari timeline?`}
        confirmText="Hapus"
      />
    </div>
  );
}
