import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, ShieldCheck, AlertCircle, Menu, X, ArrowLeft, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const DashboardLayout = ({ title, tabs = [], activeTab, setActiveTab, children }) => {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
  await logout();
  navigate('/login');
};
  const openLogoutModal = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setSidebarOpen(false);
  setShowLogoutModal(true);
};

  const getRoleLabel = () => {
    if (!user) return '';
    const role = user.role?.toLowerCase();
    if (role === 'admin') return 'System Administrator';
    if (role === 'agency') return 'Verified Agency';
    if (role === 'owner') return 'Property Owner';
    return 'Tenant Account';
  };

  const getDisplayName = () => {
    if (!user) return '';
    const role = user.role?.toLowerCase();
    if (role === 'agency') {
      return user.company_name || user.email || user.phone || '';
    }
    return user.full_name || user.email || user.phone || '';
  };

  const userAvatar = user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(getDisplayName() || 'U')}`;
  const isVerified = user?.is_verified === 1 || user?.is_verified === true;

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-800">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-lg shadow-md shadow-emerald-500/20">
            T
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-white">
            THIKANA
          </span>
        </Link>

        {/* User Card */}
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-800">
          <img
            src={userAvatar}
            alt={user?.full_name}
            className="w-12 h-12 rounded-full border border-slate-700 object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">{getDisplayName()}</p>
            <p className="text-xs text-slate-400 truncate mb-1">{getRoleLabel()}</p>
            
            {/* Verification Status Badge */}
            {isVerified ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/50">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/50">
                <AlertCircle className="w-3 h-3" />
                Unverified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
        <Link
          to="/profile"
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all"
        >
          <User className="w-5 h-5" />
          My Profile
        </Link>
        <Link
          to="/"
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
        <button
  type="button"
  onClick={openLogoutModal}
  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all"
>
  <LogOut className="w-5 h-5" />
  Log Out
</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden lg:block lg:w-64 xl:w-72 shrink-0 border-r border-slate-200">
        <div className="sticky top-0 h-screen">
          {renderSidebarContent()}
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile Drawer (hidden on desktop) */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-64 md:w-72 z-50 transition-transform duration-300 transform lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebarContent()}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {/* Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-lg hover:bg-slate-100 lg:hidden text-slate-500"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold font-display text-slate-800 truncate">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Portal Home
            </Link>
          </div>
        </header>

                {/* Dashboard Content Outlet */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {(() => {
            if (!user) return null;
            const role = user.role?.toLowerCase();
            const isIncomplete =
              ((role === 'tenant' || role === 'owner') && !user.full_name) ||
              (role === 'agency' && !user.company_name);
            if (!isIncomplete) return null;
            return (
              <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
                  <span className="text-sm font-semibold">
                    Please complete your profile to unlock all features of the platform.
                  </span>
                </div>
                <Link
                  to="/profile"
                  className="text-xs font-extrabold text-white bg-amber-600 hover:bg-amber-700 px-3.5 py-2 rounded-lg transition-colors text-center shrink-0 self-start sm:self-auto shadow-sm animate-pulse"
                >
                  Complete Profile
                </Link>
              </div>
            );
          })()}
          {children}
        </main>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-100">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center">
                <LogOut className="w-7 h-7 text-red-500" />
              </div>

              <h3 className="text-lg font-extrabold text-slate-800">
                Confirm Logout
              </h3>

              <p className="text-sm text-slate-500">
                Are you sure you want to log out from your THIKANA account?
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
