import { useState, useEffect } from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  Edit,
  Send,
  Check,
  RefreshCw,
  X,
  CheckCircle,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import eventService from '../../services/eventService';
import { EVENT_STATUSES, APPROVAL_STATUSES } from '../../utils/constants';
import { formatDate, formatCurrency } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'rundown', label: 'Rundown' },
  { key: 'checklist', label: 'Checklist' },
  { key: 'tasks', label: 'Tugas' },
  { key: 'budget', label: 'Anggaran' },
  { key: 'vendors', label: 'Vendor' },
  { key: 'documents', label: 'Dokumen' },
  { key: 'approvals', label: 'Persetujuan' },
  { key: 'evaluation', label: 'Evaluasi' },
  { key: 'reports', label: 'Laporan' },
];

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchEvent = async () => {
    try {
      const res = await eventService.getById(id);
      setEvent(res.data.data);
    } catch {
      toast.error('Gagal memuat data event');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync tab from URL
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    const matched = TABS.find((t) => t.key === lastPart);
    if (matched) setActiveTab(matched.key);
    else if (pathParts.length <= 3) setActiveTab('overview');
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'overview') {
      navigate(`/events/${id}`);
    } else {
      navigate(`/events/${id}/${tab}`);
    }
  };

  const handleStatusAction = async (action) => {
    try {
      if (action === 'submitForApproval') {
        await eventService.submitForApproval(id);
        toast.success('Berhasil diajukan untuk persetujuan');
      } else if (action === 'approve') {
        await eventService.approve(id, 'Disetujui');
        toast.success('Event berhasil disetujui');
      } else if (action === 'reject') {
        await eventService.reject(id, 'Ditolak');
        toast.success('Event ditolak');
      } else if (action === 'completed') {
        await eventService.changeStatus(id, 'completed');
        toast.success('Event ditandai selesai');
      }
      fetchEvent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal melakukan aksi');
    }
    setConfirmAction(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!event) return null;

  const status = event.status;
  const detailItems = [
    { label: 'Tipe Event', value: typeof event.eventType === 'object' ? event.eventType?.name : event.eventType || '-' },
    { label: 'Tanggal Mulai', value: formatDate(event.startDate) },
    { label: 'Tanggal Selesai', value: formatDate(event.endDate) },
    { label: 'Waktu', value: event.startTime && event.endTime ? `${event.startTime} - ${event.endTime}` : '-' },
    { label: 'Lokasi', value: event.location || '-' },
    { label: 'Venue', value: event.venue || '-' },
    { label: 'Format', value: event.format || '-' },
    { label: 'Target Peserta', value: event.targetParticipants || '-' },
    { label: 'PIC Utama', value: event.picMain || '-' },
    { label: 'Divisi', value: event.division || '-' },
    { label: 'Budget', value: formatCurrency(event.budget) },
  ];

  const renderActions = () => {
    switch (status) {
      case 'draft':
        return (
          <>
            <Button variant="outline" icon={<Edit />} onClick={() => navigate(`/events/${id}/edit`)}>
              Edit
            </Button>
            <Button variant="primary" icon={<Send />} onClick={() => setConfirmAction('submitForApproval')}>
              Ajukan Persetujuan
            </Button>
          </>
        );
      case 'approval':
        return (
          <>
            <Button variant="primary" icon={<Check />} onClick={() => setConfirmAction('approve')}>
              Setujui
            </Button>
            <Button variant="secondary" icon={<RefreshCw />} onClick={() => setConfirmAction('revision')}>
              Revisi
            </Button>
            <Button variant="danger" icon={<X />} onClick={() => setConfirmAction('reject')}>
              Tolak
            </Button>
          </>
        );
      case 'planning':
        return (
          <>
            <Button variant="outline" icon={<Edit />} onClick={() => navigate(`/events/${id}/edit`)}>
              Edit
            </Button>
            <Button variant="primary" icon={<Send />} onClick={() => setConfirmAction('submitForApproval')}>
              Submit Approval
            </Button>
          </>
        );
      case 'in_progress':
        return (
          <Button variant="primary" icon={<CheckCircle />} onClick={() => setConfirmAction('completed')}>
            Tandai Selesai
          </Button>
        );
      case 'completed':
        return (
          <Button variant="primary" icon={<FileText />} onClick={() => navigate(`/events/${id}/reports`)}>
            Buat Laporan
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-dark-900">{event.name}</h1>
            <StatusBadge status={status} />
          </div>
          {/* Status flow indicator */}
          <div className="flex items-center gap-2 text-xs text-dark-400">
            {Object.entries(EVENT_STATUSES).map(([key, cfg], idx) => (
              <span key={key} className="flex items-center gap-1">
                {idx > 0 && <span className="text-dark-200 mx-1">/</span>}
                <span className={key === status ? 'font-semibold text-brand-600' : ''}>
                  {cfg.label}
                </span>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">{renderActions()}</div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-0 overflow-x-auto -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <Card>
          <h2 className="text-lg font-semibold text-dark-900 mb-4">Detail Event</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detailItems.map((item) => (
              <div key={item.label}>
                <p className="text-xs text-dark-400 mb-0.5">{item.label}</p>
                <p className="text-sm text-dark-900 font-medium">{item.value}</p>
              </div>
            ))}
          </div>
          {event.targetAudience && (
            <div className="mt-4">
              <p className="text-xs text-dark-400 mb-0.5">Target Audiens</p>
              <p className="text-sm text-dark-900">{event.targetAudience}</p>
            </div>
          )}
          {event.goal && (
            <div className="mt-4">
              <p className="text-xs text-dark-400 mb-0.5">Tujuan</p>
              <p className="text-sm text-dark-900">{event.goal}</p>
            </div>
          )}
          {event.notes && (
            <div className="mt-4">
              <p className="text-xs text-dark-400 mb-0.5">Catatan</p>
              <p className="text-sm text-dark-900">{event.notes}</p>
            </div>
          )}
        </Card>
      ) : (
        <Outlet context={{ event, refreshEvent: fetchEvent }} />
      )}

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={confirmAction === 'submitForApproval'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleStatusAction('submitForApproval')}
        title="Ajukan Persetujuan"
        message="Event akan diajukan untuk persetujuan. Lanjutkan?"
        confirmText="Ajukan"
      />
      <ConfirmDialog
        isOpen={confirmAction === 'approve'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleStatusAction('approve')}
        title="Setujui Event"
        message="Apakah Anda yakin ingin menyetujui event ini?"
        confirmText="Setujui"
        variant="success"
      />
      <ConfirmDialog
        isOpen={confirmAction === 'reject'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleStatusAction('reject')}
        title="Tolak Event"
        message="Apakah Anda yakin ingin menolak event ini?"
        confirmText="Tolak"
      />
      <ConfirmDialog
        isOpen={confirmAction === 'completed'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleStatusAction('completed')}
        title="Tandai Selesai"
        message="Tandai event ini sebagai selesai?"
        confirmText="Selesai"
      />
    </div>
  );
}
