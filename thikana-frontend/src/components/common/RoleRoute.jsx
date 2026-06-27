import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent shadow-md"></div>
          <p className="text-slate-500 font-medium animate-pulse">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toLowerCase() || '';
  const rolesArray = Array.isArray(allowedRoles)
    ? allowedRoles.map(r => r.toLowerCase())
    : [allowedRoles.toLowerCase()];

  if (!rolesArray.includes(userRole)) {
    // If the user's role is not authorized, redirect to home page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
