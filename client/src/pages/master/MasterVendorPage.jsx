import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Truck } from 'lucide-react';
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

const CATEGORIES = [
  'Catering', 'Dekorasi', 'Fotografi', 'Videografi',
  'Sound System', 'Lighting', 'Transportasi', 'Lainnya',
];

const CATEGORY_COLORS = {
  Catering: 'green',
  Dekorasi: 'purple',
  Fotografi: 'blue',
  Videografi: 'blue',
  'Sound System': 'orange',
  Lighting: 'yellow',
  Transportasi: 'gray',
  Lainnya: 'gray',
};

const EMPTY_FORM = {
  name: '', category: '', contactName: '',
  contactEmail: '', contactPhone: '', address: '', notes: '',
};

export default function MasterVendorPage() {
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
      const res = await masterService.vendors.list();
      setItems(res.data?.data || []);
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
      result = result.filter((v) => v.name?.toLowerCase().includes(s) || v.contactName?.toLowerCase().includes(s));
    }
    if (categoryFilter) {
      result = result.filter((v) => v.category === categoryFilter);
    }
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
      contactName: item.contactName || '', contactEmail: item.contactEmail || '',
      contactPhone: item.contactPhone || '', address: item.address || '',
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Nama wajib diisi'); return; }
    setSaving(true);
    try {
      if (editingItem) {
        await masterService.vendors.update(editingItem.id, form);
        toast.success('Berhasil diperbarui');
      } else {
        await masterService.vendors.create(form);
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
      await masterService.vendors.delete(deleteItem.id);
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
    { key: 'contactName', label: 'Kontak', render: (v) => v || '-' },
    { key: 'contactEmail', label: 'Email', render: (v) => v || '-' },
    { key: 'contactPhone', label: 'Telepon', render: (v) => v || '-' },
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
        <h1 className="text-2xl font-bold text-dark-900">Vendor</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari vendor..." className="w-56" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Semua Kategori</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button icon={<Plus size={16} />} onClick={openAdd}>Tambah Vendor</Button>
        </div>
      </div>

      <Table columns={columns} data={filtered} loading={loading} emptyMessage="Belum ada vendor" emptyIcon={<Truck size={48} strokeWidth={1.5} />} />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Edit Vendor' : 'Tambah Vendor'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>Batal</Button>
            <Button onClick={handleSave} loading={saving}>Simpan</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Nama" name="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required placeholder="Nama vendor" />
          <FormSelect label="Kategori" name="category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
          <FormInput label="Nama Kontak" name="contactName" value={form.contactName} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))} placeholder="Nama person in charge" />
          <FormInput label="Email" name="contactEmail" type="email" value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} placeholder="email@vendor.com" />
          <FormInput label="Telepon" name="contactPhone" value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} placeholder="08xxx" />
          <FormInput label="Alamat" name="address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Alamat vendor" className="sm:col-span-2" />
          <FormTextarea label="Catatan" name="notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Catatan tambahan..." rows={3} className="sm:col-span-2" />
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Hapus Vendor" message={`Yakin ingin menghapus vendor "${deleteItem?.name}"?`} />
    </div>
  );
}
