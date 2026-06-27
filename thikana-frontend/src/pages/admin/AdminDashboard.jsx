import { getMediaUrl } from '../../utils/mediaUrl';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Users, Home, ShieldCheck, AlertTriangle, FileText, Activity,
  Check, X, Eye, Trash, Ban, CheckCircle, ShieldAlert 
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';

import { adminGetReports, adminUpdateReportStatus } from '../../services/reportService';
import { adminGetVerifications, adminApproveVerification, adminRejectVerification } from '../../services/verificationService';

const VERIFICATION_DOCUMENT_LABELS = {
  nid: 'National ID (NID)',
  student_id: 'Student ID',
  property_deed: 'Property Ownership Deed / Sale Deed',
  mutation_certificate: 'Mutation Certificate / Khatian',
  tax_receipt: 'Property Tax / Holding Tax Receipt',
  utility_bill: 'Utility Bill for Property',
  trade_license: 'Agency Trade License'
};

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'stats';
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  // Modals
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [reportId, setReportId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const setActiveTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  // Queries
  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/dashboard'),
    enabled: activeTab === 'stats'
  });

  const { data: propertiesRes, isLoading: propertiesLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: () => api.get('/properties?status=pending'), // Moderate pending listings
    enabled: activeTab === 'listings'
  });

  const { data: verificationsRes, isLoading: verificationsLoading } = useQuery({
    queryKey: ['admin-verifications'],
    queryFn: adminGetVerifications,
    enabled: activeTab === 'verifications'
  });

  const { data: reportsRes, isLoading: reportsLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: adminGetReports,
    enabled: activeTab === 'reports'
  });

  const { data: usersRes, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users'),
    enabled: activeTab === 'users'
  });

  const { data: auditLogsRes, isLoading: auditLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => api.get('/admin/audit-logs'),
    enabled: activeTab === 'audit'
  });

  // Mutations
  const updateListingStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/properties/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      showNotification('Property listing status updated', 'success');
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to update property status', 'error');
    }
  });

  const approveVerificationMutation = useMutation({
    mutationFn: (id) => adminApproveVerification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      showNotification('Verification request approved', 'success');
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to approve verification', 'error');
    }
  });

  const rejectVerificationMutation = useMutation({
    mutationFn: () => adminRejectVerification(rejectId, rejectReason),
    onSuccess: () => {
      setRejectId(null);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      showNotification('Verification request rejected', 'warning');
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to reject verification', 'error');
    }
  });

  const resolveReportMutation = useMutation({
    mutationFn: () => adminUpdateReportStatus(reportId, 'resolved', resolutionNotes),
    onSuccess: () => {
      setReportId(null);
      setResolutionNotes('');
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      showNotification('Report ticket resolved', 'success');
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to resolve report', 'error');
    }
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.patch(`/admin/users/${id}/status`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      showNotification('User status updated successfully', 'success');
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to update user status', 'error');
    }
  });

  const tabs = [
    { id: 'stats', label: 'Platform Stats', icon: Activity },
    { id: 'listings', label: 'Pending Listings', icon: Home },
    { id: 'verifications', label: 'Identity Verifications', icon: ShieldCheck },
    { id: 'reports', label: 'Moderation Reports', icon: AlertTriangle },
    { id: 'users', label: 'User Accounts', icon: Users },
    { id: 'audit', label: 'System Audit Logs', icon: FileText }
  ];

  const rawStats = statsRes?.data || {};
  const stats = {
  users: rawStats.totalUsers || 0,
  properties: rawStats.totalProperties || 0,
  activeProperties: rawStats.activeProperties || 0,
  pendingVerifications: rawStats.pendingVerifications || 0,
  reports: rawStats.pendingReports || 0,
  conversations: rawStats.totalConversations || 0
  };

  return (
    <DashboardLayout
      title="Admin Control Center"
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {/* 1. STATS TAB */}
      {activeTab === 'stats' && (
        <div className="space-y-8">
          <h2 className="text-xl font-bold text-slate-800">Platform Analytics Overview</h2>
          {statsLoading ? (
            <div>Loading statistics...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {[
                { label: 'Registered Users', value: stats.users, icon: Users, color: 'bg-blue-500' },
                { label: 'Total Listings', value: stats.properties, icon: Home, color: 'bg-emerald-500' },
                { label: 'Active Listings', value: stats.activeProperties, icon: CheckCircle, color: 'bg-indigo-500' },
                { label: 'Pending Verifications', value: stats.pendingVerifications, icon: ShieldCheck, color: 'bg-amber-500' },
                { label: 'Moderation Reports', value: stats.reports, icon: AlertTriangle, color: 'bg-rose-500' },
                { label: 'Total Conversations', value: stats.conversations, icon: Activity, color: 'bg-sky-500' }
              ].map((s, idx) => (
                <div key={idx} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className={`p-3 rounded-xl text-white ${s.color} shrink-0`}>
                    <s.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">{s.label}</p>
                    <p className="text-2xl font-extrabold text-slate-800 mt-1">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. PENDING LISTINGS TAB */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Moderate Listings</h2>
          {propertiesLoading ? (
            <div>Loading pending listings...</div>
          ) : !propertiesRes?.data || propertiesRes.data.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center text-slate-400">No pending listings to review.</div>
          ) : (
            <div className="space-y-4">
              {propertiesRes.data.map((prop) => (
                <div key={prop.id} className="bg-white border rounded-2xl p-6 shadow-sm flex justify-between items-center gap-6">
  <div className="flex items-center gap-4 min-w-0">
    <img
      src={getMediaUrl(prop.thumbnail_url)}
      alt={prop.title}
      className="w-24 h-20 rounded-xl object-cover border bg-slate-50 shrink-0"
    />

    <div className="min-w-0">
      <h3 className="font-bold text-slate-800 truncate">{prop.title}</h3>
      <p className="text-xs text-slate-400">{prop.address}, {prop.city}</p>
      <p className="text-sm font-semibold text-emerald-600 mt-1">{prop.price} BDT</p>
      <p className="text-xs text-slate-400 mt-2">Owner: {prop.owner_name} (ID: {prop.owner_id})</p>
    </div>
  </div>

  <div className="flex gap-2 shrink-0">
                    <Link
                      to={`/properties/${prop.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Link>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => updateListingStatusMutation.mutate({ id: prop.id, status: 'active' })}
                      loading={updateListingStatusMutation.isPending}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => updateListingStatusMutation.mutate({ id: prop.id, status: 'rejected' })}
                      loading={updateListingStatusMutation.isPending}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. VERIFICATIONS TAB */}
      {activeTab === 'verifications' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Verification Requests</h2>
          {verificationsLoading ? (
            <div>Loading requests...</div>
          ) : !verificationsRes?.data || verificationsRes.data.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center text-slate-400">No pending verification requests.</div>
          ) : (
            <div className="space-y-4">
              {verificationsRes.data.map((req) => (
                <div key={req.id} className="bg-white border rounded-2xl p-6 shadow-sm flex justify-between items-center gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">{req.full_name || req.email || `User ID: ${req.user_id}`}</p>
                    <p className="text-xs text-slate-500 capitalize font-bold">Role: {req.role}</p>
                    <p className="text-xs text-slate-400 uppercase font-bold">Doc Type: {VERIFICATION_DOCUMENT_LABELS[req.document_type] || req.document_type}</p>
                    <a 
                      href={getMediaUrl(req.document_url)} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View Document File
                    </a>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => approveVerificationMutation.mutate(req.id)}
                      loading={approveVerificationMutation.isPending}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => setRejectId(req.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. MODERATION REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Moderation Tickets</h2>
          {reportsLoading ? (
            <div>Loading reports...</div>
          ) : !reportsRes?.data || reportsRes.data.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center text-slate-400">No pending reports.</div>
          ) : (
            <div className="space-y-4">
              {reportsRes.data.map((rep) => (
                <div key={rep.id} className="bg-white border rounded-2xl p-6 shadow-sm flex justify-between items-start gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase">
                        Reason: {rep.reason}
                      </span>
                      <span className="text-xs text-slate-400">Reported Property ID: {rep.reported_property_id}</span>
                    </div>
                    <p className="text-sm text-slate-650 mt-1">{rep.description}</p>
                    <p className="text-[10px] text-slate-400">Submitted by User #{rep.reporter_id}</p>
                  </div>
                  <div className="shrink-0">
                    {rep.status === 'pending' ? (
                      <Button variant="primary" size="sm" onClick={() => setReportId(rep.id)}>
                        Resolve Ticket
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded font-bold uppercase">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. USER ACCOUNTS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Manage Accounts</h2>
          {usersLoading ? (
            <div>Loading accounts...</div>
          ) : !usersRes?.data || usersRes.data.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center text-slate-400">No users found.</div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold text-xs uppercase">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email / Phone</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersRes.data.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-800">{u.full_name || 'No Name'}</td>
                      <td className="p-4">
                        <p className="text-slate-700">{u.email}</p>
                        <p className="text-xs text-slate-400">{u.phone}</p>
                      </td>
                      <td className="p-4 capitalize font-semibold text-slate-500">{u.role}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          u.is_active ? 'bg-emerald-100 text-emerald-850' : 'bg-red-100 text-red-800'
                        }`}>
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateUserStatusMutation.mutate({ id: u.id, isActive: u.is_active ? 0 : 1 })}
                          loading={updateUserStatusMutation.isPending}
                          className={u.is_active ? 'text-red-500 border-red-100 hover:bg-red-50' : 'text-emerald-600 border-emerald-100 hover:bg-emerald-50'}
                        >
                          <Ban className="w-3.5 h-3.5 mr-1" />
                          {u.is_active ? 'Suspend' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. SYSTEM AUDIT LOGS TAB */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Administrative Logs</h2>
          {auditLoading ? (
            <div>Loading audit logs...</div>
          ) : !auditLogsRes?.data || auditLogsRes.data.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center text-slate-400">No logs found.</div>
          ) : (
            <div className="bg-white border rounded-2xl overflow-hidden divide-y divide-slate-100">
              {auditLogsRes.data.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50/50 flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-650 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                      <span className="text-xs text-slate-400">Target ID: {log.target_id}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Admin: {log.admin_name} ({log.admin_email})</p>
                    <p className="text-xs text-slate-400 italic font-mono mt-1">Details: {log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-semibold">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REJECT REQUEST REASON MODAL */}
      {rejectId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-zoomIn">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Reject Verification Request</h3>
              <button onClick={() => setRejectId(null)} className="text-slate-400 hover:text-slate-655">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form 
              onSubmit={(e) => { e.preventDefault(); rejectVerificationMutation.mutate(); }}
              className="p-6 space-y-4"
            >
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase">Reason for Rejection *</label>
                <textarea
                  required
                  placeholder="e.g. Document image is blurry and NID digits are unreadable..."
                  rows="4"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full border rounded-xl p-3 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                ></textarea>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
                <Button type="submit" variant="danger" loading={rejectVerificationMutation.isPending}>
                  Confirm Rejection
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE REPORT MODAL */}
      {reportId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-zoomIn">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Resolve Ticket</h3>
              <button onClick={() => setReportId(null)} className="text-slate-400 hover:text-slate-655">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form 
              onSubmit={(e) => { e.preventDefault(); resolveReportMutation.mutate(); }}
              className="p-6 space-y-4"
            >
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase">Resolution Notes *</label>
                <textarea
                  required
                  placeholder="e.g. Contacted owner and verified details. Listing updated, warning issued..."
                  rows="4"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full border rounded-xl p-3 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                ></textarea>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={() => setReportId(null)}>Cancel</Button>
                <Button type="submit" variant="primary" loading={resolveReportMutation.isPending}>
                  Resolve Report
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default AdminDashboard;
