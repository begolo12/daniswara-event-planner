import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Upload,
  FileText,
  Link as LinkIcon,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/formatters';

const PRIORITY_COLORS = {
  high: 'red', medium: 'orange', low: 'green', urgent: 'red',
};
const PRIORITY_LABELS = {
  high: 'Tinggi', medium: 'Sedang', low: 'Rendah', urgent: 'Urgent',
};

const STATUS_FILTERS = [
  { value: '', label: 'Semua' },
  { value: 'ongoing', label: 'Berlangsung' },
  { value: 'completed', label: 'Selesai' },
];

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/my-tasks');
      setTasks(res.data?.data || []);
    } catch {
      toast.error('Gagal memuat tugas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const filtered = useMemo(() => {
    let result = tasks;
    if (filterStatus === 'completed') result = result.filter((t) => t.status === 'completed' || t.progress === 100);
    else if (filterStatus === 'ongoing') result = result.filter((t) => t.status !== 'completed' && t.progress !== 100);
    return result.sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priority] ?? 4;
      const pb = PRIORITY_ORDER[b.priority] ?? 4;
      return pa - pb;
    });
  }, [tasks, filterStatus]);

  const updateProgress = async (taskId, progress) => {
    setUpdatingId(taskId);
    try {
      await api.put(`/my-tasks/${taskId}/progress`, { progress });
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, progress } : t));
      toast.success('Progress diperbarui');
    } catch {
      toast.error('Gagal memperbarui progress');
    } finally {
      setUpdatingId(null);
    }
  };

  const markComplete = async (taskId) => {
    setUpdatingId(taskId);
    try {
      await api.put(`/my-tasks/${taskId}/progress`, { progress: 100, status: 'completed' });
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, progress: 100, status: 'completed' } : t));
      toast.success('Tugas selesai!');
    } catch {
      toast.error('Gagal menandai selesai');
    } finally {
      setUpdatingId(null);
    }
  };

  const uploadProof = async (taskId, file) => {
    if (!file) return;
    setUpdatingId(taskId);
    try {
      const formData = new FormData();
      formData.append('proof', file);
      await api.post(`/my-tasks/${taskId}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Bukti berhasil diupload');
      fetchTasks();
    } catch {
      toast.error('Gagal upload bukti');
    } finally {
      setUpdatingId(null);
    }
  };

  const saveNotes = async (taskId, notes) => {
    try {
      await api.put(`/my-tasks/${taskId}`, { notes });
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-dark-900">Tugas Saya</h1>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-dark-400" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === f.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-dark-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Tidak ada tugas"
          message="Saat ini tidak ada tugas yang ditugaskan untuk Anda."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              updating={updatingId === task.id}
              onProgressChange={(val) => updateProgress(task.id, val)}
              onComplete={() => markComplete(task.id)}
              onUploadProof={(file) => uploadProof(task.id, file)}
              onNotesBlur={(notes) => saveNotes(task.id, notes)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, updating, onProgressChange, onComplete, onUploadProof, onNotesBlur }) {
  const fileRef = useRef(null);
  const [notes, setNotes] = useState(task.notes || '');
  const progress = task.progress || 0;
  const isComplete = progress === 100 || task.status === 'completed';

  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 border transition-colors ${
      isComplete ? 'border-green-200 bg-green-50/30' : 'border-gray-100'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isComplete ? (
              <CheckCircle2 size={18} className="text-green-500 shrink-0" />
            ) : (
              <Circle size={18} className="text-dark-300 shrink-0" />
            )}
            <h3 className={`text-sm font-semibold truncate ${isComplete ? 'text-green-700' : 'text-dark-900'}`}>
              {task.title}
            </h3>
          </div>

          {(task.Event?.name || task.event_name || task.eventName) && (
            <div className="flex items-center gap-1.5 ml-6 mb-1">
              <LinkIcon size={12} className="text-dark-400" />
              <span className="text-xs text-dark-500 truncate">{task.Event?.name || task.event_name || task.eventName}</span>
            </div>
          )}

          {task.description && (
            <p className="text-xs text-dark-500 ml-6 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {task.deadline && (
            <span className={`text-xs flex items-center gap-1 ${
              new Date(task.deadline) < new Date() && !isComplete ? 'text-red-500' : 'text-dark-400'
            }`}>
              <Clock size={12} />
              {formatDate(task.deadline)}
            </span>
          )}
          <Badge color={PRIORITY_COLORS[task.priority] || 'gray'} size="sm">
            {PRIORITY_LABELS[task.priority] || task.priority}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4 ml-6">
        <div className="flex items-center gap-3 mb-1">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => onProgressChange(parseInt(e.target.value))}
            disabled={updating || isComplete}
            className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-brand-600 disabled:opacity-50"
          />
          <span className="text-xs font-medium text-dark-600 w-10 text-right">{progress}%</span>
        </div>
        <ProgressBar value={progress} color={isComplete ? 'green' : 'brand'} size="sm" />
      </div>

      {/* Actions row */}
      <div className="mt-4 ml-6 flex flex-wrap items-center gap-2">
        {/* Upload proof */}
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => onUploadProof(e.target.files?.[0])}
          accept=".jpg,.jpeg,.png,.pdf"
        />
        <Button
          size="sm"
          variant="outline"
          icon={<Upload size={14} />}
          onClick={() => fileRef.current?.click()}
          disabled={updating}
        >
          Upload Bukti
        </Button>
        {(task.proof_url || task.proof_file || task.proof) && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <FileText size={12} /> Bukti terupload
          </span>
        )}

        {/* Mark complete */}
        {!isComplete && (
          <Button
            size="sm"
            variant="secondary"
            icon={<CheckCircle2 size={14} />}
            onClick={onComplete}
            loading={updating}
          >
            Tandai Selesai
          </Button>
        )}
      </div>

      {/* Notes */}
      <div className="mt-3 ml-6">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => saveNotes(task.id, notes)}
          placeholder="Catatan..."
          rows={2}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-dark-700 placeholder-dark-400 resize-none
            focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>
    </div>
  );
}
