import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import Button from '../components/common/Button';

const Login = () => {
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Where to redirect after successful login
  const from = location.state?.from?.pathname || '/';

  const getDashboardPath = (role) => {
    const r = role?.toLowerCase();
    if (r === 'admin') return '/admin';
    if (r === 'owner' || r === 'agency') return '/owner';
    return '/tenant';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showNotification('Please fill in all fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      const userData = await login(email, password);
      showNotification(`Welcome back, ${userData.full_name}!`, 'success');
      
      // If there's a saved redirect path, use it. Otherwise, go to dashboard.
      if (from !== '/') {
        navigate(from, { replace: true });
      } else {
        navigate(getDashboardPath(userData.role), { replace: true });
      }
    } catch (err) {
      showNotification(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-2xl shadow-lg shadow-emerald-500/20 mb-4">
            T
          </Link>
          <h2 className="text-3xl font-extrabold font-display text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to access your Thikana account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Password</label>
                <a href="#" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">Forgot Password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full py-3 rounded-xl justify-center text-sm font-bold shadow-md shadow-emerald-600/10"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>

          {/* Register Link */}
          <div className="text-center pt-2">
            <p className="text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="inline-flex items-center gap-0.5 font-bold text-emerald-650 hover:text-emerald-700">
                Register here
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
