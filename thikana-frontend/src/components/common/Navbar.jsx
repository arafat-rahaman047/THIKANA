import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Heart, MessageSquare, LayoutDashboard } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Button from './Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    setIsOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    const role = user.role?.toLowerCase();
    if (role === 'admin') return '/admin';
    if (role === 'owner' || role === 'agency') return '/owner';
    return '/tenant';
  };

  const activeUserAvatar = user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.full_name || 'U')}`;

  return (
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
            <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
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
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-all focus:outline-none"
                  >
                    <img
                      src={activeUserAvatar}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                    />
                    <span className="text-sm font-semibold text-slate-700 max-w-[120px] truncate">
                      {user.full_name?.split(' ')[0]}
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
                          <p className="text-sm font-bold text-slate-800 truncate">{user.full_name}</p>
                          <p className="text-xs text-slate-400 truncate capitalize">{user.role}</p>
                        </div>
                        <Link
                          to={getDashboardPath()}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                          onClick={() => setShowDropdown(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
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
                  alt={user.full_name}
                  className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800">{user.full_name}</p>
                  <p className="text-xs text-slate-400 capitalize">{user.role}</p>
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
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 text-base font-medium text-red-600 hover:text-red-700 py-1"
              >
                <LogOut className="w-5 h-5 text-red-400" />
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <Link to="/login" onClick={() => setIsOpen(false)} className="w-full">
                <Button variant="outline" className="w-full">
                  Log In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="w-full">
                <Button variant="primary" className="w-full">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
