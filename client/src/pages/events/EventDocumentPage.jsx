import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Download,
  FileText,
  Sparkles,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { documents } from '../../services/eventSubService';
import aiService from '../../services/aiService';
import { DOC_TYPES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
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

const initialDoc = {
  title: '',
  type: '',
  content: '',
  status: 'draft',
};

const docTypeOptions = Object.entries(DOC_TYPES).map(([k, v]) => ({ value: k, label: v }));
const docStatusOptions = [
  { value: 'draft', label: 'Draf' },
  { value: 'final', label: 'Final' },
];

export default function EventDocumentPage() {
  const { id: eventId } = useParams();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreview, setShowPreview] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);
  const [form, setForm] = useState(initialDoc);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchDocs = useCallback(async () => {
    try {
      const res = await documents.list(eventId);
      setDocs(res.data.data || []);
    } catch {
      toast.error('Gagal memuat dokumen');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const openAdd = () => {
    setEditingDoc(null);
    setForm(initialDoc);
    setShowAddModal(true);
  };

  const openEdit = (doc) => {
    setEditingDoc(doc);
    setForm({
      title: doc.title || '',
      type: doc.type || '',
      content: doc.content || '',
      status: doc.status || 'draft',
    });
    setShowAddModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Judul dokumen wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      if (editingDoc) {
        await documents.update(eventId, editingDoc.id || editingDoc._id, form);
        toast.success('Dokumen berhasil diperbarui');
      } else {
        await documents.create(eventId, form);
        toast.success('Dokumen berhasil ditambahkan');
      }
      setShowAddModal(false);
      fetchDocs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan dokumen');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await documents.delete(eventId, deleteTarget.id || deleteTarget._id);
      toast.success('Dokumen berhasil dihapus');
      setDeleteTarget(null);
      fetchDocs();
    } catch {
      toast.error('Gagal menghapus dokumen');
    }
  };

  const handleGenerateAI = async () => {
    setGenerating(true);
    try {
      const res = await aiService.generate(eventId, 'documents', {});
      const generated = res.data.data;
      await documents.create(eventId, {
        title: generated.title || 'Dokumen dari AI',
        type: generated.type || 'other',
        content: generated.content || JSON.stringify(generated),
        status: 'draft',
      });
      toast.success('Dokumen berhasil digenerate dengan AI');
      fetchDocs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal generate dokumen');
    } finally {
      setGenerating(false);
    }
  };

  const exportPDF = async (doc) => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const docPdf = new jsPDF();
      docPdf.setFontSize(16);
      docPdf.text(doc.title, 14, 22);
      docPdf.setFontSize(8);
      docPdf.text(`Tipe: ${DOC_TYPES[doc.type] || doc.type} | Status: ${doc.status}`, 14, 30);
      docPdf.setFontSize(10);
      const lines = docPdf.splitTextToSize(doc.content || '', 180);
      docPdf.text(lines, 14, 40);
      docPdf.save(`${doc.title}.pdf`);
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
        <h2 className="text-xl font-semibold text-dark-900">Dokumen Event</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Sparkles />}
            onClick={handleGenerateAI}
            loading={generating}
          >
            Generate Dokumen dengan AI
          </Button>
          <Button variant="primary" size="sm" icon={<Plus />} onClick={openAdd}>
            Tambah Dokumen
          </Button>
        </div>
      </div>

      {/* Content */}
      {docs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Belum ada dokumen"
          message="Tambahkan atau generate dokumen untuk event ini."
          action={
            <div className="flex gap-2">
              <Button variant="outline" icon={<Sparkles />} onClick={handleGenerateAI} loading={generating}>
                Generate dengan AI
              </Button>
              <Button variant="primary" icon={<Plus />} onClick={openAdd}>
                Tambah Dokumen
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc) => (
            <Card key={doc.id || doc._id} hover className="flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                    <FileText size={20} className="text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-dark-900 truncate">{doc.title}</h3>
                    <span className="text-xs text-dark-400">{DOC_TYPES[doc.type] || doc.type || '-'}</span>
                  </div>
                </div>
                <StatusBadge status={doc.status} />
              </div>

              {doc.content && (
                <p className="text-sm text-dark-500 line-clamp-3 mb-3 flex-1">
                  {doc.content.substring(0, 200)}
                </p>
              )}

              <p className="text-xs text-dark-400 mb-3">
                Diperbarui: {formatDate(doc.updatedAt || doc.createdAt)}
              </p>

              <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setShowPreview(doc)}
                  className="p-1.5 rounded-lg text-dark-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                  title="Preview"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => exportPDF(doc)}
                  className="p-1.5 rounded-lg text-dark-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Export PDF"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => openEdit(doc)}
                  className="p-1.5 rounded-lg text-dark-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => setDeleteTarget(doc)}
                  className="p-1.5 rounded-lg text-dark-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Hapus"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={!!showPreview}
        onClose={() => setShowPreview(null)}
        title={showPreview?.title || 'Preview'}
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setShowPreview(null)}>Tutup</Button>
        }
      >
        {showPreview && (
          <div className="prose prose-sm max-w-none">
            <div className="flex items-center gap-2 mb-4 text-sm text-dark-400">
              <span>Tipe: {DOC_TYPES[showPreview.type] || showPreview.type}</span>
              <span>|</span>
              <StatusBadge status={showPreview.status} />
            </div>
            <div className="whitespace-pre-wrap text-sm text-dark-700 bg-gray-50 rounded-lg p-4">
              {showPreview.content || 'Tidak ada konten'}
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingDoc ? 'Edit Dokumen' : 'Tambah Dokumen'}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={submitting}>Batal</Button>
            <Button variant="primary" loading={submitting} onClick={handleSubmit}>
              {editingDoc ? 'Simpan' : 'Tambah'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Judul" name="title" value={form.title} onChange={handleChange} required placeholder="Judul dokumen" />
          <FormSelect label="Tipe Dokumen" name="type" value={form.type} onChange={handleChange} options={docTypeOptions} placeholder="Pilih tipe" />
          <FormTextarea label="Konten" name="content" value={form.content} onChange={handleChange} placeholder="Isi dokumen..." rows={10} />
          <FormSelect label="Status" name="status" value={form.status} onChange={handleChange} options={docStatusOptions} />
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Dokumen"
        message={`Hapus dokumen "${deleteTarget?.title}"?`}
        confirmText="Hapus"
      />
    </div>
  );
}
