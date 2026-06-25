import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock, User, MapPin, Clipboard, ArrowRight, CheckCircle2 } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import Button from '../components/common/Button';

const Register = () => {
  const { register } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('tenant');
  const [fullName, setFullName] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    // clear NID if role is agency since trade license will be uploaded later
    if (selectedRole === 'agency') {
      setNidNumber('');
    }
  };

  const validateForm = () => {
    if (!email || !phone || !password || !fullName || !address) {
      showNotification('Please fill in all required fields (*)', 'warning');
      return false;
    }

    // Phone validation
    const phoneRegex = /^(?:\+8801|01)[3-9]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      showNotification('Please enter a valid Bangladeshi phone number (e.g. 01712345678)', 'warning');
      return false;
    }

    // Password length
    if (password.length < 6) {
      showNotification('Password must be at least 6 characters long', 'warning');
      return false;
    }

    // NID validation (required for tenant/owner)
    if (role !== 'agency') {
      if (!nidNumber) {
        showNotification('NID number is required for Tenant and Owner accounts', 'warning');
        return false;
      }
      const nidRegex = /^\d{10}$|^\d{13}$|^\d{17}$/;
      if (!nidRegex.test(nidNumber)) {
        showNotification('NID number must be exactly 10, 13, or 17 digits', 'warning');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const payload = {
      email,
      phone,
      password,
      role,
      fullName,
      address,
      bio
    };

    if (role !== 'agency') {
      payload.nidNumber = nidNumber;
    }

    try {
      await register(payload);
      showNotification('Registration successful! Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      showNotification(err.message || 'Registration failed. Email or phone might already be registered.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-2xl shadow-lg shadow-emerald-500/20 mb-4">
            T
          </Link>
          <h2 className="text-3xl font-extrabold font-display text-slate-800 tracking-tight">Create an Account</h2>
          <p className="mt-2 text-sm text-slate-400">Join the smart rental management platform</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role selector cards */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Select Account Type</label>
            <div className="grid grid-cols-3 gap-3">
              {['tenant', 'owner', 'agency'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleChange(r)}
                  className={`p-3 text-center border-2 rounded-xl transition-all flex flex-col items-center gap-1 focus:outline-none ${
                    role === r
                      ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="text-sm font-extrabold capitalize">{r}</span>
                  <span className="text-[10px] text-slate-400 capitalize hidden sm:inline">
                    {r === 'tenant' ? 'Looking to Rent' : r === 'owner' ? 'Listing Owner' : 'Agent / Agency'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahim Rahman"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address *</label>
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

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 01712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* NID (Tenant / Owner only) */}
            {role !== 'agency' && (
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">NID Number *</label>
                <div className="relative">
                  <Clipboard className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="10, 13, or 17 digit National ID number"
                    value={nidNumber}
                    onChange={(e) => setNidNumber(e.target.value.replace(/\D/g, ''))} // digit only
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Address */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Address *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Full address (e.g. House 12, Road 5, Gulshan 1, Dhaka)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Bio / Description</label>
              <textarea
                placeholder="Tell us about yourself (e.g. Student looking for flatmate, Landlord with family properties, Agency since 2015...)"
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              ></textarea>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full py-3 rounded-xl justify-center text-sm font-bold shadow-md shadow-emerald-600/10"
          >
            Create Account
          </Button>

          {/* Login Link */}
          <div className="text-center pt-2">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="inline-flex items-center gap-0.5 font-bold text-emerald-650 hover:text-emerald-700">
                Sign in here
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
