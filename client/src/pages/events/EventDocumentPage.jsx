import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Download,
  FileText,
  Sparkles,
  Eye,
  Upload,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { documents } from '../../services/eventSubService';
import aiService from '../../services/aiService';
import api from '../../services/api';
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
  doc_type: '',
  content: '',
  status: 'draft',
};

const docTypeOptions = Object.entries(DOC_TYPES).map(([k, v]) => ({ value: k, label: v }));
const docStatusOptions = [
  { value: 'draft', label: 'Draf' },
  { value: 'submitted', label: 'Diajukan' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.png', '.jpg', '.jpeg'];

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

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
  const [uploadingId, setUploadingId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

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
      doc_type: doc.doc_type || '',
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
    if (!form.doc_type) {
      toast.error('Tipe dokumen wajib dipilih');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        doc_type: form.doc_type,
        content: form.content,
        status: form.status,
      };
      if (editingDoc) {
        await documents.update(eventId, editingDoc.id, payload);
        toast.success('Dokumen berhasil diperbarui');
      } else {
        await documents.create(eventId, payload);
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
      await documents.delete(eventId, deleteTarget.id);
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
        doc_type: generated.doc_type || generated.type || 'memo',
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

  const openUploadModal = (doc) => {
    setShowUploadModal(doc);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file extension
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error('Tipe file tidak didukung');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Ukuran file maksimal ${formatFileSize(MAX_FILE_SIZE)}`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadFile = async () => {
    if (!selectedFile || !showUploadModal) return;
    setUploadingId(showUploadModal.id);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      await api.post(`/events/${eventId}/documents/${showUploadModal.id}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('File berhasil diupload');
      setShowUploadModal(null);
      setSelectedFile(null);
      fetchDocs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal upload file');
    } finally {
      setUploadingId(null);
    }
  };

  const exportPDF = async (doc) => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const docPdf = new jsPDF();
      docPdf.setFontSize(16);
      docPdf.text(doc.title, 14, 22);
      docPdf.setFontSize(8);
      docPdf.text(`Tipe: ${DOC_TYPES[doc.doc_type] || doc.doc_type} | Status: ${doc.status} | v${doc.version || 1}`, 14, 30);
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
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<Sparkles />}
            onClick={handleGenerateAI}
            loading={generating}
            aria-label="Generate dokumen dengan AI"
          >
            Generate AI
          </Button>
          <Button variant="primary" size="sm" icon={<Plus />} onClick={openAdd} aria-label="Tambah dokumen">
            Tambah
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
            <Card key={doc.id} hover className="flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                    <FileText size={20} className="text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-dark-900 truncate">{doc.title}</h3>
                    <span className="text-xs text-dark-400">{DOC_TYPES[doc.doc_type] || doc.doc_type || '-'}</span>
                  </div>
                </div>
                <StatusBadge status={doc.status} />
              </div>

              {doc.content && (
                <p className="text-sm text-dark-500 line-clamp-3 mb-3 flex-1">
                  {doc.content.substring(0, 200)}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-dark-400 mb-3">
                <span>v{doc.version || 1}</span>
                {doc.file_url && (
                  <span className="text-green-600 flex items-center gap-1">
                    <FileText size={10} /> File tersedia
                  </span>
                )}
                <span className="ml-auto">Diperbarui: {formatDate(doc.updated_at || doc.updatedAt || doc.created_at || doc.createdAt)}</span>
              </div>

              <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-100">
                <button
                  onClick={() => openUploadModal(doc)}
                  className="p-1.5 rounded-lg text-dark-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                  title="Upload File"
                  aria-label={`Upload file untuk ${doc.title}`}
                >
                  <Upload size={16} />
                </button>
                <button
                  onClick={() => setShowPreview(doc)}
                  className="p-1.5 rounded-lg text-dark-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                  title="Preview"
                  aria-label={`Preview ${doc.title}`}
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => exportPDF(doc)}
                  className="p-1.5 rounded-lg text-dark-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Export PDF"
                  aria-label={`Export ${doc.title} sebagai PDF`}
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => openEdit(doc)}
                  className="p-1.5 rounded-lg text-dark-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Edit"
                  aria-label={`Edit ${doc.title}`}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => setDeleteTarget(doc)}
                  className="p-1.5 rounded-lg text-dark-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Hapus"
                  aria-label={`Hapus ${doc.title}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={!!showUploadModal}
        onClose={() => { setShowUploadModal(null); setSelectedFile(null); }}
        title={`Upload File - ${showUploadModal?.title || ''}`}
        footer={
          <>
            <Button variant="outline" onClick={() => { setShowUploadModal(null); setSelectedFile(null); }} disabled={!!uploadingId}>
              Batal
            </Button>
            <Button
              variant="primary"
              loading={!!uploadingId}
              onClick={handleUploadFile}
              disabled={!selectedFile}
              icon={<Upload />}
            >
              Upload
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-dark-500">
            Upload file lampiran untuk dokumen ini. Format yang didukung: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, PNG, JPG.
          </p>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand-300 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept={ALLOWED_EXTENSIONS.join(',')}
            />
            <Upload size={32} className="mx-auto text-gray-300 mb-3" />
            {selectedFile ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-dark-900">{selectedFile.name}</p>
                <p className="text-xs text-dark-400">{formatFileSize(selectedFile.size)}</p>
                <button
                  onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Hapus file
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-dark-500 mb-2">Klik untuk memilih file</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  Pilih File
                </button>
                <p className="text-xs text-dark-400 mt-2">Maks. 10MB</p>
              </>
            )}
          </div>
        </div>
      </Modal>

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
              <span>Tipe: {DOC_TYPES[showPreview.doc_type] || showPreview.doc_type}</span>
              <span>|</span>
              <span>v{showPreview.version || 1}</span>
              <span>|</span>
              <StatusBadge status={showPreview.status} />
            </div>
            {showPreview.file_url && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
                <FileText size={16} className="text-green-600" />
                <a
                  href={showPreview.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-700 hover:underline"
                >
                  {showPreview.file_name || 'Lihat file'} ({showPreview.file_size ? formatFileSize(showPreview.file_size) : ''})
                </a>
              </div>
            )}
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
          <FormSelect label="Tipe Dokumen" name="doc_type" value={form.doc_type} onChange={handleChange} options={docTypeOptions} placeholder="Pilih tipe" />
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
