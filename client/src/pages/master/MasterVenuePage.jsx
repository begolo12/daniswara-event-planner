import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
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

const STATUS_OPTIONS = [
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Tidak Aktif' },
];

const STATUS_COLORS = { active: 'green', inactive: 'gray' };
const STATUS_LABELS = { active: 'Aktif', inactive: 'Tidak Aktif' };

const EMPTY_FORM = {
  name: '', address: '', capacity: '', contactPerson: '',
  contactPhone: '', email: '', facilities: '', notes: '', status: 'active',
};

export default function MasterVenuePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await masterService.venues.list();
      setItems(res.data?.data || []);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const filtered = useMemo(() => {
    if (!search) return items;
    const s = search.toLowerCase();
    return items.filter((v) => v.name?.toLowerCase().includes(s) || v.address?.toLowerCase().includes(s));
  }, [items, search]);

  const openAdd = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    const facs = Array.isArray(item.facilities) ? item.facilities.join(', ') : item.facilities || '';
    setForm({
      name: item.name || '', address: item.address || '',
      capacity: item.capacity || '', contactPerson: item.contactPerson || '',
      contactPhone: item.contactPhone || '', email: item.email || '',
      facilities: facs, notes: item.notes || '', status: item.status || 'active',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Nama wajib diisi'); return; }
    setSaving(true);
    const payload = {
      ...form,
      capacity: form.capacity ? Number(form.capacity) : null,
      facilities: form.facilities ? form.facilities.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };
    try {
      if (editingItem) {
        await masterService.venues.update(editingItem.id, payload);
        toast.success('Berhasil diperbarui');
      } else {
        await masterService.venues.create(payload);
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
      await masterService.venues.delete(deleteItem.id);
      toast.success('Berhasil dihapus');
      setDeleteItem(null);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus');
    }
  };

  const renderFacilities = (facs) => {
    const list = Array.isArray(facs) ? facs : facs ? facs.split(',').map((s) => s.trim()) : [];
    if (!list.length) return <span className="text-dark-400">-</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {list.slice(0, 3).map((f, i) => (
          <Badge key={i} color="blue" size="sm">{f}</Badge>
        ))}
        {list.length > 3 && <Badge color="gray" size="sm">+{list.length - 3}</Badge>}
      </div>
    );
  };

  const columns = [
    { key: 'no', label: 'No', render: (_, __, idx) => idx + 1 },
    { key: 'name', label: 'Nama' },
    { key: 'address', label: 'Alamat', render: (v) => v || '-' },
    { key: 'capacity', label: 'Kapasitas', render: (v) => v ? `${v} orang` : '-' },
    { key: 'contactPerson', label: 'Kontak', render: (v) => v || '-' },
    { key: 'facilities', label: 'Fasilitas', render: (v) => renderFacilities(v) },
    {
      key: 'status', label: 'Status',
      render: (v) => <Badge color={STATUS_COLORS[v] || 'gray'}>{STATUS_LABELS[v] || v}</Badge>,
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
        <h1 className="text-2xl font-bold text-dark-900">Lokasi</h1>
        <div className="flex items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari lokasi..." className="w-64" />
          <Button icon={<Plus size={16} />} onClick={openAdd}>Tambah Lokasi</Button>
        </div>
      </div>

      <Table columns={columns} data={filtered} loading={loading} emptyMessage="Belum ada lokasi" emptyIcon={<MapPin size={48} strokeWidth={1.5} />} />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Edit Lokasi' : 'Tambah Lokasi'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>Batal</Button>
            <Button onClick={handleSave} loading={saving}>Simpan</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Nama Lokasi" name="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required placeholder="Nama tempat" />
          <FormInput label="Kapasitas" name="capacity" type="number" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} placeholder="Jumlah orang" />
          <FormInput label="Alamat" name="address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Alamat lengkap" className="sm:col-span-2" />
          <FormInput label="Kontak Person" name="contactPerson" value={form.contactPerson} onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))} placeholder="Nama PIC" />
          <FormInput label="Telepon" name="contactPhone" value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} placeholder="08xxx" />
          <FormInput label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@tempat.com" />
          <FormSelect label="Status" name="status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} options={STATUS_OPTIONS} />
          <FormTextarea label="Fasilitas" name="facilities" value={form.facilities} onChange={(e) => setForm((f) => ({ ...f, facilities: e.target.value }))} placeholder="Parkir, Toilet, AC (pisahkan koma)" rows={2} className="sm:col-span-2" />
          <FormTextarea label="Catatan" name="notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Catatan tambahan..." rows={3} className="sm:col-span-2" />
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Hapus Lokasi" message={`Yakin ingin menghapus lokasi "${deleteItem?.name}"?`} />
    </div>
  );
}
