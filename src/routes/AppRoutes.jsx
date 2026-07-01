import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import FirstLoginRoute from './FirstLoginRoute';
import AdminLayout from '../components/layouts/AdminLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ROUTES } from '../constants/routes';

const LoginPage         = lazy(() => import('../pages/auth/LoginPage'));
const ChangePasswordPage = lazy(() => import('../pages/auth/ChangePasswordPage'));
const DashboardPage     = lazy(() => import('../pages/admin/DashboardPage'));
const VendeursPage      = lazy(() => import('../pages/admin/VendeursPage'));
const AcheteursPage     = lazy(() => import('../pages/admin/AcheteursPage'));
const ProduitsPage      = lazy(() => import('../pages/admin/ProduitsPage'));
const CategoriesPage    = lazy(() => import('../pages/admin/CategoriesPage'));
const CommandesPage     = lazy(() => import('../pages/admin/CommandesPage'));
const PaiementsPage     = lazy(() => import('../pages/admin/PaiementsPage'));
const AbonnementsPage   = lazy(() => import('../pages/admin/AbonnementsPage'));
const ModerationPage    = lazy(() => import('../pages/admin/ModerationPage'));
const SignalementsPage  = lazy(() => import('../pages/admin/SignalementsPage'));
const ConfigPage        = lazy(() => import('../pages/admin/ConfigPage'));
const AdminsPage        = lazy(() => import('../pages/admin/AdminsPage'));
const MenusPage         = lazy(() => import('../pages/admin/MenusPage'));
const RetoursPage       = lazy(() => import('../pages/admin/RetoursPage'));
const AuditLogsPage     = lazy(() => import('../pages/admin/AuditLogsPage'));
const NotificationGlobalePage = lazy(() => import('../pages/admin/NotificationGlobalePage'));

export default function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner fullPage />}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path={ROUTES.LOGIN} element={
              <ErrorBoundary><LoginPage /></ErrorBoundary>
            } />
          </Route>

          {/* Route changement mdp — accessible si connecté même avec isFirstLogin=true */}
          <Route element={<FirstLoginRoute />}>
            <Route path={ROUTES.CHANGE_PASSWORD} element={
              <ErrorBoundary><ChangePasswordPage /></ErrorBoundary>
            } />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path={ROUTES.DASHBOARD}    element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
              <Route path={ROUTES.VENDEURS}     element={<ErrorBoundary><VendeursPage /></ErrorBoundary>} />
              <Route path={ROUTES.ACHETEURS}    element={<ErrorBoundary><AcheteursPage /></ErrorBoundary>} />
              <Route path={ROUTES.PRODUITS}     element={<ErrorBoundary><ProduitsPage /></ErrorBoundary>} />
              <Route path={ROUTES.CATEGORIES}   element={<ErrorBoundary><CategoriesPage /></ErrorBoundary>} />
              <Route path={ROUTES.COMMANDES}    element={<ErrorBoundary><CommandesPage /></ErrorBoundary>} />
              <Route path={ROUTES.PAIEMENTS}    element={<ErrorBoundary><PaiementsPage /></ErrorBoundary>} />
              <Route path={ROUTES.ABONNEMENTS}  element={<ErrorBoundary><AbonnementsPage /></ErrorBoundary>} />
              <Route path={ROUTES.MODERATION}   element={<ErrorBoundary><ModerationPage /></ErrorBoundary>} />
              <Route path={ROUTES.SIGNALEMENTS} element={<ErrorBoundary><SignalementsPage /></ErrorBoundary>} />
              <Route path={ROUTES.ADMINS}       element={<ErrorBoundary><AdminsPage /></ErrorBoundary>} />
              <Route path={ROUTES.MENUS}        element={<ErrorBoundary><MenusPage /></ErrorBoundary>} />
              <Route path={ROUTES.CONFIG}       element={<ErrorBoundary><ConfigPage /></ErrorBoundary>} />
              <Route path={ROUTES.RETOURS}      element={<ErrorBoundary><RetoursPage /></ErrorBoundary>} />
              <Route path={ROUTES.AUDIT_LOGS}   element={<ErrorBoundary><AuditLogsPage /></ErrorBoundary>} />
              <Route path={ROUTES.NOTIFICATION_GLOBALE} element={<ErrorBoundary><NotificationGlobalePage /></ErrorBoundary>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
