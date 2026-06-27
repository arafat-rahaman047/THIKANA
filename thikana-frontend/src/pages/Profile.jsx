import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, Mail, Phone, MapPin, Briefcase, Calendar, Globe, 
  Facebook, FileText, Camera, Shield, ShieldCheck, ArrowLeft, Save, Loader2 
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import userService from '../services/userService';
import { getMediaUrl } from '../utils/mediaUrl';
import Button from '../components/common/Button';

const Profile = () => {
  const { user, updateProfileState } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form states matching schema
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    contact_person_name: '',
    date_of_birth: '',
    gender: '',
    occupation: '',
    institution_name: '',
    student_id_number: '',
    emergency_contact: '',
    city: '',
    area: '',
    address: '',
    profile_visibility: 'public',
    website_url: '',
    facebook_url: '',
    office_address: '',
    business_registration_number: '',
    years_of_experience: '',
    bio: '',
    nid_number: ''
  });

  // Query private profile data
  const { data: profileRes, isLoading, isError } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: userService.getMe,
    enabled: !!user?.id
  });

  // Initialize form fields when profile data loads
  useEffect(() => {
    if (profileRes?.data) {
      const data = profileRes.data;
      
      // Formatting date of birth safely (YYYY-MM-DD)
      let formattedDob = '';
      if (data.date_of_birth) {
        try {
          formattedDob = new Date(data.date_of_birth).toISOString().split('T')[0];
        } catch (e) {
          formattedDob = data.date_of_birth;
        }
      }

      setFormData({
        full_name: data.full_name || '',
        company_name: data.company_name || '',
        contact_person_name: data.contact_person_name || '',
        date_of_birth: formattedDob,
        gender: data.gender || '',
        occupation: data.occupation || '',
        institution_name: data.institution_name || '',
        student_id_number: data.student_id_number || '',
        emergency_contact: data.emergency_contact || '',
        city: data.city || '',
        area: data.area || '',
        address: data.address || '',
        profile_visibility: data.profile_visibility || 'public',
        website_url: data.website_url || '',
        facebook_url: data.facebook_url || '',
        office_address: data.office_address || '',
        business_registration_number: data.business_registration_number || '',
        years_of_experience: data.years_of_experience !== null && data.years_of_experience !== undefined ? String(data.years_of_experience) : '',
        bio: data.bio || '',
        nid_number: data.nid_number || ''
      });

      if (data.avatar_url) {
        setAvatarPreview(getMediaUrl(data.avatar_url));
      }
    }
  }, [profileRes]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => userService.updateMe(data),
    onSuccess: (res) => {
      showNotification('Profile updated successfully!', 'success');
      // Update the AuthContext global state
      if (res?.data) {
        updateProfileState(res.data);
      }
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to update profile details', 'error');
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Avatar photo size must be smaller than 5MB', 'warning');
        return;
      }

      // Check file types
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        showNotification('Invalid file type. Only JPEG, JPG, PNG, WEBP, and GIF are allowed', 'warning');
        return;
      }

      setUploadingAvatar(true);
      // Quick local preview
      const reader = new FileReader();
      reader.onload = (upload) => {
        setAvatarPreview(upload.target.result);
      };
      reader.readAsDataURL(file);

      // Perform API upload
      const uploadForm = new FormData();
      uploadForm.append('avatar', file);

      try {
        const res = await userService.updateAvatar(uploadForm);
        showNotification('Profile photo uploaded successfully!', 'success');
        if (res?.data) {
          updateProfileState(res.data);
        }
        queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      } catch (err) {
        showNotification(err.message || 'Failed to upload profile photo', 'error');
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare payload
    const payload = { ...formData };

    // Format fields
    if (payload.years_of_experience) {
      payload.years_of_experience = parseInt(payload.years_of_experience, 10);
    } else {
      payload.years_of_experience = null;
    }

    if (payload.date_of_birth === '') {
      payload.date_of_birth = null;
    }

    updateProfileMutation.mutate(payload);
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    const role = user.role?.toLowerCase();
    if (role === 'admin') return '/admin';
    if (role === 'owner' || role === 'agency') return '/owner';
    return '/tenant';
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center flex-col gap-3">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-slate-500 font-bold text-sm">Retrieving your profile details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <Shield className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Error Loading Profile</h2>
        <p className="text-slate-500">We could not pull your profile details from the database. Please try logging in again.</p>
        <Button variant="primary" onClick={() => navigate(getDashboardPath())}>Return to Dashboard</Button>
      </div>
    );
  }

  const role = user?.role?.toLowerCase();
  const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    formData.full_name || formData.company_name || 'U'
  )}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <button 
            onClick={() => navigate(getDashboardPath())}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-extrabold text-slate-800 font-display">My Profile Settings</h1>
          <p className="text-slate-450 text-sm font-semibold">Configure your personal information, contact cards, and account visibility preferences.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Account Meta Details */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Profile Photo</h3>
            
            {/* Avatar container */}
            <div className="relative w-32 h-32 mx-auto group">
              <img 
                src={avatarPreview || fallbackAvatar} 
                alt="Profile Avatar" 
                className="w-full h-full rounded-full object-cover border-2 border-slate-100 shadow-md group-hover:opacity-85 transition-opacity"
              />
              
              {/* Upload Overlay */}
              <label 
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-slate-950/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-slate-800"
              >
                <div className="text-center text-white">
                  <Camera className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                </div>
              </label>

              <input 
                type="file" 
                id="avatar-upload" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                className="hidden" 
                disabled={uploadingAvatar}
              />

              {uploadingAvatar && (
                <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-800 text-base">
                {role === 'agency' ? formData.company_name || 'Agency Name' : formData.full_name || 'My Name'}
              </h4>
              <p className="text-xs text-slate-400 capitalize bg-slate-100 px-2 py-0.5 rounded-md font-semibold inline-block">
                {role} Role
              </p>
            </div>

            <div className="border-t border-slate-50 pt-4 text-left space-y-3.5">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate" title={user?.email}>{user?.email}</span>
                <span className="ml-auto text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1.5 py-0.5 bg-slate-50 rounded">Read-only</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{user?.phone || 'Not Provided'}</span>
                <span className="ml-auto text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1.5 py-0.5 bg-slate-50 rounded">Read-only</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-bold text-slate-500">Verification</span>
                {user?.is_verified ? (
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    Pending
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Visibility Preference Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Privacy Settings</h3>
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase">Profile Visibility</label>
              <select
                name="profile_visibility"
                value={formData.profile_visibility}
                onChange={handleInputChange}
                className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="public">Public (Everyone can see safe info)</option>
                <option value="limited">Limited (Hide bio and social URLs)</option>
              </select>
              <p className="text-[10px] text-slate-400 leading-normal">
                Setting your profile to "Limited" shields your biography, websites, and social links from the public directory page.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Editable profile forms */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold font-display text-slate-800 border-b border-slate-100 pb-4">
              Profile details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* RENDER TENANT / OWNER SPECIFIC FIELDS */}
              {(role === 'tenant' || role === 'owner') && (
                <>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        name="full_name" 
                        value={formData.full_name} 
                        onChange={handleInputChange} 
                        required
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="date" 
                        name="date_of_birth" 
                        value={formData.date_of_birth} 
                        onChange={handleInputChange} 
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Occupation</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        name="occupation" 
                        value={formData.occupation} 
                        onChange={handleInputChange} 
                        placeholder="Software Engineer / Student"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* RENDER TENANT ONLY SPECIFIC FIELDS */}
              {role === 'tenant' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Institution / University</label>
                    <input 
                      type="text" 
                      name="institution_name" 
                      value={formData.institution_name} 
                      onChange={handleInputChange} 
                      placeholder="University of Dhaka"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Student ID Number</label>
                    <input 
                      type="text" 
                      name="student_id_number" 
                      value={formData.student_id_number} 
                      onChange={handleInputChange} 
                      placeholder="STU-123456"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </>
              )}

              {/* RENDER OWNER SPECIFIC FIELDS */}
              {role === 'owner' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase">Years of Landlord Experience</label>
                  <input 
                    type="number" 
                    name="years_of_experience" 
                    value={formData.years_of_experience} 
                    onChange={handleInputChange} 
                    min="0"
                    placeholder="5"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              )}

              {/* RENDER AGENCY ONLY SPECIFIC FIELDS */}
              {role === 'agency' && (
                <>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Company Name *</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        name="company_name" 
                        value={formData.company_name} 
                        onChange={handleInputChange} 
                        required
                        placeholder="Apex Properties Ltd."
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Contact Person Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        name="contact_person_name" 
                        value={formData.contact_person_name} 
                        onChange={handleInputChange} 
                        placeholder="Manager Name"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Business Registration # (Trade License)</label>
                    <input 
                      type="text" 
                      name="business_registration_number" 
                      value={formData.business_registration_number} 
                      onChange={handleInputChange} 
                      placeholder="TR-1234567"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Office Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        name="office_address" 
                        value={formData.office_address} 
                        onChange={handleInputChange} 
                        placeholder="Suite 102, Gulshan Avenue"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Years of Real Estate Experience</label>
                    <input 
                      type="number" 
                      name="years_of_experience" 
                      value={formData.years_of_experience} 
                      onChange={handleInputChange} 
                      min="0"
                      placeholder="10"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Website URL</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="url" 
                        name="website_url" 
                        value={formData.website_url} 
                        onChange={handleInputChange} 
                        placeholder="https://myagency.com"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Facebook Page URL</label>
                    <div className="relative">
                      <Facebook className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="url" 
                        name="facebook_url" 
                        value={formData.facebook_url} 
                        onChange={handleInputChange} 
                        placeholder="https://facebook.com/myagency"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* SHARED ADDRESS DETAILS (ALL ROLES) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase">City</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleInputChange} 
                  placeholder="Dhaka"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase">Area / Neighborhood</label>
                <input 
                  type="text" 
                  name="area" 
                  value={formData.area} 
                  onChange={handleInputChange} 
                  placeholder="Gulshan 2"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase">Full Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    placeholder="House 12, Road 4, Sector 3"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* EMERGENCY CONTACT & NID DETAILS */}
              {(role === 'tenant' || role === 'owner') && (
                <>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Emergency Contact</label>
                    <input 
                      type="text" 
                      name="emergency_contact" 
                      value={formData.emergency_contact} 
                      onChange={handleInputChange} 
                      placeholder="017xxxxxxxx"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase">NID number</label>
                    <input 
                      type="text" 
                      name="nid_number" 
                      value={formData.nid_number} 
                      onChange={handleInputChange} 
                      placeholder="1234567890"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </>
              )}

              {/* BIOGRAPHY SECTION (ALL ROLES) */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase">Biography / About</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea 
                    name="bio" 
                    value={formData.bio} 
                    onChange={handleInputChange} 
                    rows="4"
                    placeholder="Tell other users about yourself, your agency, or your listing preferences..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex gap-4 justify-end pt-4 border-t border-slate-100">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(getDashboardPath())}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                loading={updateProfileMutation.isPending}
                className="px-6 font-bold"
              >
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
