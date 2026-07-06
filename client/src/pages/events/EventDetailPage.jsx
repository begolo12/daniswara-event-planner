import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Edit,
  Send,
  Check,
  X,
  CheckCircle,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import eventService from '../../services/eventService';
import { EVENT_STATUSES } from '../../utils/constants';
import { formatDate, formatCurrency } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

// Import sub-page components
import EventTimelinePage from './EventTimelinePage';
import EventRundownPage from './EventRundownPage';
import EventChecklistPage from './EventChecklistPage';
import EventTaskPage from './EventTaskPage';
import EventBudgetPage from './EventBudgetPage';
import EventVendorPage from './EventVendorPage';
import EventDocumentPage from './EventDocumentPage';
import EventApprovalPage from './EventApprovalPage';
import EventEvaluationPage from './EventEvaluationPage';
import EventReportPage from './EventReportPage';

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
  { key: 'report', label: 'Laporan' },
];

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
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
        await eventService.changeStatus(id, 'done');
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

  const eventData = {
    name: event.name,
    eventType: event.EventType || event.event_type_id || event.eventType,
    eventDate: event.event_date || event.start_date,
    startTime: event.start_time,
    endTime: event.end_time,
    location: event.location,
    venue: event.venue,
    format: event.format,
    estimatedParticipants: event.estimated_participants,
    targetParticipants: event.target_participants,
    goal: event.goal,
    tone: event.tone,
    budgetMax: event.budget_max,
    division: event.division,
    picMain: event.pic_main || event.picMain,
    notes: event.notes,
  };

  const detailItems = [
    { label: 'Tipe Event', value: typeof eventData.eventType === 'object' ? eventData.eventType?.name : eventData.eventType || '-' },
    { label: 'Tanggal', value: formatDate(eventData.eventDate) },
    { label: 'Waktu', value: eventData.startTime && eventData.endTime ? `${eventData.startTime} - ${eventData.endTime}` : '-' },
    { label: 'Lokasi', value: eventData.location || '-' },
    { label: 'Venue', value: eventData.venue || '-' },
    { label: 'Format', value: eventData.format || '-' },
    { label: 'Estimasi Peserta', value: eventData.estimatedParticipants || '-' },
    { label: 'Target Peserta', value: eventData.targetParticipants || '-' },
    { label: 'PIC Utama', value: eventData.picMain?.name || eventData.picMain || '-' },
    { label: 'Divisi', value: eventData.division || '-' },
    { label: 'Budget', value: formatCurrency(eventData.budgetMax) },
    { label: 'Tone', value: eventData.tone || '-' },
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
      case 'waiting_approval':
        return (
          <>
            <Button variant="primary" icon={<Check />} onClick={() => setConfirmAction('approve')}>
              Setujui
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
      case 'preparation':
      case 'ready':
      case 'on_going':
        return (
          <Button variant="primary" icon={<CheckCircle />} onClick={() => setConfirmAction('completed')}>
            Tandai Selesai
          </Button>
        );
      case 'done':
      case 'evaluated':
        return (
          <Button variant="primary" icon={<FileText />} onClick={() => setActiveTab('report')}>
            Buat Laporan
          </Button>
        );
      default:
        return null;
    }
  };

  const renderStatusFlow = () => {
    const statusOrder = ['draft', 'planning', 'waiting_approval', 'preparation', 'ready', 'on_going', 'done', 'evaluated'];
    return (
      <div className="flex items-center gap-1 text-xs overflow-x-auto pb-1">
        {statusOrder.map((key, idx) => (
          <span key={key} className="flex items-center gap-1 whitespace-nowrap">
            {idx > 0 && <span className="text-dark-200 mx-0.5">→</span>}
            <span className={
              key === status
                ? 'font-semibold text-brand-600'
                : statusOrder.indexOf(status) > idx
                ? 'text-green-500'
                : 'text-dark-300'
            }>
              {EVENT_STATUSES[key]?.label || key}
            </span>
          </span>
        ))}
      </div>
    );
  };

  // Render sub-page content inline
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
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
            {eventData.goal && (
              <div className="mt-4">
                <p className="text-xs text-dark-400 mb-0.5">Tujuan</p>
                <p className="text-sm text-dark-900">{eventData.goal}</p>
              </div>
            )}
            {eventData.notes && (
              <div className="mt-4">
                <p className="text-xs text-dark-400 mb-0.5">Catatan</p>
                <p className="text-sm text-dark-900">{eventData.notes}</p>
              </div>
            )}
            {/* Sub-resources summary */}
            {event.themes?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-dark-400 mb-1">Tema ({event.themes.length})</p>
                <div className="flex flex-wrap gap-2">
                  {event.themes.map((t) => (
                    <span key={t.id} className={`px-2 py-1 rounded-full text-xs font-medium ${t.is_selected ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-700'}`}>
                      {t.theme_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {event.tasks?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-dark-400 mb-1">Tugas ({event.tasks.length})</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    {event.tasks.filter(t => t.status === 'done').length} selesai
                  </span>
                  <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    {event.tasks.filter(t => t.status === 'in_progress').length} berlangsung
                  </span>
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {event.tasks.filter(t => t.status === 'not_started').length} belum mulai
                  </span>
                </div>
              </div>
            )}
            {event.risks?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-dark-400 mb-1">Risiko ({event.risks.length})</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {event.risks.slice(0, 3).map((r) => (
                    <span key={r.id} className="px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                      {r.risk?.substring(0, 40)}...
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      case 'timeline':
        return <EventTimelinePage />;
      case 'rundown':
        return <EventRundownPage />;
      case 'checklist':
        return <EventChecklistPage />;
      case 'tasks':
        return <EventTaskPage />;
      case 'budget':
        return <EventBudgetPage />;
      case 'vendors':
        return <EventVendorPage />;
      case 'documents':
        return <EventDocumentPage />;
      case 'approvals':
        return <EventApprovalPage />;
      case 'evaluation':
        return <EventEvaluationPage />;
      case 'report':
        return <EventReportPage />;
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
          {renderStatusFlow()}
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

      {/* Tab Content - rendered inline */}
      {renderTabContent()}

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
