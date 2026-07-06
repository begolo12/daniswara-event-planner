import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  PlayCircle,
  CheckCircle,
  Clock,
  AlertCircle,
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
        <StatCard icon={Calendar} label="Total Event" value={stats?.totalEvents ?? 0} color="blue" />
        <StatCard icon={PlayCircle} label="Berlangsung" value={stats?.running ?? 0} color="green" />
        <StatCard icon={CheckCircle} label="Selesai" value={stats?.completed ?? 0} color="purple" />
        <StatCard icon={Clock} label="Menunggu Persetujuan" value={stats?.pendingApproval ?? 0} color="yellow" />
        <StatCard icon={AlertCircle} label="Terlambat" value={stats?.overdue ?? 0} color="red" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-dark-900 mb-4">Anggaran</h2>
            <BudgetChart data={stats?.budget} />
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
            <h2 className="text-lg font-semibold text-dark-900 mb-4">Ringkasan Tugas</h2>
            <TaskSummary overdue={overdue} />
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
