import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Download,
  GripVertical,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { rundowns } from '../../services/eventSubService';
import { formatDate } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import FormInput from '../../components/ui/FormInput';
import FormTextarea from '../../components/ui/FormTextarea';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const VIEW_OPTIONS = [
  { key: 'full', label: 'Full' },
  { key: 'mc', label: 'MC Only' },
  { key: 'direksi', label: 'Direksi' },
];

const initialItem = {
  time: '',
  endTime: '',
  agenda: '',
  pic: '',
  technicalNeeds: '',
  notes: '',
  isKeyMoment: false,
};

export default function EventRundownPage() {
  const { id: eventId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('full');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(initialItem);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dragEnabled, setDragEnabled] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await rundowns.list(eventId);
      setItems(res.data.data || []);
    } catch {
      toast.error('Gagal memuat rundown');
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
    setShowAddModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      time: item.time || '',
      endTime: item.endTime || '',
      agenda: item.agenda || '',
      pic: item.pic || '',
      technicalNeeds: item.technicalNeeds || '',
      notes: item.notes || '',
      isKeyMoment: item.isKeyMoment || false,
    });
    setShowAddModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agenda.trim()) {
      toast.error('Agenda wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      if (editingItem) {
        await rundowns.update(eventId, editingItem.id || editingItem._id, form);
        toast.success('Rundown berhasil diperbarui');
      } else {
        await rundowns.create(eventId, form);
        toast.success('Rundown berhasil ditambahkan');
      }
      setShowAddModal(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan rundown');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await rundowns.delete(eventId, deleteTarget.id || deleteTarget._id);
      toast.success('Rundown berhasil dihapus');
      setDeleteTarget(null);
      fetchItems();
    } catch {
      toast.error('Gagal menghapus rundown');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setItems(reordered);
    try {
      await rundowns.reorder(eventId, reordered.map((i) => i.id || i._id));
    } catch {
      toast.error('Gagal mengurutkan rundown');
      fetchItems();
    }
  };

  const exportPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Rundown Event', 14, 22);
      autoTable(doc, {
        startY: 30,
        head: [['Waktu', 'Akhir', 'Agenda', 'PIC', 'Kebutuhan Teknis', 'Catatan']],
        body: items.map((i) => [
          i.time || '-',
          i.endTime || '-',
          i.agenda,
          i.pic || '-',
          i.technicalNeeds || '-',
          i.notes || '-',
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [239, 68, 68] },
      });
      doc.save('rundown-event.pdf');
      toast.success('PDF berhasil diunduh');
    } catch {
      toast.error('Gagal export PDF');
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
        <h2 className="text-xl font-semibold text-dark-900">Rundown Event</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {VIEW_OPTIONS.map((v) => (
              <option key={v.key} value={v.key}>{v.label}</option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            icon={<GripVertical />}
            onClick={() => setDragEnabled(!dragEnabled)}
            className={dragEnabled ? 'bg-brand-50 border-brand-300' : ''}
          >
            {dragEnabled ? 'Drag ON' : 'Drag OFF'}
          </Button>
          <Button variant="primary" size="sm" icon={<Plus />} onClick={openAdd}>
            Tambah
          </Button>
          <Button variant="outline" size="sm" icon={<Download />} onClick={exportPDF}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="Belum ada rundown"
          message="Tambahkan item rundown untuk event ini."
          action={<Button variant="primary" icon={<Plus />} onClick={openAdd}>Tambah</Button>}
        />
      ) : (
        <Card padding="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-dark-500 w-8">#</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Waktu</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Akhir</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Agenda</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">PIC</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Kebutuhan Teknis</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Catatan</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item, idx) => (
                  <tr
                    key={item.id || item._id}
                    className={`hover:bg-gray-50 ${item.isKeyMoment ? 'bg-yellow-50/50' : ''}`}
                    draggable={dragEnabled}
                    onDragEnd={handleDragEnd}
                  >
                    <td className="px-4 py-3 text-dark-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-dark-900">{item.time || '-'}</td>
                    <td className="px-4 py-3 text-dark-700">{item.endTime || '-'}</td>
                    <td className="px-4 py-3 text-dark-900">
                      {item.agenda}
                      {item.isKeyMoment && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">Key</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-dark-700">{item.pic || '-'}</td>
                    <td className="px-4 py-3 text-dark-600">{item.technicalNeeds || '-'}</td>
                    <td className="px-4 py-3 text-dark-600">{item.notes || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-dark-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg text-dark-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
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
        title={editingItem ? 'Edit Rundown' : 'Tambah Rundown'}
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
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Waktu Mulai" name="time" type="time" value={form.time} onChange={handleChange} />
            <FormInput label="Waktu Selesai" name="endTime" type="time" value={form.endTime} onChange={handleChange} />
          </div>
          <FormInput label="Agenda" name="agenda" value={form.agenda} onChange={handleChange} required placeholder="Nama agenda" />
          <FormInput label="PIC" name="pic" value={form.pic} onChange={handleChange} placeholder="Penanggung jawab" />
          <FormInput label="Kebutuhan Teknis" name="technicalNeeds" value={form.technicalNeeds} onChange={handleChange} placeholder="Sound, lighting, dll" />
          <FormTextarea label="Catatan" name="notes" value={form.notes} onChange={handleChange} placeholder="Catatan tambahan" rows={2} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isKeyMoment"
              checked={form.isKeyMoment}
              onChange={handleChange}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-dark-700">Moments Penting</span>
          </label>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Rundown"
        message={`Hapus agenda "${deleteTarget?.agenda}" dari rundown?`}
        confirmText="Hapus"
      />
    </div>
  );
}
