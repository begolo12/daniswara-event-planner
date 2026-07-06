import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { tasks } from '../../services/eventSubService';
import { PRIORITIES, TASK_STATUSES } from '../../utils/constants';
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

const initialTask = {
  task_name: '',
  description: '',
  pic_id: '',
  deadline: '',
  priority: 'medium',
  progress: 0,
  notes: '',
};

const priorityOptions = Object.entries(PRIORITIES).map(([k, v]) => ({ value: k, label: v.label }));
const statusOptions = Object.entries(TASK_STATUSES).map(([k, v]) => ({ value: k, label: v.label }));

export default function EventTaskPage() {
  const { id: eventId } = useParams();
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(initialTask);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterPIC, setFilterPIC] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const res = await tasks.list(eventId);
      setTaskList(res.data.data || []);
    } catch {
      toast.error('Gagal memuat tugas');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const openAdd = () => {
    setEditingTask(null);
    setForm(initialTask);
    setShowAddModal(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      task_name: task.task_name || '',
      description: task.description || '',
      pic_id: task.pic_id || '',
      deadline: task.deadline ? task.deadline.slice(0, 10) : '',
      priority: task.priority || 'medium',
      progress: task.progress || 0,
      notes: task.notes || '',
    });
    setShowAddModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.task_name.trim()) {
      toast.error('Nama tugas wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        task_name: form.task_name,
        description: form.description,
        pic_id: form.pic_id ? Number(form.pic_id) : null,
        deadline: form.deadline || null,
        priority: form.priority,
        progress: Number(form.progress),
        notes: form.notes,
      };
      if (editingTask) {
        await tasks.update(eventId, editingTask.id, payload);
        toast.success('Tugas berhasil diperbarui');
      } else {
        await tasks.create(eventId, payload);
        toast.success('Tugas berhasil ditambahkan');
      }
      setShowAddModal(false);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan tugas');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await tasks.delete(eventId, deleteTarget.id);
      toast.success('Tugas berhasil dihapus');
      setDeleteTarget(null);
      fetchTasks();
    } catch {
      toast.error('Gagal menghapus tugas');
    }
  };

  const handleProgressUpdate = async (task, progress) => {
    try {
      await tasks.updateProgress(eventId, task.id, progress);
      fetchTasks();
    } catch {
      toast.error('Gagal update progress');
    }
  };

  // Unique PIC IDs for filter
  const uniquePICs = [...new Set(taskList.map((t) => t.pic_id).filter(Boolean))];

  // Filter
  const filteredTasks = taskList.filter((t) => {
    if (filterPIC && String(t.pic_id) !== filterPIC) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  // Group by status
  const grouped = {
    not_started: filteredTasks.filter((t) => t.status === 'not_started' || (!t.status && t.progress === 0)),
    in_progress: filteredTasks.filter((t) => t.status === 'in_progress' || (t.progress > 0 && t.progress < 100)),
    done: filteredTasks.filter((t) => t.status === 'done' || t.progress === 100),
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
        <h2 className="text-xl font-semibold text-dark-900">Tugas Event</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterPIC}
            onChange={(e) => setFilterPIC(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Semua PIC</option>
            {uniquePICs.map((p) => (
              <option key={p} value={p}>PIC #{p}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Semua Prioritas</option>
            {priorityOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <Button variant="primary" size="sm" icon={<Plus />} onClick={openAdd}>
            Tambah Tugas
          </Button>
        </div>
      </div>

      {/* Task Board */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="Belum ada tugas"
          message="Tambahkan tugas untuk event ini."
          action={<Button variant="primary" icon={<Plus />} onClick={openAdd}>Tambah Tugas</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'not_started', label: 'Belum Dikerjakan', color: 'gray' },
            { key: 'in_progress', label: 'Sedang Dikerjakan', color: 'blue' },
            { key: 'done', label: 'Selesai', color: 'green' },
          ].map((col) => (
            <div key={col.key} className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-dark-700 mb-3 flex items-center gap-2">
                {TASK_STATUSES[col.key] && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    col.key === 'done' ? 'bg-green-100 text-green-700' :
                    col.key === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {TASK_STATUSES[col.key].label}
                  </span>
                )}
                <span className="text-dark-400">({grouped[col.key]?.length || 0})</span>
              </h3>
              <div className="space-y-2">
                {(grouped[col.key] || []).map((task) => (
                  <Card key={task.id} padding="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark-900">{task.task_name}</p>
                        {task.description && (
                          <p className="text-xs text-dark-400 mt-1 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                            task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {PRIORITIES[task.priority]?.label || task.priority}
                          </span>
                          {task.pic_id && (
                            <span className="text-xs text-dark-400">PIC #{task.pic_id}</span>
                          )}
                        </div>
                        {task.deadline && (
                          <p className="text-xs text-dark-400 mt-1">Deadline: {formatDate(task.deadline)}</p>
                        )}
                        {/* Progress bar */}
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  (task.progress || 0) === 100 ? 'bg-green-500' : 'bg-brand-600'
                                }`}
                                style={{ width: `${task.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-dark-500 w-8 text-right">{task.progress || 0}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={task.progress || 0}
                            onChange={(e) => handleProgressUpdate(task, Number(e.target.value))}
                            className="w-full h-1 mt-1 accent-brand-600"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button onClick={() => openEdit(task)} className="p-1 rounded text-dark-400 hover:text-blue-600 transition-colors">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(task)} className="p-1 rounded text-dark-400 hover:text-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingTask ? 'Edit Tugas' : 'Tambah Tugas'}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={submitting}>Batal</Button>
            <Button variant="primary" loading={submitting} onClick={handleSubmit}>
              {editingTask ? 'Simpan' : 'Tambah'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Nama Tugas" name="task_name" value={form.task_name} onChange={handleChange} required placeholder="Judul tugas" />
          <FormTextarea label="Deskripsi" name="description" value={form.description} onChange={handleChange} placeholder="Deskripsi tugas" rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="PIC ID" name="pic_id" type="number" value={form.pic_id} onChange={handleChange} placeholder="ID penanggung jawab" />
            <FormInput label="Deadline" name="deadline" type="date" value={form.deadline} onChange={handleChange} />
          </div>
          <FormSelect label="Prioritas" name="priority" value={form.priority} onChange={handleChange} options={priorityOptions} />
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">
              Progress: {form.progress}%
            </label>
            <input
              type="range"
              name="progress"
              min="0"
              max="100"
              value={form.progress}
              onChange={handleChange}
              className="w-full accent-brand-600"
            />
          </div>
          <FormTextarea label="Catatan" name="notes" value={form.notes} onChange={handleChange} placeholder="Catatan tugas" rows={2} />
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Tugas"
        message={`Hapus tugas "${deleteTarget?.task_name}"?`}
        confirmText="Hapus"
      />
    </div>
  );
}
