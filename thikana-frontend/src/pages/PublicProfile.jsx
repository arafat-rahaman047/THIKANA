import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  User, MapPin, Briefcase, Calendar, Globe, Facebook, 
  ShieldCheck, ShieldAlert, ArrowLeft, Loader2, Home 
} from 'lucide-react';
import userService from '../services/userService';
import { getMediaUrl } from '../utils/mediaUrl';
import Button from '../components/common/Button';

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: profileRes, isLoading, isError } = useQuery({
    queryKey: ['public-profile', id],
    queryFn: () => userService.getPublicProfile(id),
    enabled: !!id
  });

  const profile = profileRes?.data;

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center flex-col gap-3">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-slate-500 font-bold text-sm">Retrieving profile...</p>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Profile Not Found</h2>
        <p className="text-slate-500">The user profile you are trying to view does not exist or has been disabled.</p>
        <Button variant="primary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const role = profile.role?.toLowerCase();
  const joinedDate = profile.joined_at 
    ? new Date(profile.joined_at).toLocaleDateString([], { year: 'numeric', month: 'long' }) 
    : 'N/A';

  const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    profile.display_name || 'U'
  )}`;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      
      {/* Back navigation button */}
      <div>
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
        
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 pb-6 border-b border-slate-100">
          <img 
            src={profile.avatar_url ? getMediaUrl(profile.avatar_url) : fallbackAvatar} 
            alt={profile.display_name} 
            className="w-28 h-28 rounded-full border-2 border-slate-100 object-cover shadow-sm shrink-0"
          />
          <div className="space-y-3.5 min-w-0 flex-1">
            <div className="space-y-1">
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-display truncate">
                  {profile.display_name}
                </h1>
                
                {profile.is_verified ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shadow-inner border border-emerald-100 shrink-0">
                    <ShieldCheck className="w-3 h-3 fill-emerald-50 text-emerald-600" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                    Standard User
                  </span>
                )}
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-sm text-slate-500 font-semibold">
                <span className="capitalize text-emerald-600 bg-emerald-50/50 px-2.5 py-0.5 rounded-lg border border-emerald-100/50 text-xs font-bold">
                  {profile.role}
                </span>
                {(profile.city || profile.area) && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    {profile.area ? `${profile.area}, ` : ''}{profile.city || ''}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-center sm:justify-start items-center gap-2 text-xs text-slate-450 font-bold uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Joined {joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Safe public credentials grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* RENDER ROLE SPECIFIC SAFE DETAILS */}
          {role === 'tenant' && (
            <>
              {profile.occupation && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Occupation</p>
                    <p className="text-sm font-extrabold text-slate-700">{profile.occupation}</p>
                  </div>
                </div>
              )}
              {profile.institution_name && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                  <User className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Institution</p>
                    <p className="text-sm font-extrabold text-slate-700">{profile.institution_name}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {role === 'owner' && (
            <>
              {profile.occupation && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Occupation</p>
                    <p className="text-sm font-extrabold text-slate-700">{profile.occupation}</p>
                  </div>
                </div>
              )}
              {profile.years_of_experience !== null && profile.years_of_experience !== undefined && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Landlord Experience</p>
                    <p className="text-sm font-extrabold text-slate-700">{profile.years_of_experience} Years</p>
                  </div>
                </div>
              )}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                <Home className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Listed Properties</p>
                  <p className="text-sm font-extrabold text-slate-700">{profile.property_count || 0} Active Listings</p>
                </div>
              </div>
            </>
          )}

          {role === 'agency' && (
            <>
              {profile.contact_person_name && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                  <User className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contact Person</p>
                    <p className="text-sm font-extrabold text-slate-700">{profile.contact_person_name}</p>
                  </div>
                </div>
              )}
              {profile.years_of_experience !== null && profile.years_of_experience !== undefined && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Agency Experience</p>
                    <p className="text-sm font-extrabold text-slate-700">{profile.years_of_experience} Years</p>
                  </div>
                </div>
              )}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                <Home className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Listings</p>
                  <p className="text-sm font-extrabold text-slate-700">{profile.property_count || 0} Properties</p>
                </div>
              </div>
              {profile.website_url && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                  <Globe className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Website</p>
                    <a 
                      href={profile.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm font-extrabold text-emerald-600 hover:text-emerald-700 hover:underline break-all"
                    >
                      {profile.website_url.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}
              {profile.facebook_url && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                  <Facebook className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Facebook</p>
                    <a 
                      href={profile.facebook_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm font-extrabold text-emerald-600 hover:text-emerald-700 hover:underline break-all"
                    >
                      View Facebook Page
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Public biography/about box */}
        <div className="space-y-3.5 pt-4 border-t border-slate-100">
          <h3 className="text-base font-bold text-slate-800">About {profile.display_name}</h3>
          {profile.bio ? (
            <p className="text-sm text-slate-650 leading-relaxed bg-slate-50/50 p-4 border border-slate-100 rounded-2xl whitespace-pre-wrap">
              {profile.bio}
            </p>
          ) : (
            <p className="text-sm text-slate-400 italic">No biography details provided by the user.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
