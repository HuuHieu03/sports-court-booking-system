import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../app/AppContext';

export const RequireManagerOrOwner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated, isManagerOrOwner } = useApp();
  const location = useLocation();

  if (!currentUser || !isAuthenticated) {
    const redirectParam = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectParam}`} replace />;
  }

  if (!isManagerOrOwner()) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
