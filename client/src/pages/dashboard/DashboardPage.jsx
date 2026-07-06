import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  PlayCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  TrendingUp,
  FileText,
  List,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import dashboardService from '../../services/dashboardService';
import StatCard from '../../components/dashboard/StatCard';
import EventCalendar from '../../components/dashboard/EventCalendar';
import BudgetChart from '../../components/dashboard/BudgetChart';
import TaskSummary from '../../components/dashboard/TaskSummary';
import QuickActions from '../../components/dashboard/QuickActions';
import EventCard from '../../components/event/EventCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Card from '../../components/ui/Card';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [upcoming, setUpcoming] = useState(null);
  const [overdue, setOverdue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, calRes, upRes, odRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getCalendar(),
          dashboardService.getUpcoming(),
          dashboardService.getOverdue(),
        ]);
        setStats(statsRes.data.data);
        setCalendar(calRes.data.data);
        setUpcoming(upRes.data.data);
        setOverdue(odRes.data.data);
      } catch {
        // errors silently handled
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Map API snake_case fields to display
  const totalEvents = stats?.total_events ?? 0;
  const running = stats?.running ?? 0;
  const completed = stats?.completed ?? 0;
  const pendingApproval = stats?.pending_approval ?? 0;
  const overdueTasks = stats?.overdue_tasks ?? 0;
  const totalBudget = stats?.total_budget ?? 0;
  const totalTasks = stats?.total_tasks ?? 0;
  const completedTasks = stats?.completed_tasks ?? 0;
  const taskCompletionRate = stats?.task_completion_rate ?? 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900">
          Selamat Datang, {user?.name || 'User'}
        </h1>
        <p className="text-sm text-dark-400 mt-1">{today}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={Calendar} label="Total Event" value={totalEvents} color="blue" />
        <StatCard icon={PlayCircle} label="Berlangsung" value={running} color="green" />
        <StatCard icon={CheckCircle} label="Selesai" value={completed} color="purple" />
        <StatCard icon={Clock} label="Menunggu Persetujuan" value={pendingApproval} color="yellow" />
        <StatCard icon={AlertCircle} label="Tugas Terlambat" value={overdueTasks} color="red" />
      </div>

      {/* Budget & Task Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs text-dark-400 mb-1">Total Budget</p>
          <p className="text-lg font-bold text-dark-900">
            Rp {Number(totalBudget).toLocaleString('id-ID')}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-dark-400 mb-1">Total Tugas</p>
          <p className="text-lg font-bold text-dark-900">{totalTasks}</p>
        </Card>
        <Card>
          <p className="text-xs text-dark-400 mb-1">Tugas Selesai</p>
          <p className="text-lg font-bold text-dark-900">{completedTasks}</p>
        </Card>
        <Card>
          <p className="text-xs text-dark-400 mb-1">Progress Tugas</p>
          <div className="flex items-end gap-2">
            <p className="text-lg font-bold text-dark-900">{taskCompletionRate}%</p>
            <div className="flex-1 bg-gray-200 rounded-full h-2 mb-1.5">
              <div
                className="bg-brand-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(taskCompletionRate, 100)}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-dark-900 mb-4">Ringkasan Budget</h2>
            <BudgetChart data={stats?.budget_breakdown || []} />
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-dark-900 mb-4">Event Mendatang</h2>
            {upcoming?.length > 0 ? (
              <div className="space-y-3">
                {upcoming.map((evt) => (
                  <EventCard
                    key={evt.id}
                    event={evt}
                    onClick={() => navigate(`/events/${evt.id}`)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-dark-400">Tidak ada event mendatang</p>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-dark-900 mb-4">Kalender</h2>
            <EventCalendar data={calendar} />
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-dark-900 mb-4">Ringkasan Tugas Terlambat</h2>
            <TaskSummary data={{
              total: totalTasks,
              completed: completedTasks,
              inProgress: totalTasks - completedTasks - overdueTasks,
              notStarted: overdueTasks,
            }} />
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
