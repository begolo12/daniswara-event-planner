import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Users, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import SearchInput from '../../components/ui/SearchInput';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import FormInput from '../../components/ui/FormInput';
import FormSelect from '../../components/ui/FormSelect';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
  { value: 'pic', label: 'PIC' },
  { value: 'viewer', label: 'Viewer' },
];

const ROLE_COLORS = {
  admin: 'red', manager: 'purple', staff: 'blue', pic: 'green', viewer: 'gray',
};

const EMPTY_FORM = {
  name: '', email: '', password: '', role: '', division: '', isActive: true,
};

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data?.data || []);
    } catch {
      toast.error('Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() => {
    let result = users;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((u) => u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s));
    }
    if (roleFilter) result = result.filter((u) => u.role === roleFilter);
    return result;
  }, [users, search, roleFilter]);

  const openAdd = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name || '', email: user.email || '', password: '',
      role: user.role || '', division: user.division || '', isActive: user.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Nama dan email wajib diisi');
      return;
    }
    if (!editingUser && !form.password) {
      toast.error('Password wajib diisi untuk user baru');
      return;
    }
    setSaving(true);
    const payload = { ...form };
    if (editingUser && !payload.password) delete payload.password;
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
        toast.success('Berhasil diperbarui');
      } else {
        await api.post('/users', payload);
        toast.success('Berhasil ditambahkan');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      await api.delete(`/users/${deleteUser.id}`);
      toast.success('Berhasil dihapus');
      setDeleteUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus');
    }
  };

  const toggleActive = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status');
    }
  };

  const columns = [
    { key: 'no', label: 'No', render: (_, __, idx) => idx + 1 },
    { key: 'name', label: 'Nama' },
    { key: 'email', label: 'Email' },
    {
      key: 'role', label: 'Role',
      render: (v) => <Badge color={ROLE_COLORS[v] || 'gray'}>{v}</Badge>,
    },
    { key: 'division', label: 'Divisi', render: (v) => v || '-' },
    {
      key: 'isActive', label: 'Status',
      render: (v, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); toggleActive(row); }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            v !== false ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            v !== false ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      ),
    },
    {
      key: 'actions', label: 'Aksi',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(row); }}
            className="p-1.5 rounded-lg text-dark-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
            <Pencil size={15} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteUser(row); }}
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
        <h1 className="text-2xl font-bold text-dark-900">Manajemen User</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari user..." className="w-56" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Semua Role</option>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <Button icon={<Plus size={16} />} onClick={openAdd}>Tambah User</Button>
        </div>
      </div>

      <Table columns={columns} data={filtered} loading={loading} emptyMessage="Belum ada user" emptyIcon={<Users size={48} strokeWidth={1.5} />} />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit User' : 'Tambah User'}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>Batal</Button>
            <Button onClick={handleSave} loading={saving}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput label="Nama" name="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required placeholder="Nama lengkap" />
          <FormInput label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required placeholder="email@domain.com" />
          <FormInput
            label={editingUser ? 'Password (kosongkan jika tidak diubah)' : 'Password'}
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required={!editingUser}
            placeholder="Minimal 6 karakter"
          />
          <FormSelect label="Role" name="role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} options={ROLES} required />
          <FormInput label="Divisi" name="division" value={form.division} onChange={(e) => setForm((f) => ({ ...f, division: e.target.value }))} placeholder="Divisi / Departemen" />

          {/* isActive toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-dark-700">Aktif</label>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.isActive ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                form.isActive ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteUser} onClose={() => setDeleteUser(null)} onConfirm={handleDelete} title="Hapus User" message={`Yakin ingin menghapus user "${deleteUser?.name}"?`} />
    </div>
  );
}
