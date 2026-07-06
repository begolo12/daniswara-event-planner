import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import SearchInput from '../../components/ui/SearchInput';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import FormInput from '../../components/ui/FormInput';
import FormTextarea from '../../components/ui/FormTextarea';
import masterService from '../../services/masterService';

export default function MasterEventTypePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await masterService.eventTypes.list();
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
    return items.filter((item) => item.name?.toLowerCase().includes(s));
  }, [items, search]);

  const openAdd = () => {
    setEditingItem(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({ name: item.name || '', description: item.description || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Nama wajib diisi');
      return;
    }
    setSaving(true);
    try {
      if (editingItem) {
        await masterService.eventTypes.update(editingItem.id, form);
        toast.success('Berhasil diperbarui');
      } else {
        await masterService.eventTypes.create(form);
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
      await masterService.eventTypes.delete(deleteItem.id);
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
    { key: 'description', label: 'Deskripsi', render: (v) => v || '-' },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(row); }}
            className="p-1.5 rounded-lg text-dark-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteItem(row); }}
            className="p-1.5 rounded-lg text-dark-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-dark-900">Tipe Event</h1>
        <div className="flex items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari tipe event..." className="w-64" />
          <Button icon={<Plus size={16} />} onClick={openAdd}>Tambah Tipe Event</Button>
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="Belum ada tipe event"
        emptyIcon={<Tag size={48} strokeWidth={1.5} />}
      />

      {!loading && filtered.length === 0 && search && (
        <EmptyState
          title="Tidak ditemukan"
          message={`Tidak ada tipe event yang cocok dengan "${search}"`}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Edit Tipe Event' : 'Tambah Tipe Event'}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>Batal</Button>
            <Button onClick={handleSave} loading={saving}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Nama"
            name="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            placeholder="Masukkan nama tipe event"
          />
          <FormTextarea
            label="Deskripsi"
            name="description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Deskripsi singkat..."
            rows={3}
          />
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Hapus Tipe Event"
        message={`Yakin ingin menghapus "${deleteItem?.name}"?`}
      />
    </div>
  );
}
