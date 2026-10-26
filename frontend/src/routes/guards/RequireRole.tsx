import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../app/AppContext';

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: Array<'USER' | 'OWNER' | 'ADMIN'>;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ children, allowedRoles }) => {
  const { currentUser, isAuthenticated } = useApp();
  const location = useLocation();

  if (!currentUser || !isAuthenticated) {
    const redirectParam = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectParam}`} replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
