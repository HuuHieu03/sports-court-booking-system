import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { CustomerLayout } from '../components/layouts/CustomerLayout';
import { PortalLayout } from '../components/layouts/PortalLayout';
import { AdminLayout } from '../components/layouts/AdminLayout';

// Guards
import { RequireAuth } from './guards/RequireAuth';
import { RequireRole } from './guards/RequireRole';
import { RequireManagerOrOwner } from './guards/RequireManagerOrOwner';

// Pages
import { ExplorePage } from '../modules/venues/pages/ExplorePage';
import { VenueDetailPage } from '../modules/venues/pages/VenueDetailPage';
import { MyBookingsPage } from '../modules/bookings/pages/MyBookingsPage';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { RegisterPage } from '../modules/auth/pages/RegisterPage';
import { ManagerSchedulePage } from '../modules/bookings/pages/ManagerSchedulePage';
import { ManagerCourtsPage } from '../modules/venues/pages/ManagerCourtsPage';
import { OwnerVenuesPage } from '../modules/venues/pages/OwnerVenuesPage';
import { OwnerStaffingPage } from '../modules/staffing/pages/OwnerStaffingPage';
import { AdminUsersPage } from '../modules/users/pages/AdminUsersPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public & Customer Portal Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<ExplorePage />} />
        <Route path="/venues/:id" element={<VenueDetailPage />} />
        <Route
          path="/my-bookings"
          element={
            <RequireAuth>
              <MyBookingsPage />
            </RequireAuth>
          }
        />
      </Route>

      {/* Standalone Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Operational Manager Routes (Manager or Owner) */}
      <Route
        path="/manage"
        element={
          <RequireManagerOrOwner>
            <PortalLayout />
          </RequireManagerOrOwner>
        }
      >
        <Route index element={<Navigate to="/manage/schedule" replace />} />
        <Route path="schedule" element={<ManagerSchedulePage />} />
        <Route path="courts" element={<ManagerCourtsPage />} />
      </Route>

      {/* Owner Workspace Routes (Owner Only) */}
      <Route
        path="/owner"
        element={
          <RequireRole allowedRoles={['OWNER']}>
            <PortalLayout />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="/owner/venues" replace />} />
        <Route path="venues" element={<OwnerVenuesPage />} />
        <Route path="staffing" element={<OwnerStaffingPage />} />
      </Route>

      {/* Enterprise Admin Console Routes (Admin Only) */}
      <Route
        path="/admin"
        element={
          <RequireRole allowedRoles={['ADMIN']}>
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="/admin/users" replace />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>

      {/* Error & Fallback Routes */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
