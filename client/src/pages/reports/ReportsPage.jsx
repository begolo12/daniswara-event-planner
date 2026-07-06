import React, { useState, useEffect, useMemo } from 'react';
import {
  Eye,
  Download,
  FileBarChart,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Tabs from '../../components/ui/Tabs';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import reportService from '../../services/reportService';
import { EVENT_STATUSES } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [budgetReport, setBudgetReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [report, setReport] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [eventsRes, budgetRes] = await Promise.allSettled([
          reportService.listEvents(),
          reportService.getBudgetReport(),
        ]);
        if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data?.data || []);
        if (budgetRes.status === 'fulfilled') setBudgetReport(budgetRes.value.data?.data || null);
      } catch {
        toast.error('Gagal memuat laporan');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const tabs = [
    { key: 'events', label: 'Laporan Event', icon: <FileBarChart size={16} /> },
    { key: 'budget', label: 'Laporan Anggaran', icon: <TrendingUp size={16} /> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-900">Laporan</h1>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : activeTab === 'events' ? (
        <EventsTab
          events={events}
          onGenerate={async (eventId) => {
            setGenerating(true);
            try {
              await reportService.generateReport(eventId);
              toast.success('Laporan berhasil digenerate');
              const res = await reportService.listEvents();
              setEvents(res.data?.data || []);
            } catch {
              toast.error('Gagal generate laporan');
            } finally {
              setGenerating(false);
            }
          }}
          onViewReport={async (event) => {
            setSelectedEvent(event);
            setShowReport(true);
            try {
              const res = await reportService.getEventReport(event.id);
              setReport(res.data?.data || null);
            } catch {
              toast.error('Gagal memuat laporan');
              setReport(null);
            }
          }}
          generating={generating}
        />
      ) : (
        <BudgetTab budgetReport={budgetReport} events={events} />
      )}

      {/* Report Detail Modal */}
      <Modal
        isOpen={showReport}
        onClose={() => { setShowReport(false); setReport(null); }}
        title={`Laporan: ${selectedEvent?.name || ''}`}
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => { setShowReport(false); setReport(null); }}>Tutup</Button>
            {report && (
              <Button icon={<Download size={16} />} onClick={() => exportPDF(report, selectedEvent)}>
                Export PDF
              </Button>
            )}
          </>
        }
      >
        {report ? (
          <ReportDetail report={report} />
        ) : (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}
      </Modal>
    </div>
  );
}

function EventsTab({ events, onGenerate, onViewReport, generating }) {
  const columns = [
    { key: 'no', label: 'No', render: (_, __, idx) => idx + 1 },
    { key: 'name', label: 'Event' },
    {
      key: 'status', label: 'Status',
      render: (v) => {
        const st = EVENT_STATUSES[v];
        return <Badge color={st?.color || 'gray'}>{st?.label || v}</Badge>;
      },
    },
    {
      key: 'startDate', label: 'Tanggal',
      render: (v) => formatDate(v),
    },
    {
      key: 'actions', label: 'Aksi',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onViewReport(row); }}
            className="p-1.5 rounded-lg text-dark-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
            title="Lihat laporan"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onGenerate(row.id); }}
            className="p-1.5 rounded-lg text-dark-400 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
            title="Generate laporan"
            disabled={generating}
          >
            <FileBarChart size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-dark-900">Daftar Event</h2>
      </div>
      <Table
        columns={columns}
        data={events}
        emptyMessage="Belum ada event"
        emptyIcon={<FileBarChart size={48} strokeWidth={1.5} />}
      />
    </div>
  );
}

