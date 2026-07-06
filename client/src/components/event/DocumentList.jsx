import React from 'react';
import { Edit2, Trash2, Plus, Download, FileText, Sparkles, Upload, ExternalLink } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatDate } from '../../utils/formatters';

const DOC_TYPES = {
  brief: { label: 'Brief', color: 'blue' },
  proposal: { label: 'Proposal', color: 'purple' },
  schedule: { label: 'Jadwal', color: 'green' },
  budget: { label: 'Anggaran', color: 'yellow' },
  report: { label: 'Laporan', color: 'orange' },
  contract: { label: 'Kontrak', color: 'red' },
  other: { label: 'Lainnya', color: 'gray' },
};

const docStatusColors = {
  draft: 'gray',
  in_review: 'yellow',
  approved: 'green',
  published: 'blue',
};

export default function DocumentList({ documents = [], onEdit, onDelete, onAdd, onExport, onAIGenerate }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-dark-900">Dokumen</h3>
        <div className="flex items-center gap-2">
          {onAIGenerate && (
            <Button
              size="sm"
              variant="secondary"
              icon={<Sparkles size={14} />}
              onClick={() => onAIGenerate()}
            >
              Generate AI
            </Button>
          )}
          {onAdd && (
            <Button size="sm" icon={<Plus size={14} />} onClick={onAdd}>
              Upload
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500">Judul</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500">Tipe</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500">Tanggal</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-dark-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {documents.map((doc) => {
                const typeConfig = DOC_TYPES[doc.type] || DOC_TYPES.other;

                return (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-dark-400 shrink-0" />
                        <span className="font-medium text-dark-900 truncate">{doc.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={typeConfig.color} size="sm">{typeConfig.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={docStatusColors[doc.status] || 'gray'} size="sm">
                        {doc.status === 'draft' ? 'Draf' :
                         doc.status === 'in_review' ? 'Review' :
                         doc.status === 'approved' ? 'Disetujui' :
                         doc.status === 'published' ? 'Diterbitkan' : doc.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-dark-500">{formatDate(doc.created_at || doc.date || doc.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {onExport && (
                          <button
                            onClick={() => onExport(doc, 'pdf')}
                            className="p-1.5 rounded text-dark-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Export PDF"
                          >
                            <Download size={14} />
                          </button>
                        )}
                        {onAIGenerate && (
                          <button
                            onClick={() => onAIGenerate(doc)}
                            className="p-1.5 rounded text-dark-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            title="Generate dengan AI"
                          >
                            <Sparkles size={14} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(doc)}
                            className="p-1.5 rounded text-dark-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(doc.id)}
                            className="p-1.5 rounded text-dark-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {documents.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-dark-500">Belum ada dokumen</p>
        </div>
      )}
    </div>
  );
}
