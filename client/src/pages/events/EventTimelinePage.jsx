import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  List,
  LayoutGrid,
  GanttChart,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { timelines } from '../../services/eventSubService';
import { TIMELINE_PHASES, APPROVAL_STATUSES } from '../../utils/constants';
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
  { key: 'gantt', label: 'Gantt', icon: GanttChart },
];

const initialItem = {
  phase: '',
  title: '',
  description: '',
  dueDate: '',
  status: 'pending',
  assignee: '',
};

const phaseOptions = TIMELINE_PHASES.map((p) => ({ value: p.key, label: p.label }));
const statusOptions = Object.entries(APPROVAL_STATUSES).map(([k, v]) => ({ value: k, label: v.label }));

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
      title: item.title || '',
      description: item.description || '',
      dueDate: item.dueDate ? item.dueDate.slice(0, 10) : '',
      status: item.status || 'pending',
      assignee: item.assignee || '',
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
    if (!form.title.trim()) {
      setFormErrors({ title: 'Judul wajib diisi' });
      return;
    }
    setSubmitting(true);
    try {
      if (editingItem) {
        await timelines.update(eventId, editingItem.id || editingItem._id, form);
        toast.success('Timeline berhasil diperbarui');
      } else {
        await timelines.create(eventId, form);
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
      await timelines.delete(eventId, deleteTarget.id || deleteTarget._id);
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
          {/* View mode toggles */}
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
            <Card key={item.id || item._id} className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                    {TIMELINE_PHASES.find((p) => p.key === item.phase)?.label || item.phase}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
                <h3 className="font-medium text-dark-900">{item.title}</h3>
                {item.description && <p className="text-sm text-dark-500 mt-1">{item.description}</p>}
                <div className="flex items-center gap-4 mt-2 text-xs text-dark-400">
                  {item.dueDate && <span>Jatuh tempo: {formatDate(item.dueDate)}</span>}
                  {item.assignee && <span>PIC: {item.assignee}</span>}
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
      ) : viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['pending', 'in_progress', 'completed'].map((status) => (
            <div key={status} className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-dark-700 mb-3">
                {APPROVAL_STATUSES[status]?.label || status}
              </h3>
              <div className="space-y-2">
                {items.filter((i) => i.status === status).map((item) => (
                  <Card key={item.id || item._id} padding="p-3" className="cursor-pointer" onClick={() => openEdit(item)}>
                    <p className="text-sm font-medium text-dark-900">{item.title}</p>
                    <p className="text-xs text-dark-400 mt-1">
                      {TIMELINE_PHASES.find((p) => p.key === item.phase)?.label || ''}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Gantt view - simplified table */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 font-medium text-dark-500">Fase</th>
                  <th className="text-left py-2 px-3 font-medium text-dark-500">Judul</th>
                  <th className="text-left py-2 px-3 font-medium text-dark-500">Jatuh Tempo</th>
                  <th className="text-left py-2 px-3 font-medium text-dark-500">Status</th>
                  <th className="text-left py-2 px-3 font-medium text-dark-500">PIC</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id || item._id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => openEdit(item)}>
                    <td className="py-2.5 px-3 text-dark-700">
                      {TIMELINE_PHASES.find((p) => p.key === item.phase)?.label || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-dark-900">{item.title}</td>
                    <td className="py-2.5 px-3 text-dark-600">{formatDate(item.dueDate)}</td>
                    <td className="py-2.5 px-3"><StatusBadge status={item.status} /></td>
                    <td className="py-2.5 px-3 text-dark-600">{item.assignee || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
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
          <FormInput label="Judul" name="title" value={form.title} onChange={handleChange} error={formErrors.title} required placeholder="Judul item timeline" />
          <FormTextarea label="Deskripsi" name="description" value={form.description} onChange={handleChange} placeholder="Deskripsi singkat" rows={3} />
          <FormInput label="Jatuh Tempo" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
          <FormSelect label="Status" name="status" value={form.status} onChange={handleChange} options={statusOptions} />
          <FormInput label="PIC / Penanggung Jawab" name="assignee" value={form.assignee} onChange={handleChange} placeholder="Nama PIC" />
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Timeline"
        message={`Hapus item "${deleteTarget?.title}" dari timeline?`}
        confirmText="Hapus"
      />
    </div>
  );
}
