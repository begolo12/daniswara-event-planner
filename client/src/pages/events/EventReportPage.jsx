import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Download, FileDown, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import reportService from '../../services/reportService';
import { budgets, tasks, evaluations } from '../../services/eventSubService';
import eventService from '../../services/eventService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function EventReportPage() {
  const { id: eventId } = useParams();
  const [report, setReport] = useState(null);
  const [event, setEvent] = useState(null);
  const [budgetItems, setBudgetItems] = useState([]);
  const [taskItems, setTaskItems] = useState([]);
  const [evalData, setEvalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Try to get existing report
      let reportData = null;
      try {
        const reportRes = await reportService.getEventReport(eventId);
        reportData = reportRes.data.data;
      } catch {
        // No report yet
      }

      // Always fetch live data for the dashboard view
      const [eventRes, budgetRes, taskRes] = await Promise.all([
        eventService.getById(eventId),
        budgets.list(eventId),
        tasks.list(eventId),
      ]);

      setEvent(eventRes.data.data);
      setBudgetItems(budgetRes.data.data || []);
      setTaskItems(taskRes.data.data || []);

      // Try to get evaluation (singleton)
      try {
        const evalRes = await evaluations.get(eventId);
        setEvalData(evalRes.data.data);
      } catch {
        // No evaluation
      }

      setReport(reportData);
    } catch {
      // Partial data is fine
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute live budget summary
  const budgetSummary = {
    totalPlanned: budgetItems.reduce((sum, i) => sum + (Number(i.total_price) || 0), 0),
    totalActual: budgetItems.reduce((sum, i) => sum + (Number(i.actual_cost) || 0), 0),
    remaining: 0,
  };
  budgetSummary.remaining = budgetSummary.totalPlanned - budgetSummary.totalActual;

  // Compute live task summary
  const taskSummary = {
    total: taskItems.length,
    completed: taskItems.filter((t) => t.status === 'done' || t.progress === 100).length,
    inProgress: taskItems.filter((t) => t.status === 'in_progress' || (t.progress > 0 && t.progress < 100)).length,
    pending: taskItems.filter((t) => t.status === 'not_started' || (!t.status && t.progress === 0)).length,
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await reportService.generateReport(eventId);
      toast.success('Laporan berhasil digenerate');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal generate laporan');
    } finally {
      setGenerating(false);
    }
  };

  const exportPDF = async () => {
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
      if (event?.name) {
        y += 6;
        doc.text(`Event: ${event.name}`, 14, y);
      }
      y += 12;

      // AI Summary section (if available)
      if (report?.summary) {
        doc.setTextColor(0);
        doc.setFontSize(14);
        doc.text('Ringkasan AI', 14, y);
        y += 8;
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(report.summary, 180);
        doc.text(lines, 14, y);
        y += lines.length * 5 + 6;
      }

      // Budget section
      doc.setTextColor(0);
      doc.setFontSize(14);
      doc.text('Anggaran', 14, y);
      y += 8;
      doc.setFontSize(10);
      doc.text(`Total Rencana: ${formatCurrency(budgetSummary.totalPlanned)}`, 14, y);
      y += 5;
      doc.text(`Total Aktual: ${formatCurrency(budgetSummary.totalActual)}`, 14, y);
      y += 5;
      doc.text(`Sisa: ${formatCurrency(budgetSummary.remaining)}`, 14, y);
      y += 8;

      if (budgetItems.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [['Kategori', 'Item', 'Rencana', 'Aktual']],
          body: budgetItems.map((i) => [
            i.category || '-',
            i.item,
            formatCurrency(i.total_price),
            formatCurrency(i.actual_cost || 0),
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [239, 68, 68] },
        });
        y = doc.lastAutoTable.finalY + 10;
      }

      // Tasks section
      doc.setFontSize(14);
      doc.text('Tugas', 14, y);
      y += 8;
      doc.setFontSize(10);
      const taskText = [
        `Total: ${taskSummary.total}`,
        `Selesai: ${taskSummary.completed}`,
        `Dikerjakan: ${taskSummary.inProgress}`,
        `Belum: ${taskSummary.pending}`,
      ];
      doc.text(taskText.join('  |  '), 14, y);
      y += 12;

      // Evaluation section
      if (evalData) {
        doc.setFontSize(14);
        doc.text('Evaluasi', 14, y);
        y += 8;
        doc.setFontSize(10);
        if (evalData.actual_participants) {
          doc.text(`Peserta Aktual: ${evalData.actual_participants}`, 14, y);
          y += 5;
        }
        if (evalData.budget_planned) {
          doc.text(`Anggaran Rencana: ${formatCurrency(evalData.budget_planned)}`, 14, y);
          y += 5;
        }
        if (evalData.budget_actual) {
          doc.text(`Anggaran Aktual: ${formatCurrency(evalData.budget_actual)}`, 14, y);
          y += 5;
        }
        y += 5;
      }

      doc.save('laporan-event.pdf');
      toast.success('PDF berhasil diunduh');
    } catch {
      toast.error('Gagal export PDF');
    }
  };

  const exportDOCX = async () => {
    try {
      const res = await reportService.exportEventDocx(eventId);
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-event-${eventId}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('DOCX berhasil diunduh');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal export DOCX');
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
        <div>
          <h2 className="text-xl font-semibold text-dark-900">Laporan Event</h2>
          {event && <p className="text-sm text-dark-400 mt-1">{event.name}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<Sparkles />} loading={generating} onClick={handleGenerate}>
            Generate Laporan AI
          </Button>
          <Button variant="outline" size="sm" icon={<Download />} onClick={exportPDF}>
            Export PDF
          </Button>
          <Button variant="outline" size="sm" icon={<FileDown />} onClick={exportDOCX}>
            Export DOCX
          </Button>
        </div>
      </div>

      {/* AI Summary (if available) */}
      {report?.summary && (
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 mb-3">Ringkasan AI</h3>
          <p className="text-sm text-dark-700 whitespace-pre-wrap">{report.summary}</p>
        </Card>
      )}

      {!report && (
        <Card className="border-dashed border-2 border-gray-200">
          <div className="text-center py-4">
            <Sparkles className="mx-auto text-brand-400 mb-2" size={24} />
            <p className="text-sm text-dark-500 mb-3">Belum ada laporan AI. Generate laporan untuk mendapatkan ringkasan otomatis.</p>
            <Button variant="primary" size="sm" icon={<Sparkles />} loading={generating} onClick={handleGenerate}>
              Generate Laporan AI
            </Button>
          </div>
        </Card>
      )}

      {/* Budget Summary */}
      <Card>
        <h3 className="text-lg font-semibold text-dark-900 mb-3">Anggaran</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-dark-400">Total Rencana</p>
            <p className="text-sm font-semibold text-dark-900">{formatCurrency(budgetSummary.totalPlanned)}</p>
          </div>
          <div>
            <p className="text-xs text-dark-400">Total Aktual</p>
            <p className="text-sm font-semibold text-dark-900">{formatCurrency(budgetSummary.totalActual)}</p>
          </div>
          <div>
            <p className="text-xs text-dark-400">Sisa</p>
            <p className={`text-sm font-semibold ${budgetSummary.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(budgetSummary.remaining)}
            </p>
          </div>
        </div>
        {budgetItems.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-dark-500 font-medium">Kategori</th>
                  <th className="text-left py-2 text-dark-500 font-medium">Item</th>
                  <th className="text-right py-2 text-dark-500 font-medium">Rencana</th>
                  <th className="text-right py-2 text-dark-500 font-medium">Aktual</th>
                </tr>
              </thead>
              <tbody>
                {budgetItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50">
                    <td className="py-2 text-dark-700">{item.category || '-'}</td>
                    <td className="py-2 text-dark-700">{item.item}</td>
                    <td className="py-2 text-right text-dark-700">{formatCurrency(item.total_price)}</td>
                    <td className="py-2 text-right text-dark-700">{formatCurrency(item.actual_cost || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Task Summary */}
      <Card>
        <h3 className="text-lg font-semibold text-dark-900 mb-3">Tugas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-dark-900">{taskSummary.total}</p>
            <p className="text-xs text-dark-400">Total</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{taskSummary.completed}</p>
            <p className="text-xs text-dark-400">Selesai</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{taskSummary.inProgress}</p>
            <p className="text-xs text-dark-400">Dikerjakan</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-dark-600">{taskSummary.pending}</p>
            <p className="text-xs text-dark-400">Belum Dikerjakan</p>
          </div>
        </div>
        {taskSummary.total > 0 && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.round((taskSummary.completed / taskSummary.total) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-dark-400 mt-1 text-right">
              {Math.round((taskSummary.completed / taskSummary.total) * 100)}% selesai
            </p>
          </div>
        )}
      </Card>

      {/* Evaluation Summary */}
      {evalData && (
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 mb-3">Evaluasi</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {evalData.actual_participants && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-dark-900">{evalData.actual_participants}</p>
                <p className="text-xs text-dark-400">Peserta Aktual</p>
              </div>
            )}
            {evalData.budget_planned && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-dark-900">{formatCurrency(evalData.budget_planned)}</p>
                <p className="text-xs text-dark-400">Anggaran Rencana</p>
              </div>
            )}
            {evalData.budget_actual && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-dark-900">{formatCurrency(evalData.budget_actual)}</p>
                <p className="text-xs text-dark-400">Anggaran Aktual</p>
              </div>
            )}
          </div>
          {evalData.recommendations && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-dark-700 mb-1">Rekomendasi</h4>
              <p className="text-sm text-dark-600 whitespace-pre-wrap">{evalData.recommendations}</p>
            </div>
          )}
          {evalData.improvement_notes && (
            <div className="mt-3">
              <h4 className="text-sm font-semibold text-dark-700 mb-1">Poin Perbaikan</h4>
              <p className="text-sm text-dark-600 whitespace-pre-wrap">{evalData.improvement_notes}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
