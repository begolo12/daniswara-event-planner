import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Sparkles,
  Edit,
  Eye,
  Trash2,
  Calendar,
  Inbox,
} from 'lucide-react';
import toast from 'react-hot-toast';
import eventService from '../../services/eventService';
import { eventTypes as eventTypesService } from '../../services/masterService';
import { EVENT_STATUSES } from '../../utils/constants';
import { formatDate, formatCurrency } from '../../utils/formatters';
import usePagination from '../../hooks/usePagination';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Button from '../../components/ui/Button';

export default function EventListPage() {
  const navigate = useNavigate();
  const { page, totalPages, totalItems, setPage, setTotalItems, limit, setLimit } = usePagination(1, 10);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', event_type_id: '', search: '' });
  const [eventTypeOptions, setEventTypeOptions] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (filters.status) params.status = filters.status;
      if (filters.event_type_id) params.event_type_id = filters.event_type_id;
      if (filters.search) params.search = filters.search;

      const res = await eventService.list(params);
      const rawEvents = res.data.data;
      // API returns snake_case fields: event_date, budget_max, estimated_participants, etc.
      const normalized = (Array.isArray(rawEvents) ? rawEvents : []).map((e) => ({
        ...e,
        eventType: e.EventType || e.event_type_id || e.eventType,
        startDate: e.event_date || e.start_date,
        budget: e.budget_max || e.budget || 0,
        picMain: e.pic_main?.name || e.pic_main || e.picMain?.name || e.picMain || '-',
      }));
      setEvents(normalized);
      setTotalItems(res.data.pagination?.total || normalized.length || 0);
    } catch {
      toast.error('Gagal memuat data event');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters, setTotalItems]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    eventTypesService
      .list()
      .then((res) => {
        const list = res.data.data || [];
        setEventTypeOptions(
          (Array.isArray(list) ? list : []).map((t) => ({
            value: t.id || t._id,
            label: t.name,
          }))
        );
      })
      .catch(() => {});
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await eventService.delete(deleteTarget.id);
      toast.success('Event berhasil dihapus');
      setDeleteTarget(null);
      fetchEvents();
    } catch {
      toast.error('Gagal menghapus event');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Nama Event',
      render: (val, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/events/${row.id || row._id}`); }}
          className="font-medium text-brand-600 hover:underline"
        >
          {val}
        </button>
      ),
    },
    {
      key: 'eventType',
      label: 'Tipe',
      render: (val) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-dark-700">
          {typeof val === 'object' ? val?.name : val || '-'}
        </span>
      ),
    },
    {
      key: 'startDate',
      label: 'Tanggal',
      render: (val) => formatDate(val),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'picMain',
      label: 'PIC',
      render: (val) => val || '-',
    },
    {
      key: 'budget',
      label: 'Budget',
      render: (val) => formatCurrency(val),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/events/${row.id || row._id}/edit`); }}
            className="p-1.5 rounded-lg text-dark-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/events/${row.id || row._id}`); }}
            className="p-1.5 rounded-lg text-dark-400 hover:text-green-600 hover:bg-green-50 transition-colors"
            title="Lihat"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
            className="p-1.5 rounded-lg text-dark-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const statusOptions = Object.entries(EVENT_STATUSES).map(([key, val]) => ({
    value: key,
    label: val.label,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-dark-900">Daftar Event</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={<Plus />} onClick={() => navigate('/events/create')}>
            Buat Event
          </Button>
          <Button variant="primary" icon={<Sparkles />} onClick={() => navigate('/events/create-ai')}>
            Buat dengan AI
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={filters.status}
          onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setPage(1); }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Semua Status</option>
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={filters.event_type_id}
          onChange={(e) => { setFilters((f) => ({ ...f, event_type_id: e.target.value })); setPage(1); }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Semua Tipe</option>
          {eventTypeOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <SearchInput
          value={filters.search}
          onChange={(val) => { setFilters((f) => ({ ...f, search: val })); setPage(1); }}
          placeholder="Cari event..."
          className="sm:w-64"
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={events}
        loading={loading}
        emptyMessage="Belum ada event"
        emptyIcon={<Inbox size={48} strokeWidth={1.5} />}
        onRowClick={(row) => navigate(`/events/${row.id || row._id}`)}
      />

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          perPage={limit}
          onPerPageChange={(val) => { setLimit(val); setPage(1); }}
        />
      )}

      {/* Empty state */}
      {!loading && events.length === 0 && (
        <EmptyState
          icon={Calendar}
          title="Belum ada event"
          message="Buat event pertama Anda untuk memulai."
          action={
            <Button variant="primary" icon={<Plus />} onClick={() => navigate('/events/create')}>
              Buat Event
            </Button>
          }
        />
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Event"
        message={`Apakah Anda yakin ingin menghapus event "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
      />
    </div>
  );
}
