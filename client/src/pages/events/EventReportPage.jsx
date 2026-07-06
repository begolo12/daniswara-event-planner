import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Download, FileDown, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import reportService from '../../services/reportService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function EventReportPage() {
  const { id: eventId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      const res = await reportService.getEventReport(eventId);
      setReport(res.data.data);
    } catch {
      // No report yet or error
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await reportService.generateReport(eventId);
      toast.success('Laporan berhasil digenerate');
      fetchReport();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal generate laporan');
    } finally {
      setGenerating(false);
    }
  };

  const exportPDF = async () => {
    if (!report) return;
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();
      let y = 20;

      // Title
      doc.setFontSize(18);
      doc.text('Laporan Event', 14, y);
      y += 10;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Digenerate: ${formatDate(new Date())}`, 14, y);
      y += 12;

      // Summary section
      doc.setTextColor(0);
      doc.setFontSize(14);
      doc.text('Ringkasan', 14, y);
      y += 8;
      doc.setFontSize(10);
      if (report.summary) {
        const lines = doc.splitTextToSize(report.summary, 180);
        doc.text(lines, 14, y);
        y += lines.length * 5 + 6;
      }

      // Budget section
      if (report.budget) {
        doc.setFontSize(14);
        doc.text('Anggaran', 14, y);
        y += 8;
        autoTable(doc, {
          startY: y,
          head: [['Kategori', 'Rencana', 'Aktual']],
          body: (report.budget.items || []).map((i) => [
            i.category || '-',
            formatCurrency(i.planned),
            formatCurrency(i.actual),
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [239, 68, 68] },
        });
        y = doc.lastAutoTable.finalY + 10;
      }

      // Tasks section
      if (report.tasks) {
        doc.setFontSize(14);
        doc.text('Tugas', 14, y);
        y += 8;
        doc.setFontSize(10);
        const taskSummary = [
          `Total: ${report.tasks.total || 0}`,
          `Selesai: ${report.tasks.completed || 0}`,
          `Dikerjakan: ${report.tasks.inProgress || 0}`,
          `Belum: ${report.tasks.pending || 0}`,
        ];
        doc.text(taskSummary.join('  |  '), 14, y);
        y += 12;
      }

      // Evaluation section
      if (report.evaluation) {
        doc.setFontSize(14);
        doc.text('Evaluasi', 14, y);
        y += 8;
        doc.setFontSize(10);
        doc.text(`Rating Rata-rata: ${report.evaluation.averageRating || '-'}`, 14, y);
        y += 6;
        doc.text(`Total Evaluasi: ${report.evaluation.totalEvaluations || 0}`, 14, y);
        y += 10;
      }

      doc.save('laporan-event.pdf');
      toast.success('PDF berhasil diunduh');
    } catch {
      toast.error('Gagal export PDF');
    }
  };

  const exportWord = async () => {
    if (!report) return;
    try {
      // Generate a simple HTML-based Word document
      const content = `
        <html>
          <head><meta charset="utf-8"><title>Laporan Event</title></head>
          <body>
            <h1>Laporan Event</h1>
            <p><em>Digenerate: ${formatDate(new Date())}</em></p>
            <h2>Ringkasan</h2>
            <p>${report.summary || '-'}</p>
            ${report.budget ? `
              <h2>Anggaran</h2>
              <p>Total Rencana: ${formatCurrency(report.budget.totalPlanned)}</p>
              <p>Total Aktual: ${formatCurrency(report.budget.totalActual)}</p>
            ` : ''}
            ${report.tasks ? `
              <h2>Tugas</h2>
              <p>Total: ${report.tasks.total || 0} | Selesai: ${report.tasks.completed || 0}</p>
            ` : ''}
            ${report.evaluation ? `
              <h2>Evaluasi</h2>
              <p>Rating Rata-rata: ${report.evaluation.averageRating || '-'}</p>
            ` : ''}
          </body>
        </html>
      `;
      const blob = new Blob([content], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'laporan-event.doc';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Word document berhasil diunduh');
    } catch {
      toast.error('Gagal export Word');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-dark-900">Laporan Event</h2>
        <EmptyState
          icon={FileText}
          title="Belum ada laporan"
          message="Generate laporan untuk melihat ringkasan event."
          action={
            <Button variant="primary" icon={<Sparkles />} loading={generating} onClick={handleGenerate}>
              Generate Laporan
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-dark-900">Laporan Event</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<Sparkles />} loading={generating} onClick={handleGenerate}>
            Generate Ulang
          </Button>
          <Button variant="outline" size="sm" icon={<Download />} onClick={exportPDF}>
            Export PDF
          </Button>
          <Button variant="outline" size="sm" icon={<FileDown />} onClick={exportWord}>
            Export Word
          </Button>
        </div>
      </div>

      {/* Summary */}
      {report.summary && (
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 mb-3">Ringkasan</h3>
          <p className="text-sm text-dark-700 whitespace-pre-wrap">{report.summary}</p>
        </Card>
      )}

      {/* Budget Summary */}
      {report.budget && (
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 mb-3">Anggaran</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-dark-400">Total Rencana</p>
              <p className="text-sm font-semibold text-dark-900">{formatCurrency(report.budget.totalPlanned)}</p>
            </div>
            <div>
              <p className="text-xs text-dark-400">Total Aktual</p>
              <p className="text-sm font-semibold text-dark-900">{formatCurrency(report.budget.totalActual)}</p>
            </div>
            <div>
              <p className="text-xs text-dark-400">Sisa</p>
              <p className="text-sm font-semibold text-dark-900">{formatCurrency(report.budget.remaining)}</p>
            </div>
          </div>
          {report.budget.items && report.budget.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-dark-500 font-medium">Kategori</th>
                    <th className="text-right py-2 text-dark-500 font-medium">Rencana</th>
                    <th className="text-right py-2 text-dark-500 font-medium">Aktual</th>
                  </tr>
                </thead>
                <tbody>
                  {report.budget.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-50">
                      <td className="py-2 text-dark-700">{item.category || '-'}</td>
                      <td className="py-2 text-right text-dark-700">{formatCurrency(item.planned)}</td>
                      <td className="py-2 text-right text-dark-700">{formatCurrency(item.actual)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Task Summary */}
      {report.tasks && (
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 mb-3">Tugas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-dark-900">{report.tasks.total || 0}</p>
              <p className="text-xs text-dark-400">Total</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{report.tasks.completed || 0}</p>
              <p className="text-xs text-dark-400">Selesai</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{report.tasks.inProgress || 0}</p>
              <p className="text-xs text-dark-400">Dikerjakan</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-dark-600">{report.tasks.pending || 0}</p>
              <p className="text-xs text-dark-400">Belum Dikerjakan</p>
            </div>
          </div>
          {report.tasks.total > 0 && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.round(((report.tasks.completed || 0) / report.tasks.total) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-dark-400 mt-1 text-right">
                {Math.round(((report.tasks.completed || 0) / report.tasks.total) * 100)}% selesai
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Evaluation Summary */}
      {report.evaluation && (
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 mb-3">Evaluasi</h3>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-dark-900">{report.evaluation.averageRating || '-'}</p>
              <p className="text-xs text-dark-400">Rating Rata-rata</p>
            </div>
            <div>
              <p className="text-sm text-dark-700">
                Total evaluasi: <span className="font-medium">{report.evaluation.totalEvaluations || 0}</span>
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
