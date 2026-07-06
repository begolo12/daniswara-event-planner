import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import SearchInput from '../../components/ui/SearchInput';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import FormInput from '../../components/ui/FormInput';
import FormSelect from '../../components/ui/FormSelect';
import FormTextarea from '../../components/ui/FormTextarea';
import masterService from '../../services/masterService';
import { formatCurrency } from '../../utils/formatters';

const CATEGORIES = ['Sound System', 'Lighting', 'Furniture', 'IT & Multimedia', 'Decoration', 'Transportation', 'Lainnya'];

const CATEGORY_COLORS = {
  'Sound System': 'orange',
  Lighting: 'yellow',
  Furniture: 'blue',
  'IT & Multimedia': 'purple',
  Decoration: 'green',
  Transportation: 'gray',
  Lainnya: 'gray',
};

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Tersedia' },
  { value: 'limited', label: 'Terbatas' },
  { value: 'unavailable', label: 'Tidak Tersedia' },
];

const AVAIL_COLORS = { available: 'green', limited: 'yellow', unavailable: 'red' };
const AVAIL_LABELS = { available: 'Tersedia', limited: 'Terbatas', unavailable: 'Tidak Tersedia' };

const EMPTY_FORM = {
  name: '', category: '', description: '', quantity: '',
  unitCost: '', availability: 'available', notes: '',
};

export default function MasterEquipmentPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await masterService.equipments.list();
      const raw = res.data?.data || [];
      setItems(Array.isArray(raw) ? raw.map((e) => ({
        ...e,
        unitCost: e.unit_cost || e.unitCost || '',
      })) : []);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const filtered = useMemo(() => {
    let result = items;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((e) => e.name?.toLowerCase().includes(s));
    }
    if (categoryFilter) result = result.filter((e) => e.category === categoryFilter);
    return result;
  }, [items, search, categoryFilter]);

  const openAdd = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name || '', category: item.category || '',
      description: item.description || '', quantity: item.quantity || '',
      unitCost: item.unit_cost || item.unitCost || '', availability: item.availability || 'available',
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Nama wajib diisi'); return; }
    setSaving(true);
    const payload = {
      ...form,
      quantity: form.quantity ? Number(form.quantity) : null,
      unitCost: form.unitCost ? Number(form.unitCost) : null,
    };
    try {
      if (editingItem) {
        await masterService.equipments.update(editingItem.id, payload);
        toast.success('Berhasil diperbarui');
      } else {
        await masterService.equipments.create(payload);
        toast.success('Berhasil ditambahkan');
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await masterService.equipments.delete(deleteItem.id);
      toast.success('Berhasil dihapus');
      setDeleteItem(null);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus');
    }
  };

  const columns = [
    { key: 'no', label: 'No', render: (_, __, idx) => idx + 1 },
    { key: 'name', label: 'Nama' },
    {
      key: 'category', label: 'Kategori',
      render: (v) => <Badge color={CATEGORY_COLORS[v] || 'gray'}>{v || '-'}</Badge>,
    },
    { key: 'description', label: 'Deskripsi', render: (v) => v || '-' },
    { key: 'quantity', label: 'Stok', render: (v) => v != null ? v : '-' },
    { key: 'unitCost', label: 'Harga/Sewa', render: (v) => v != null ? formatCurrency(v) : '-' },
    {
      key: 'availability', label: 'Ketersediaan',
      render: (v) => <Badge color={AVAIL_COLORS[v] || 'gray'}>{AVAIL_LABELS[v] || v}</Badge>,
    },
    {
      key: 'actions', label: 'Aksi',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(row); }}
            className="p-1.5 rounded-lg text-dark-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
            <Pencil size={15} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteItem(row); }}
            className="p-1.5 rounded-lg text-dark-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-dark-900">Peralatan</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari peralatan..." className="w-56" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Semua Kategori</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button icon={<Plus size={16} />} onClick={openAdd}>Tambah Peralatan</Button>
        </div>
      </div>

      <Table columns={columns} data={filtered} loading={loading} emptyMessage="Belum ada peralatan" emptyIcon={<Wrench size={48} strokeWidth={1.5} />} />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Edit Peralatan' : 'Tambah Peralatan'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>Batal</Button>
            <Button onClick={handleSave} loading={saving}>Simpan</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Nama" name="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required placeholder="Nama peralatan" />
          <FormSelect label="Kategori" name="category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
          <FormTextarea label="Deskripsi" name="description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Deskripsi peralatan" rows={2} className="sm:col-span-2" />
          <FormInput label="Jumlah/Stok" name="quantity" type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} placeholder="0" />
          <FormInput label="Harga/Sewa (Rp)" name="unitCost" type="number" value={form.unitCost} onChange={(e) => setForm((f) => ({ ...f, unitCost: e.target.value }))} placeholder="0" />
          <FormSelect label="Ketersediaan" name="availability" value={form.availability} onChange={(e) => setForm((f) => ({ ...f, availability: e.target.value }))} options={AVAILABILITY_OPTIONS} />
          <FormTextarea label="Catatan" name="notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Catatan tambahan..." rows={3} className="sm:col-span-2" />
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Hapus Peralatan" message={`Yakin ingin menghapus "${deleteItem?.name}"?`} />
    </div>
  );
}
