import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Heart, MessageSquare, LayoutDashboard, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Button from './Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
  await logout();
  setShowDropdown(false);
  setIsOpen(false);
  setShowLogoutModal(false);
  navigate('/login');
};

  const openLogoutModal = () => {
    setShowDropdown(false);
    setIsOpen(false);
    setShowLogoutModal(true);
  };

  const getDashboardPath = () => {
    if (!user) return '/';

    const role = user.role?.toLowerCase();

    if (role === 'admin') return '/admin';
    if (role === 'owner' || role === 'agency') return '/owner';

    return '/tenant';
  };

  const getDisplayName = () => {
    if (!user) return '';
    const role = user.role?.toLowerCase();
    if (role === 'agency') {
      return user.company_name || user.email || user.phone || '';
    }
    return user.full_name || user.email || user.phone || '';
  };

  const activeUserAvatar =
    user?.avatar_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      getDisplayName() || 'U'
    )}`;

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Logo & Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xl shadow-md shadow-emerald-500/20">
                  T
                </span>

                <span className="font-display text-2xl font-bold tracking-tight text-slate-800">
                  THIKANA
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:gap-6">
              <Link
                to="/"
                className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors"
              >
                Find Properties
              </Link>

              {user ? (
                <div className="flex items-center gap-4">
                  <Link
                    to={`${getDashboardPath()}?tab=favorites`}
                    className="p-2 text-slate-500 hover:text-rose-500 hover:bg-slate-50 rounded-lg transition-all"
                    title="Favorites"
                  >
                    <Heart className="w-5 h-5" />
                  </Link>

                  <Link
                    to={`${getDashboardPath()}?tab=messages`}
                    className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-slate-50 rounded-lg transition-all"
                    title="Conversations"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Link>

                  {/* User Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-all focus:outline-none"
                    >
                      <img
                        src={activeUserAvatar}
                        alt={getDisplayName()}
                        className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                      />

                      <span className="text-sm font-semibold text-slate-700 max-w-[120px] truncate">
                        {getDisplayName()?.split(' ')[0]}
                      </span>
                    </button>

                    {showDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowDropdown(false)}
                        ></div>

                        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5 z-20 transition-all">
                          <div className="px-3 py-2 border-b border-slate-50 mb-1">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {getDisplayName()}
                            </p>

                            <p className="text-xs text-slate-400 truncate capitalize">
                              {user.role}
                            </p>
                          </div>

                          <Link
                            to={getDashboardPath()}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                            onClick={() => setShowDropdown(false)}
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>

                          <Link
                            to="/profile"
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors mt-1"
                            onClick={() => setShowDropdown(false)}
                          >
                            <User className="w-4 h-4" />
                            My Profile
                          </Link>

                          <button
                            type="button"
                            onClick={openLogoutModal}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors mt-1"
                          >
                            <LogOut className="w-4 h-4" />
                            Log Out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Log In
                    </Button>
                  </Link>

                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-500 hover:text-slate-600 focus:outline-none p-1"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 py-3 space-y-3 shadow-lg">
            <Link
              to="/"
              className="block text-base font-semibold text-slate-700 hover:text-emerald-600 py-1"
              onClick={() => setIsOpen(false)}
            >
              Find Properties
            </Link>

            {user ? (
              <div className="border-t border-slate-100 pt-3 space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <img
                    src={activeUserAvatar}
                    alt={getDisplayName()}
                    className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                  />

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {getDisplayName()}
                    </p>

                    <p className="text-xs text-slate-400 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>

                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 text-base font-medium text-slate-700 hover:text-emerald-600 py-1"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5 text-slate-400" />
                  Dashboard
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-base font-medium text-slate-700 hover:text-emerald-600 py-1"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-5 h-5 text-slate-400" />
                  My Profile
                </Link>

                <button
                  type="button"
                  onClick={openLogoutModal}
                  className="flex w-full items-center gap-2 text-base font-medium text-red-600 hover:text-red-700 py-1"
                >
                  <LogOut className="w-5 h-5 text-red-400" />
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full">
                    Log In
                  </Button>
                </Link>

                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  <Button variant="primary" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[99999] flex min-h-screen items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4">
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
    </>
  );
};

export default Navbar;