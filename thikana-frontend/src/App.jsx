import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Security Guard Components
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyDetail from './pages/PropertyDetail';

// Dashboards
import TenantDashboard from './pages/tenant/TenantDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Configure TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes inside MainLayout (has Navbar & Footer) */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />
              </Route>

              {/* Tenant Dashboard (Protected & Role Restrained) */}
              <Route
                path="/tenant"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['tenant']}>
                      <TenantDashboard />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />

              {/* Owner / Agency Dashboard (Protected & Role Restrained) */}
              <Route
                path="/owner"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['owner', 'agency']}>
                      <OwnerDashboard />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />

              {/* Admin Dashboard (Protected & Role Restrained) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />

              {/* Wildcard Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export default App;