function BudgetTab({ budgetReport, events }) {
  const summaryCards = useMemo(() => {
    if (!budgetReport) return [];
    const planned = budgetReport.totalPlanned || 0;
    const actual = budgetReport.totalActual || 0;
    const variance = planned - actual;
    return [
      { label: 'Total Rencana', value: formatCurrency(planned), color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Total Aktual', value: formatCurrency(actual), color: 'text-green-600', bg: 'bg-green-50' },
      {
        label: 'Selisih',
        value: formatCurrency(Math.abs(variance)),
        color: variance >= 0 ? 'text-green-600' : 'text-red-600',
        bg: variance >= 0 ? 'bg-green-50' : 'bg-red-50',
        icon: variance > 0 ? <TrendingDown size={16} /> : variance < 0 ? <TrendingUp size={16} /> : <Minus size={16} />,
      },
    ];
  }, [budgetReport]);

  const chartData = useMemo(() => {
    if (!budgetReport?.events) return [];
    return budgetReport.events.map((ev) => ({
      name: ev.name?.length > 20 ? ev.name.slice(0, 20) + '...' : ev.name,
      Rencana: ev.planned || 0,
      Aktual: ev.actual || 0,
    }));
  }, [budgetReport]);

  const columns = [
    { key: 'no', label: 'No', render: (_, __, idx) => idx + 1 },
    { key: 'name', label: 'Event' },
    { key: 'planned', label: 'Rencana', render: (v) => formatCurrency(v) },
    { key: 'actual', label: 'Aktual', render: (v) => formatCurrency(v) },
    {
      key: 'variance', label: 'Selisih',
      render: (_, row) => {
        const v = (row.planned || 0) - (row.actual || 0);
        return (
          <span className={v >= 0 ? 'text-green-600' : 'text-red-600'}>
            {v >= 0 ? '+' : ''}{formatCurrency(v)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={`${card.bg} rounded-xl p-5`}>
            <p className="text-xs font-medium text-dark-500 mb-1">{card.label}</p>
            <div className="flex items-center gap-2">
              {card.icon && <span className={card.color}>{card.icon}</span>}
              <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-dark-700 mb-4">Perbandingan Anggaran</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey="Rencana" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Aktual" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div>
        <h3 className="text-sm font-semibold text-dark-700 mb-3">Detail Anggaran per Event</h3>
        <Table
          columns={columns}
          data={budgetReport?.events || []}
          emptyMessage="Belum ada data anggaran"
          emptyIcon={<FileBarChart size={48} strokeWidth={1.5} />}
        />
      </div>
    </div>
  );
}

function ReportDetail({ report }) {
  return (
    <div className="space-y-6 text-sm">
      {/* Summary */}
      {report.summary && (
        <div>
          <h3 className="font-semibold text-dark-900 mb-2">Ringkasan</h3>
          <p className="text-dark-600 whitespace-pre-wrap">{report.summary}</p>
        </div>
      )}

      {/* Budget Table */}
      {report.budget?.length > 0 && (
        <div>
          <h3 className="font-semibold text-dark-900 mb-2">Anggaran</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-dark-500">Item</th>
                  <th className="px-3 py-2 text-right font-medium text-dark-500">Rencana</th>
                  <th className="px-3 py-2 text-right font-medium text-dark-500">Aktual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.budget.map((item, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-dark-700">{item.name}</td>
                    <td className="px-3 py-2 text-right text-dark-700">{formatCurrency(item.planned)}</td>
                    <td className="px-3 py-2 text-right text-dark-700">{formatCurrency(item.actual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Summary */}
      {report.tasks && (
        <div>
          <h3 className="font-semibold text-dark-900 mb-2">Ringkasan Tugas</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-blue-600">{report.tasks.total || 0}</p>
              <p className="text-xs text-dark-500">Total</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-green-600">{report.tasks.completed || 0}</p>
              <p className="text-xs text-dark-500">Selesai</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-yellow-600">{report.tasks.pending || 0}</p>
              <p className="text-xs text-dark-500">Tertunda</p>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation */}
      {report.evaluation && (
        <div>
          <h3 className="font-semibold text-dark-900 mb-2">Evaluasi</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-dark-700">Skor:</span>
              <Badge color={report.evaluation.score >= 7 ? 'green' : report.evaluation.score >= 5 ? 'yellow' : 'red'}>
                {report.evaluation.score}/10
              </Badge>
            </div>
            {report.evaluation.feedback && (
              <p className="text-xs text-dark-600 whitespace-pre-wrap">{report.evaluation.feedback}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function exportPDF(report, event) {
  try {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Laporan: ${event?.name || 'Event'}`, 14, 22);
    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

    let y = 40;

    if (report.summary) {
      doc.setFontSize(12);
      doc.text('Ringkasan', 14, y);
      y += 8;
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(report.summary, 180);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 6;
    }

    if (report.budget?.length > 0) {
      doc.setFontSize(12);
      doc.text('Anggaran', 14, y);
      y += 4;
      doc.autoTable({
        startY: y,
        head: [['Item', 'Rencana', 'Aktual']],
        body: report.budget.map((b) => [b.name, `Rp ${(b.planned || 0).toLocaleString()}`, `Rp ${(b.actual || 0).toLocaleString()}`]),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    if (report.tasks) {
      doc.setFontSize(12);
      doc.text('Ringkasan Tugas', 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.text(`Total: ${report.tasks.total || 0} | Selesai: ${report.tasks.completed || 0} | Tertunda: ${report.tasks.pending || 0}`, 14, y);
      y += 10;
    }

    doc.save(`laporan-${(event?.name || 'event').replace(/\s+/g, '-')}.pdf`);
    toast.success('PDF berhasil didownload');
  } catch {
    toast.error('Gagal membuat PDF');
  }
}
