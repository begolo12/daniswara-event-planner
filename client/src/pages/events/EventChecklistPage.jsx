import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { checklists } from '../../services/eventSubService';
import { CHECKLIST_CATEGORIES, PRIORITIES } from '../../utils/constants';
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

const initialItem = {
  category: '',
  title: '',
  description: '',
  assignee: '',
  dueDate: '',
  priority: 'medium',
};

const categoryOptions = Object.entries(CHECKLIST_CATEGORIES).map(([k, v]) => ({ value: k, label: v }));
const priorityOptions = Object.entries(PRIORITIES).map(([k, v]) => ({ value: k, label: v.label }));

export default function EventChecklistPage() {
  const { id: eventId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(initialItem);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await checklists.list(eventId);
      setItems(res.data.data || []);
    } catch {
      toast.error('Gagal memuat checklist');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const completedCount = items.filter((i) => i.status === 'completed' || i.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const openAdd = () => {
    setEditingItem(null);
    setForm(initialItem);
    setShowAddModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      category: item.category || '',
      title: item.title || '',
      description: item.description || '',
      assignee: item.assignee || '',
      dueDate: item.dueDate ? item.dueDate.slice(0, 10) : '',
      priority: item.priority || 'medium',
    });
    setShowAddModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      if (editingItem) {
        await checklists.update(eventId, editingItem.id || editingItem._id, form);
        toast.success('Checklist berhasil diperbarui');
      } else {
        await checklists.create(eventId, form);
        toast.success('Checklist berhasil ditambahkan');
      }
      setShowAddModal(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan checklist');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await checklists.toggleStatus(eventId, item.id || item._id);
      fetchItems();
    } catch {
      toast.error('Gagal mengubah status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await checklists.delete(eventId, deleteTarget.id || deleteTarget._id);
      toast.success('Checklist berhasil dihapus');
      setDeleteTarget(null);
      fetchItems();
    } catch {
      toast.error('Gagal menghapus checklist');
    }
  };

  // Group by category
  const grouped = items.reduce((acc, item) => {
    const cat = item.category || 'Lainnya';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

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
          <h2 className="text-xl font-semibold text-dark-900">Checklist Event</h2>
          <p className="text-sm text-dark-400 mt-1">
            {completedCount} dari {totalCount} selesai ({progress}%)
          </p>
        </div>
        <Button variant="primary" icon={<Plus />} size="sm" onClick={openAdd}>
          Tambah Item
        </Button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-brand-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <EmptyState
          icon={Check}
          title="Belum ada checklist"
          message="Tambahkan item checklist untuk event ini."
          action={<Button variant="primary" icon={<Plus />} onClick={openAdd}>Tambah Item</Button>}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, catItems]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-dark-600 uppercase tracking-wide mb-3">
                {CHECKLIST_CATEGORIES[category] || category}
              </h3>
              <div className="space-y-2">
                {catItems.map((item) => {
                  const done = item.status === 'completed' || item.completed;
                  return (
                    <Card
                      key={item.id || item._id}
                      padding="p-3"
                      className={`flex items-center gap-3 ${done ? 'bg-green-50/50' : ''}`}
                    >
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          done
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-brand-400'
                        }`}
                      >
                        {done && <Check size={12} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${done ? 'line-through text-dark-400' : 'text-dark-900'}`}>
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-xs text-dark-400 mt-0.5">{item.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-dark-400">
                          {item.assignee && <span>PIC: {item.assignee}</span>}
                          {item.dueDate && <span>Jatuh tempo: {formatDate(item.dueDate)}</span>}
                          {item.priority && (
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                              item.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                              item.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {PRIORITIES[item.priority]?.label || item.priority}
                            </span>
                          )}
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
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingItem ? 'Edit Checklist' : 'Tambah Checklist'}
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
          <FormSelect label="Kategori" name="category" value={form.category} onChange={handleChange} options={categoryOptions} placeholder="Pilih kategori" />
          <FormInput label="Judul" name="title" value={form.title} onChange={handleChange} required placeholder="Judul item" />
          <FormTextarea label="Deskripsi" name="description" value={form.description} onChange={handleChange} placeholder="Deskripsi singkat" rows={2} />
          <FormInput label="PIC" name="assignee" value={form.assignee} onChange={handleChange} placeholder="Penanggung jawab" />
          <FormInput label="Jatuh Tempo" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
          <FormSelect label="Prioritas" name="priority" value={form.priority} onChange={handleChange} options={priorityOptions} />
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Checklist"
        message={`Hapus item "${deleteTarget?.title}" dari checklist?`}
        confirmText="Hapus"
      />
    </div>
  );
}
