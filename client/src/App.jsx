import { Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import EventListPage from './pages/events/EventListPage';
import EventCreatePage from './pages/events/EventCreatePage';
import EventCreateAIPage from './pages/events/EventCreateAIPage';
import EventDetailPage from './pages/events/EventDetailPage';
import EventTimelinePage from './pages/events/EventTimelinePage';
import EventRundownPage from './pages/events/EventRundownPage';
import EventChecklistPage from './pages/events/EventChecklistPage';
import EventTaskPage from './pages/events/EventTaskPage';
import EventBudgetPage from './pages/events/EventBudgetPage';
import EventVendorPage from './pages/events/EventVendorPage';
import EventDocumentPage from './pages/events/EventDocumentPage';
import EventApprovalPage from './pages/events/EventApprovalPage';
import EventEvaluationPage from './pages/events/EventEvaluationPage';
import EventReportPage from './pages/events/EventReportPage';
import AIGeneratorCenterPage from './pages/ai/AIGeneratorCenterPage';
import CalendarPage from './pages/calendar/CalendarPage';
import MasterEventTypePage from './pages/master/MasterEventTypePage';
import MasterVendorPage from './pages/master/MasterVendorPage';
import MasterVenuePage from './pages/master/MasterVenuePage';
import MasterEquipmentPage from './pages/master/MasterEquipmentPage';
import AISettingsPage from './pages/settings/AISettingsPage';
import UserManagementPage from './pages/settings/UserManagementPage';
import MyTasksPage from './pages/my-tasks/MyTasksPage';
import ReportsPage from './pages/reports/ReportsPage';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          {/* Dashboard */}
          <Route path="/" element={<DashboardPage />} />

          {/* Events */}
          <Route path="/events" element={<EventListPage />} />
          <Route path="/events/create" element={<EventCreatePage />} />
          <Route path="/events/create-ai" element={<EventCreateAIPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/events/:id/timeline" element={<EventTimelinePage />} />
          <Route path="/events/:id/rundown" element={<EventRundownPage />} />
          <Route path="/events/:id/checklist" element={<EventChecklistPage />} />
          <Route path="/events/:id/tasks" element={<EventTaskPage />} />
          <Route path="/events/:id/budget" element={<EventBudgetPage />} />
          <Route path="/events/:id/vendors" element={<EventVendorPage />} />
          <Route path="/events/:id/documents" element={<EventDocumentPage />} />
          <Route path="/events/:id/approval" element={<EventApprovalPage />} />
          <Route path="/events/:id/evaluation" element={<EventEvaluationPage />} />
          <Route path="/events/:id/report" element={<EventReportPage />} />

          {/* AI & Tools */}
          <Route path="/ai-generator" element={<AIGeneratorCenterPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/my-tasks" element={<MyTasksPage />} />
          <Route path="/reports" element={<ReportsPage />} />

          {/* Master Data - Super Admin & Admin Event */}
          <Route element={<RequireRole roles={['super_admin', 'admin_event']} />}>
            <Route path="/master/event-types" element={<MasterEventTypePage />} />
            <Route path="/master/vendors" element={<MasterVendorPage />} />
            <Route path="/master/venues" element={<MasterVenuePage />} />
            <Route path="/master/equipments" element={<MasterEquipmentPage />} />
          </Route>

          {/* Settings - Super Admin only */}
          <Route element={<RequireRole roles={['super_admin']} />}>
            <Route path="/settings/ai" element={<AISettingsPage />} />
            <Route path="/settings/users" element={<UserManagementPage />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
