import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { budgets } from '../../services/eventSubService';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import FormInput from '../../components/ui/FormInput';
import FormTextarea from '../../components/ui/FormTextarea';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const initialItem = {
  category: '',
  item: '',
  plannedCost: '',
  description: '',
  notes: '',
};

export default function EventBudgetPage() {
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
      const res = await budgets.list(eventId);
      setItems(res.data.data || []);
    } catch {
      toast.error('Gagal memuat data anggaran');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const summary = useMemo(() => {
    const totalPlanned = items.reduce((sum, i) => sum + (Number(i.plannedCost) || 0), 0);
    const totalActual = items.reduce((sum, i) => sum + (Number(i.actualCost) || 0), 0);
    return {
      totalPlanned,
      totalActual,
      remaining: totalPlanned - totalActual,
      percentUsed: totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0,
    };
  }, [items]);

  const categoryData = useMemo(() => {
    const map = {};
    items.forEach((i) => {
      const cat = i.category || 'Lainnya';
      if (!map[cat]) map[cat] = { planned: 0, actual: 0 };
      map[cat].planned += Number(i.plannedCost) || 0;
      map[cat].actual += Number(i.actualCost) || 0;
    });
    return Object.entries(map).map(([name, data]) => ({ name, ...data }));
  }, [items]);

  const openAdd = () => {
    setEditingItem(null);
    setForm(initialItem);
    setShowAddModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      category: item.category || '',
      item: item.item || '',
      plannedCost: item.plannedCost || '',
      description: item.description || '',
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
    if (!form.item.trim()) {
      toast.error('Nama item wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, plannedCost: Number(form.plannedCost) || 0 };
      if (editingItem) {
        await budgets.update(eventId, editingItem.id || editingItem._id, payload);
        toast.success('Anggaran berhasil diperbarui');
      } else {
        await budgets.create(eventId, payload);
        toast.success('Anggaran berhasil ditambahkan');
      }
      setShowAddModal(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan anggaran');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActualCostUpdate = async (item, actualCost) => {
    try {
      await budgets.updateActual(eventId, item.id || item._id, Number(actualCost));
      fetchItems();
    } catch {
      toast.error('Gagal update biaya aktual');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await budgets.delete(eventId, deleteTarget.id || deleteTarget._id);
      toast.success('Anggaran berhasil dihapus');
      setDeleteTarget(null);
      fetchItems();
    } catch {
      toast.error('Gagal menghapus anggaran');
    }
  };

  const exportPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Laporan Anggaran Event', 14, 22);
      doc.setFontSize(10);
      doc.text(`Total Rencana: ${formatCurrency(summary.totalPlanned)}`, 14, 32);
      doc.text(`Total Aktual: ${formatCurrency(summary.totalActual)}`, 14, 38);
      doc.text(`Sisa: ${formatCurrency(summary.remaining)}`, 14, 44);
      autoTable(doc, {
        startY: 52,
        head: [['Kategori', 'Item', 'Rencana', 'Aktual', 'Keterangan']],
        body: items.map((i) => [
          i.category || '-',
          i.item,
          formatCurrency(i.plannedCost),
          formatCurrency(i.actualCost || 0),
          i.description || '-',
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [239, 68, 68] },
      });
      doc.save('anggaran-event.pdf');
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
        <h2 className="text-xl font-semibold text-dark-900">Anggaran Event</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<Download />} onClick={exportPDF}>
            Export PDF
          </Button>
          <Button variant="primary" size="sm" icon={<Plus />} onClick={openAdd}>
            Tambah Item
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs text-dark-400">Total Rencana</p>
          <p className="text-lg font-bold text-dark-900">{formatCurrency(summary.totalPlanned)}</p>
        </Card>
        <Card>
          <p className="text-xs text-dark-400">Total Aktual</p>
          <p className="text-lg font-bold text-dark-900">{formatCurrency(summary.totalActual)}</p>
        </Card>
        <Card>
          <p className="text-xs text-dark-400">Sisa Anggaran</p>
          <p className={`text-lg font-bold ${summary.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(summary.remaining)}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-dark-400">Terpakai</p>
          <div className="flex items-end gap-2">
            <p className="text-lg font-bold text-dark-900">{summary.percentUsed}%</p>
            <div className="flex-1 bg-gray-200 rounded-full h-2 mb-1.5">
              <div
                className={`h-2 rounded-full transition-all ${summary.percentUsed > 100 ? 'bg-red-500' : 'bg-brand-600'}`}
                style={{ width: `${Math.min(summary.percentUsed, 100)}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Category Chart (text-based) */}
      {categoryData.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-dark-700 mb-3">Per Kategori</h3>
          <div className="space-y-2">
            {categoryData.map((cat) => {
              const pct = summary.totalPlanned > 0 ? Math.round((cat.planned / summary.totalPlanned) * 100) : 0;
              return (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="text-sm text-dark-700 w-32 truncate">{cat.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4">
                    <div className="bg-brand-600 h-4 rounded-full flex items-center justify-end pr-2" style={{ width: `${pct}%` }}>
                      {pct >= 10 && <span className="text-[10px] text-white font-medium">{pct}%</span>}
                    </div>
                  </div>
                  <span className="text-xs text-dark-500 w-24 text-right">{formatCurrency(cat.planned)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Budget Table */}
      {items.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="Belum ada anggaran"
          message="Tambahkan item anggaran untuk event ini."
          action={<Button variant="primary" icon={<Plus />} onClick={openAdd}>Tambah Item</Button>}
        />
      ) : (
        <Card padding="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Kategori</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Item</th>
                  <th className="px-4 py-3 text-right font-medium text-dark-500">Rencana</th>
                  <th className="px-4 py-3 text-right font-medium text-dark-500">Aktual</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Keterangan</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id || item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-dark-700">{item.category || '-'}</td>
                    <td className="px-4 py-3 font-medium text-dark-900">{item.item}</td>
                    <td className="px-4 py-3 text-right text-dark-700">{formatCurrency(item.plannedCost)}</td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        defaultValue={item.actualCost || 0}
                        onBlur={(e) => handleActualCostUpdate(item, e.target.value)}
                        className="w-28 text-right rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-dark-600">{item.description || '-'}</td>
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
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-dark-700">Total</td>
                  <td className="px-4 py-3 text-right text-dark-900">{formatCurrency(summary.totalPlanned)}</td>
                  <td className="px-4 py-3 text-right text-dark-900">{formatCurrency(summary.totalActual)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingItem ? 'Edit Anggaran' : 'Tambah Anggaran'}
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
          <FormInput label="Kategori" name="category" value={form.category} onChange={handleChange} placeholder="Contoh: Catering, Dekorasi" />
          <FormInput label="Item" name="item" value={form.item} onChange={handleChange} required placeholder="Nama item anggaran" />
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">Biaya Rencana (Rp)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400 text-sm">Rp</span>
              <input
                name="plannedCost"
                type="number"
                value={form.plannedCost}
                onChange={handleChange}
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>
          <FormInput label="Keterangan" name="description" value={form.description} onChange={handleChange} placeholder="Deskripsi item" />
          <FormTextarea label="Catatan" name="notes" value={form.notes} onChange={handleChange} placeholder="Catatan tambahan" rows={2} />
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Anggaran"
        message={`Hapus item "${deleteTarget?.item}" dari anggaran?`}
        confirmText="Hapus"
      />
    </div>
  );
}
