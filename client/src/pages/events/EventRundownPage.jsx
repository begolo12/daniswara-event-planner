import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Download,
  GripVertical,
  List,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { rundowns } from '../../services/eventSubService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import FormInput from '../../components/ui/FormInput';
import FormTextarea from '../../components/ui/FormTextarea';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const initialItem = {
  start_time: '',
  end_time: '',
  duration: '',
  agenda: '',
  activity_detail: '',
  pic_id: '',
  technical_needs: '',
  mc_notes: '',
  expected_output: '',
};

export default function EventRundownPage() {
  const { id: eventId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(initialItem);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'list'

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
      start_time: item.start_time || '',
      end_time: item.end_time || '',
      duration: item.duration || '',
      agenda: item.agenda || '',
      activity_detail: item.activity_detail || '',
      pic_id: item.pic_id || '',
      technical_needs: item.technical_needs || '',
      mc_notes: item.mc_notes || '',
      expected_output: item.expected_output || '',
    });
    setShowAddModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agenda.trim()) {
      toast.error('Agenda wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        start_time: form.start_time,
        end_time: form.end_time,
        duration: form.duration,
        agenda: form.agenda,
        activity_detail: form.activity_detail,
        pic_id: form.pic_id ? Number(form.pic_id) : null,
        technical_needs: form.technical_needs,
        mc_notes: form.mc_notes,
        expected_output: form.expected_output,
      };
      if (editingItem) {
        await rundowns.update(eventId, editingItem.id, payload);
        toast.success('Rundown berhasil diperbarui');
      } else {
        await rundowns.create(eventId, payload);
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
      await rundowns.delete(eventId, deleteTarget.id);
      toast.success('Rundown berhasil dihapus');
      setDeleteTarget(null);
      fetchItems();
    } catch {
      toast.error('Gagal menghapus rundown');
    }
  };

  // Simple move up/down instead of drag-and-drop to avoid react-beautiful-dnd SSR issues
  const moveItem = async (index, direction) => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    // Swap items
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);

    // Persist order
    try {
      const orderedIds = newItems.map((i) => i.id);
      await rundowns.reorder(eventId, orderedIds);
    } catch {
      toast.error('Gagal mengubah urutan');
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
        head: [['#', 'Waktu', 'Selesai', 'Agenda', 'Durasi', 'Kebutuhan Teknis', 'Catatan MC']],
        body: items.map((i, idx) => [
          idx + 1,
          i.start_time || '-',
          i.end_time || '-',
          i.agenda,
          i.duration || '-',
          i.technical_needs || '-',
          i.mc_notes || '-',
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
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-brand-600 text-white' : 'bg-white text-dark-600 hover:bg-gray-50'
              }`}
              aria-label="Tampilan tabel"
            >
              <List size={14} />
              Tabel
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'list' ? 'bg-brand-600 text-white' : 'bg-white text-dark-600 hover:bg-gray-50'
              }`}
              aria-label="Tampilan daftar"
            >
              <GripVertical size={14} />
              Daftar
            </button>
          </div>
          <Button variant="primary" size="sm" icon={<Plus />} onClick={openAdd} aria-label="Tambah rundown">
            Tambah
          </Button>
          <Button variant="outline" size="sm" icon={<Download />} onClick={exportPDF} aria-label="Export PDF">
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
      ) : viewMode === 'table' ? (
        <Card padding="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-dark-500 w-8">#</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Waktu Mulai</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Waktu Selesai</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Durasi</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Agenda</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Detail Kegiatan</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Kebutuhan Teknis</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Catatan MC</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-dark-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-dark-900">{item.start_time || '-'}</td>
                    <td className="px-4 py-3 text-dark-700">{item.end_time || '-'}</td>
                    <td className="px-4 py-3 text-dark-700">{item.duration || '-'}</td>
                    <td className="px-4 py-3 text-dark-900">{item.agenda}</td>
                    <td className="px-4 py-3 text-dark-600 max-w-[200px] truncate">{item.activity_detail || '-'}</td>
                    <td className="px-4 py-3 text-dark-600">{item.technical_needs || '-'}</td>
                    <td className="px-4 py-3 text-dark-600 max-w-[150px] truncate">{item.mc_notes || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveItem(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-dark-600 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Pindah ke atas"
                          aria-label="Pindah ke atas"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveItem(idx, 'down')}
                          disabled={idx === items.length - 1}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-dark-600 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Pindah ke bawah"
                          aria-label="Pindah ke bawah"
                        >
                          ↓
                        </button>
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-dark-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit" aria-label="Edit rundown">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg text-dark-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus" aria-label="Hapus rundown">
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
      ) : (
        /* List view with move buttons */
        <div className="space-y-2">
          {items.map((item, idx) => (
            <Card key={item.id} padding="p-3" className="flex items-center gap-3">
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveItem(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 rounded text-dark-300 hover:text-dark-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Pindah ke atas"
                  aria-label="Pindah ke atas"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveItem(idx, 'down')}
                  disabled={idx === items.length - 1}
                  className="p-1 rounded text-dark-300 hover:text-dark-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Pindah ke bawah"
                  aria-label="Pindah ke bawah"
                >
                  ↓
                </button>
              </div>
              <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 text-xs font-bold shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="flex items-center gap-1 text-xs text-dark-500">
                    <span>{item.start_time || '-'} - {item.end_time || '-'}</span>
                    {item.duration && <span className="text-dark-300">({item.duration})</span>}
                  </div>
                </div>
                <p className="font-medium text-dark-900 truncate">{item.agenda}</p>
                {item.activity_detail && (
                  <p className="text-xs text-dark-400 truncate mt-0.5">{item.activity_detail}</p>
                )}
                {item.technical_needs && (
                  <p className="text-xs text-dark-400 mt-0.5">🔧 {item.technical_needs}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-dark-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit" aria-label="Edit rundown">
                  <Edit size={16} />
                </button>
                <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg text-dark-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus" aria-label="Hapus rundown">
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
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
            <FormInput label="Waktu Mulai" name="start_time" type="time" value={form.start_time} onChange={handleChange} />
            <FormInput label="Waktu Selesai" name="end_time" type="time" value={form.end_time} onChange={handleChange} />
          </div>
          <FormInput label="Durasi" name="duration" value={form.duration} onChange={handleChange} placeholder="Contoh: 30 menit, 1 jam" />
          <FormInput label="Agenda" name="agenda" value={form.agenda} onChange={handleChange} required placeholder="Nama agenda" />
          <FormTextarea label="Detail Kegiatan" name="activity_detail" value={form.activity_detail} onChange={handleChange} placeholder="Deskripsi detail kegiatan" rows={3} />
          <FormInput label="PIC ID" name="pic_id" type="number" value={form.pic_id} onChange={handleChange} placeholder="ID penanggung jawab" />
          <FormInput label="Kebutuhan Teknis" name="technical_needs" value={form.technical_needs} onChange={handleChange} placeholder="Sound, lighting, dll" />
          <FormTextarea label="Catatan MC" name="mc_notes" value={form.mc_notes} onChange={handleChange} placeholder="Catatan untuk MC" rows={2} />
          <FormTextarea label="Output yang Diharapkan" name="expected_output" value={form.expected_output} onChange={handleChange} placeholder="Hasil yang diharapkan dari agenda ini" rows={2} />
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
