import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { budgets } from '../../services/eventSubService';
import { formatCurrency } from '../../utils/formatters';
import { PRIORITIES } from '../../utils/constants';
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
  item: '',
  quantity: 1,
  unit_price: '',
  total_price: '',
  priority: 'medium',
  saving_alternative: '',
  notes: '',
};

const priorityOptions = [
  { value: 'low', label: 'Rendah' },
  { value: 'medium', label: 'Sedang' },
  { value: 'high', label: 'Tinggi' },
  { value: 'critical', label: 'Kritis' },
];

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
    const totalPlanned = items.reduce((sum, i) => sum + (Number(i.total_price) || 0), 0);
    const totalActual = items.reduce((sum, i) => sum + (Number(i.actual_cost) || 0), 0);
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
      map[cat].planned += Number(i.total_price) || 0;
      map[cat].actual += Number(i.actual_cost) || 0;
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
      quantity: item.quantity || 1,
      unit_price: item.unit_price || '',
      total_price: item.total_price || '',
      priority: item.priority || 'medium',
      saving_alternative: item.saving_alternative || '',
      notes: item.notes || '',
    });
    setShowAddModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-calculate total_price from quantity * unit_price
      if (name === 'quantity' || name === 'unit_price') {
        const qty = Number(name === 'quantity' ? value : updated.quantity) || 0;
        const unitPrice = Number(name === 'unit_price' ? value : updated.unit_price) || 0;
        updated.total_price = qty * unitPrice;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.item.trim()) {
      toast.error('Nama item wajib diisi');
      return;
    }
    if (!form.category.trim()) {
      toast.error('Kategori wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        category: form.category,
        item: form.item,
        quantity: Number(form.quantity) || 1,
        unit_price: Number(form.unit_price) || 0,
        total_price: Number(form.total_price) || 0,
        priority: form.priority,
        saving_alternative: form.saving_alternative,
        notes: form.notes,
      };
      if (editingItem) {
        await budgets.update(eventId, editingItem.id, payload);
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await budgets.delete(eventId, deleteTarget.id);
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
        head: [['Kategori', 'Item', 'Qty', 'Harga Satuan', 'Total', 'Prioritas', 'Aktual']],
        body: items.map((i) => [
          i.category || '-',
          i.item,
          i.quantity || 1,
          formatCurrency(i.unit_price),
          formatCurrency(i.total_price),
          PRIORITIES[i.priority]?.label || i.priority || '-',
          formatCurrency(i.actual_cost || 0),
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

      {/* Category Chart */}
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
                  <th className="px-4 py-3 text-center font-medium text-dark-500">Qty</th>
                  <th className="px-4 py-3 text-right font-medium text-dark-500">Harga Satuan</th>
                  <th className="px-4 py-3 text-right font-medium text-dark-500">Total</th>
                  <th className="px-4 py-3 text-right font-medium text-dark-500">Aktual</th>
                  <th className="px-4 py-3 text-center font-medium text-dark-500">Prioritas</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-dark-700">{item.category || '-'}</td>
                    <td className="px-4 py-3 font-medium text-dark-900">{item.item}</td>
                    <td className="px-4 py-3 text-center text-dark-700">{item.quantity || 1}</td>
                    <td className="px-4 py-3 text-right text-dark-700">{formatCurrency(item.unit_price)}</td>
                    <td className="px-4 py-3 text-right font-medium text-dark-900">{formatCurrency(item.total_price)}</td>
                    <td className="px-4 py-3 text-right text-dark-700">{formatCurrency(item.actual_cost || 0)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        item.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {PRIORITIES[item.priority]?.label || item.priority}
                      </span>
                    </td>
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
                  <td colSpan={4} className="px-4 py-3 text-dark-700">Total</td>
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
          <FormInput label="Kategori" name="category" value={form.category} onChange={handleChange} required placeholder="Contoh: Catering, Dekorasi" />
          <FormInput label="Item" name="item" value={form.item} onChange={handleChange} required placeholder="Nama item anggaran" />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Jumlah" name="quantity" type="number" value={form.quantity} onChange={handleChange} min="1" />
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Harga Satuan (Rp)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400 text-sm">Rp</span>
                <input
                  name="unit_price"
                  type="number"
                  value={form.unit_price}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">Total Harga (Rp)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400 text-sm">Rp</span>
              <input
                name="total_price"
                type="number"
                value={form.total_price}
                onChange={handleChange}
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>
          <FormSelect label="Prioritas" name="priority" value={form.priority} onChange={handleChange} options={priorityOptions} />
          <FormInput label="Alternatif Penghematan" name="saving_alternative" value={form.saving_alternative} onChange={handleChange} placeholder="Cara menghemat biaya ini" />
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
