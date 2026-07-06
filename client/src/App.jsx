import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy-loaded page components
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const EventListPage = lazy(() => import('./pages/events/EventListPage'));
const EventCreatePage = lazy(() => import('./pages/events/EventCreatePage'));
const EventEditPage = lazy(() => import('./pages/events/EventEditPage'));
const EventCreateAIPage = lazy(() => import('./pages/events/EventCreateAIPage'));
const EventDetailPage = lazy(() => import('./pages/events/EventDetailPage'));
const EventTimelinePage = lazy(() => import('./pages/events/EventTimelinePage'));
const EventRundownPage = lazy(() => import('./pages/events/EventRundownPage'));
const EventChecklistPage = lazy(() => import('./pages/events/EventChecklistPage'));
const EventTaskPage = lazy(() => import('./pages/events/EventTaskPage'));
const EventBudgetPage = lazy(() => import('./pages/events/EventBudgetPage'));
const EventVendorPage = lazy(() => import('./pages/events/EventVendorPage'));
const EventDocumentPage = lazy(() => import('./pages/events/EventDocumentPage'));
const EventApprovalPage = lazy(() => import('./pages/events/EventApprovalPage'));
const EventEvaluationPage = lazy(() => import('./pages/events/EventEvaluationPage'));
const EventReportPage = lazy(() => import('./pages/events/EventReportPage'));
const AIGeneratorCenterPage = lazy(() => import('./pages/ai/AIGeneratorCenterPage'));
const CalendarPage = lazy(() => import('./pages/calendar/CalendarPage'));
const MasterEventTypePage = lazy(() => import('./pages/master/MasterEventTypePage'));
const MasterVendorPage = lazy(() => import('./pages/master/MasterVendorPage'));
const MasterVenuePage = lazy(() => import('./pages/master/MasterVenuePage'));
const MasterEquipmentPage = lazy(() => import('./pages/master/MasterEquipmentPage'));
const AISettingsPage = lazy(() => import('./pages/settings/AISettingsPage'));
const UserManagementPage = lazy(() => import('./pages/settings/UserManagementPage'));
const MyTasksPage = lazy(() => import('./pages/my-tasks/MyTasksPage'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <LoadingSpinner size="md" />
  </div>
);

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <Suspense fallback={<PageLoader />}><LoginPage /></Suspense>
      } />

      {/* Protected routes */}
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          {/* Dashboard */}
          <Route path="/" element={
            <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>
          } />

          {/* Events */}
          <Route path="/events" element={
            <Suspense fallback={<PageLoader />}><EventListPage /></Suspense>
          } />
          <Route path="/events/create" element={
            <Suspense fallback={<PageLoader />}><EventCreatePage /></Suspense>
          } />
          <Route path="/events/create-ai" element={
            <Suspense fallback={<PageLoader />}><EventCreateAIPage /></Suspense>
          } />
          <Route path="/events/:id/edit" element={
            <Suspense fallback={<PageLoader />}><EventEditPage /></Suspense>
          } />
          <Route path="/events/:id" element={
            <Suspense fallback={<PageLoader />}><EventDetailPage /></Suspense>
          } />
          <Route path="/events/:id/timeline" element={
            <Suspense fallback={<PageLoader />}><EventTimelinePage /></Suspense>
          } />
          <Route path="/events/:id/rundown" element={
            <Suspense fallback={<PageLoader />}><EventRundownPage /></Suspense>
          } />
          <Route path="/events/:id/checklist" element={
            <Suspense fallback={<PageLoader />}><EventChecklistPage /></Suspense>
          } />
          <Route path="/events/:id/tasks" element={
            <Suspense fallback={<PageLoader />}><EventTaskPage /></Suspense>
          } />
          <Route path="/events/:id/budget" element={
            <Suspense fallback={<PageLoader />}><EventBudgetPage /></Suspense>
          } />
          <Route path="/events/:id/vendors" element={
            <Suspense fallback={<PageLoader />}><EventVendorPage /></Suspense>
          } />
          <Route path="/events/:id/documents" element={
            <Suspense fallback={<PageLoader />}><EventDocumentPage /></Suspense>
          } />
          <Route path="/events/:id/approval" element={
            <Suspense fallback={<PageLoader />}><EventApprovalPage /></Suspense>
          } />
          <Route path="/events/:id/evaluation" element={
            <Suspense fallback={<PageLoader />}><EventEvaluationPage /></Suspense>
          } />
          <Route path="/events/:id/report" element={
            <Suspense fallback={<PageLoader />}><EventReportPage /></Suspense>
          } />

          {/* AI & Tools */}
          <Route path="/ai-generator" element={
            <Suspense fallback={<PageLoader />}><AIGeneratorCenterPage /></Suspense>
          } />
          <Route path="/calendar" element={
            <Suspense fallback={<PageLoader />}><CalendarPage /></Suspense>
          } />
          <Route path="/my-tasks" element={
            <Suspense fallback={<PageLoader />}><MyTasksPage /></Suspense>
          } />
          <Route path="/reports" element={
            <Suspense fallback={<PageLoader />}><ReportsPage /></Suspense>
          } />

          {/* Master Data - Super Admin & Admin Event */}
          <Route element={<RequireRole roles={['super_admin', 'admin_event']} />}>
            <Route path="/master/event-types" element={
              <Suspense fallback={<PageLoader />}><MasterEventTypePage /></Suspense>
            } />
            <Route path="/master/vendors" element={
              <Suspense fallback={<PageLoader />}><MasterVendorPage /></Suspense>
            } />
            <Route path="/master/venues" element={
              <Suspense fallback={<PageLoader />}><MasterVenuePage /></Suspense>
            } />
            <Route path="/master/equipments" element={
              <Suspense fallback={<PageLoader />}><MasterEquipmentPage /></Suspense>
            } />
          </Route>

          {/* Settings - Super Admin only */}
          <Route element={<RequireRole roles={['super_admin']} />}>
            <Route path="/settings/ai" element={
              <Suspense fallback={<PageLoader />}><AISettingsPage /></Suspense>
            } />
            <Route path="/settings/users" element={
              <Suspense fallback={<PageLoader />}><UserManagementPage /></Suspense>
            } />
          </Route>
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
