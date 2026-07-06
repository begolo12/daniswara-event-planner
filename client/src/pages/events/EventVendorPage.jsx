import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Mail, Phone, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { vendors } from '../../services/eventSubService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import FormInput from '../../components/ui/FormInput';
import FormSelect from '../../components/ui/FormSelect';
import FormTextarea from '../../components/ui/FormTextarea';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency } from '../../utils/formatters';

const initialVendor = {
  name: '',
  category: '',
  contactEmail: '',
  contactPhone: '',
  contactPerson: '',
  cost: '',
  status: 'pending',
  notes: '',
};

const vendorStatusOptions = [
  { value: 'pending', label: 'Menunggu' },
  { value: 'confirmed', label: 'Dikonfirmasi' },
  { value: 'completed', label: 'Selesai' },
];

export default function EventVendorPage() {
  const { id: eventId } = useParams();
  const [vendorList, setVendorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [form, setForm] = useState(initialVendor);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchVendors = useCallback(async () => {
    try {
      const res = await vendors.list(eventId);
      setVendorList(res.data.data || []);
    } catch {
      toast.error('Gagal memuat data vendor');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const openAdd = () => {
    setEditingVendor(null);
    setForm(initialVendor);
    setShowAddModal(true);
  };

  const openEdit = (v) => {
    setEditingVendor(v);
    setForm({
      name: v.name || '',
      category: v.category || '',
      contactEmail: v.contactEmail || v.contact?.email || '',
      contactPhone: v.contactPhone || v.contact?.phone || '',
      contactPerson: v.contactPerson || v.contact?.person || '',
      cost: v.cost || '',
      status: v.status || 'pending',
      notes: v.notes || '',
    });
    setShowAddModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Nama vendor wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        contact: {
          email: form.contactEmail,
          phone: form.contactPhone,
          person: form.contactPerson,
        },
        cost: Number(form.cost) || 0,
        status: form.status,
        notes: form.notes,
      };
      if (editingVendor) {
        await vendors.update(eventId, editingVendor.id || editingVendor._id, payload);
        toast.success('Vendor berhasil diperbarui');
      } else {
        await vendors.create(eventId, payload);
        toast.success('Vendor berhasil ditambahkan');
      }
      setShowAddModal(false);
      fetchVendors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan vendor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await vendors.delete(eventId, deleteTarget.id || deleteTarget._id);
      toast.success('Vendor berhasil dihapus');
      setDeleteTarget(null);
      fetchVendors();
    } catch {
      toast.error('Gagal menghapus vendor');
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
        <h2 className="text-xl font-semibold text-dark-900">Vendor Event</h2>
        <Button variant="primary" size="sm" icon={<Plus />} onClick={openAdd}>
          Tambah Vendor
        </Button>
      </div>

      {/* Content */}
      {vendorList.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="Belum ada vendor"
          message="Tambahkan vendor untuk event ini."
          action={<Button variant="primary" icon={<Plus />} onClick={openAdd}>Tambah Vendor</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendorList.map((v) => (
            <Card key={v.id || v._id} hover>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-dark-900 truncate">{v.name}</h3>
                  {v.category && (
                    <span className="text-xs bg-gray-100 text-dark-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                      {v.category}
                    </span>
                  )}
                </div>
                <StatusBadge status={v.status} />
              </div>

              <div className="space-y-1.5 mb-4">
                {v.contact?.email && (
                  <div className="flex items-center gap-2 text-sm text-dark-600">
                    <Mail size={14} className="text-dark-400 shrink-0" />
                    <span className="truncate">{v.contact.email}</span>
                  </div>
                )}
                {v.contact?.phone && (
                  <div className="flex items-center gap-2 text-sm text-dark-600">
                    <Phone size={14} className="text-dark-400 shrink-0" />
                    <span>{v.contact.phone}</span>
                  </div>
                )}
                {v.contact?.person && (
                  <div className="flex items-center gap-2 text-sm text-dark-600">
                    <User size={14} className="text-dark-400 shrink-0" />
                    <span>{v.contact.person}</span>
                  </div>
                )}
              </div>

              {v.cost > 0 && (
                <p className="text-sm font-medium text-dark-900 mb-3">{formatCurrency(v.cost)}</p>
              )}

              <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-100">
                <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg text-dark-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  <Edit size={16} />
                </button>
                <button onClick={() => setDeleteTarget(v)} className="p-1.5 rounded-lg text-dark-400 hover:text-red-600 hover:bg-red-50 transition-colors">
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
        title={editingVendor ? 'Edit Vendor' : 'Tambah Vendor'}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={submitting}>Batal</Button>
            <Button variant="primary" loading={submitting} onClick={handleSubmit}>
              {editingVendor ? 'Simpan' : 'Tambah'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Nama Vendor" name="name" value={form.name} onChange={handleChange} required placeholder="Nama vendor" />
          <FormInput label="Kategori" name="category" value={form.category} onChange={handleChange} placeholder="Catering, Sound, dll" />
          <FormInput label="Email" name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} placeholder="Email vendor" icon={Mail} />
          <FormInput label="Telepon" name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="Nomor telepon" icon={Phone} />
          <FormInput label="PIC Vendor" name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="Nama kontak" icon={User} />
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">Biaya (Rp)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400 text-sm">Rp</span>
              <input
                name="cost"
                type="number"
                value={form.cost}
                onChange={handleChange}
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>
          <FormSelect label="Status" name="status" value={form.status} onChange={handleChange} options={vendorStatusOptions} />
          <FormTextarea label="Catatan" name="notes" value={form.notes} onChange={handleChange} placeholder="Catatan tentang vendor" rows={2} />
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Vendor"
        message={`Hapus vendor "${deleteTarget?.name}" dari event?`}
        confirmText="Hapus"
      />
    </div>
  );
}
