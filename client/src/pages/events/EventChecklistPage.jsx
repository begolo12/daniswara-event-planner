import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { checklists } from '../../services/eventSubService';
import { CHECKLIST_CATEGORIES, PRIORITIES } from '../../utils/constants';
import { formatDate, formatCurrency } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import FormInput from '../../components/ui/FormInput';
import FormSelect from '../../components/ui/FormSelect';
import FormTextarea from '../../components/ui/FormTextarea';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const initialItem = {
  category: '',
  item_name: '',
  quantity: 1,
  priority: 'medium',
  pic_id: '',
  deadline: '',
  estimated_cost: '',
  status: 'not_started',
  notes: '',
};

const categoryOptions = Object.entries(CHECKLIST_CATEGORIES).map(([k, v]) => ({ value: k, label: v }));
const priorityOptions = Object.entries(PRIORITIES).map(([k, v]) => ({ value: k, label: v.label }));
const statusOptions = [
  { value: 'not_started', label: 'Belum Mulai' },
  { value: 'in_progress', label: 'Dikerjakan' },
  { value: 'done', label: 'Selesai' },
];

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

  const completedCount = items.filter((i) => i.status === 'done').length;
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
      item_name: item.item_name || '',
      quantity: item.quantity || 1,
      priority: item.priority || 'medium',
      pic_id: item.pic_id || '',
      deadline: item.deadline ? item.deadline.slice(0, 10) : '',
      estimated_cost: item.estimated_cost || '',
      status: item.status || 'not_started',
      notes: item.notes || '',
    });
    setShowAddModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.item_name.trim()) {
      toast.error('Nama item wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        category: form.category,
        item_name: form.item_name,
        quantity: Number(form.quantity) || 1,
        priority: form.priority,
        pic_id: form.pic_id ? Number(form.pic_id) : null,
        deadline: form.deadline || null,
        estimated_cost: Number(form.estimated_cost) || 0,
        status: form.status,
        notes: form.notes,
      };
      if (editingItem) {
        await checklists.update(eventId, editingItem.id, payload);
        toast.success('Checklist berhasil diperbarui');
      } else {
        await checklists.create(eventId, payload);
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
      await checklists.toggleStatus(eventId, item.id);
      fetchItems();
    } catch {
      toast.error('Gagal mengubah status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await checklists.delete(eventId, deleteTarget.id);
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
                  const done = item.status === 'done';
                  return (
                    <Card
                      key={item.id}
                      padding="p-3"
                      className={`flex items-center gap-3 ${done ? 'bg-green-50/50' : ''}`}
                    >
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          done
                            ? 'bg-green-500 border-green-500 text-white'
                            : item.status === 'in_progress'
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : 'border-gray-300 hover:border-brand-400'
                        }`}
                      >
                        {done && <Check size={12} />}
                        {item.status === 'in_progress' && <span className="text-[8px]">⋯</span>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${done ? 'line-through text-dark-400' : 'text-dark-900'}`}>
                            {item.item_name}
                          </p>
                          {item.quantity > 1 && (
                            <span className="text-xs text-dark-400">×{item.quantity}</span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-xs text-dark-400 mt-0.5">{item.notes}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-dark-400">
                          {item.pic_id && <span>PIC ID: {item.pic_id}</span>}
                          {item.deadline && <span>Jatuh tempo: {formatDate(item.deadline)}</span>}
                          {item.estimated_cost > 0 && <span>Estimasi: {formatCurrency(item.estimated_cost)}</span>}
                          {item.priority && (
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                              item.priority === 'critical' ? 'bg-red-100 text-red-700' :
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
          <FormInput label="Nama Item" name="item_name" value={form.item_name} onChange={handleChange} required placeholder="Nama item checklist" />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Jumlah" name="quantity" type="number" value={form.quantity} onChange={handleChange} min="1" />
            <FormSelect label="Prioritas" name="priority" value={form.priority} onChange={handleChange} options={priorityOptions} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="PIC ID" name="pic_id" type="number" value={form.pic_id} onChange={handleChange} placeholder="ID penanggung jawab" />
            <FormInput label="Jatuh Tempo" name="deadline" type="date" value={form.deadline} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">Estimasi Biaya (Rp)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400 text-sm">Rp</span>
              <input
                name="estimated_cost"
                type="number"
                value={form.estimated_cost}
                onChange={handleChange}
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>
          <FormSelect label="Status" name="status" value={form.status} onChange={handleChange} options={statusOptions} />
          <FormTextarea label="Catatan" name="notes" value={form.notes} onChange={handleChange} placeholder="Catatan tambahan" rows={2} />
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Checklist"
        message={`Hapus item "${deleteTarget?.item_name}" dari checklist?`}
        confirmText="Hapus"
      />
    </div>
  );
}
