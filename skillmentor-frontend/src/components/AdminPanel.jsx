import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Search, 
  ExternalLink, 
  Lock, 
  Users, 
  CreditCard, 
  Filter, 
  Ban, 
  RotateCcw 
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminPanel({ currentUser }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'verifications' | 'reports' | 'payments' | 'logs'
  
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [payments, setPayments] = useState([]);
  const [logs, setLogs] = useState([]);

  // User Management Search & Filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sumRes, usersRes, verifRes, repRes, payRes, logsRes] = await Promise.all([
        api.getAdminSummary().catch(() => null),
        api.getAdminUsers().catch(() => []),
        api.getAdminVerifications().catch(() => []),
        api.getReports().catch(() => []),
        api.getAdminPayments().catch(() => []),
        api.getAdminActionLogs().catch(() => [])
      ]);

      setSummary(sumRes);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setVerifications(Array.isArray(verifRes) ? verifRes : []);
      setReports(Array.isArray(repRes) ? repRes : []);
      setPayments(Array.isArray(payRes) ? payRes : []);
      setLogs(Array.isArray(logsRes) ? logsRes : []);
    } catch (err) {
      console.error('Admin fetch error:', err);
      setError('Failed to load admin governance data. Ensure you possess System Admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessVerification = async (id, approve) => {
    const notes = prompt(`Enter reviewer notes to ${approve ? 'APPROVE' : 'REJECT'} verification #${id}:`);
    if (notes === null) return;

    try {
      await api.processVerification(id, approve, notes || 'Processed by System Admin');
      setMsg(`Verification request #${id} ${approve ? 'APPROVED & VERIFIED' : 'REJECTED'}.`);
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to process verification request');
    }
  };

  const handleResolveReport = async (id, dismiss) => {
    const notes = prompt(`Enter resolution action notes for report #${id}:`);
    if (notes === null) return;

    try {
      await api.resolveReport(id, dismiss, notes || 'Resolved by Admin');
      setMsg(`Report #${id} ${dismiss ? 'DISMISSED' : 'RESOLVED'}.`);
      fetchAdminData();
    } catch (err) {
      setError('Report resolution error');
    }
  };

  const handleToggleUserSuspension = async (userId, userName, currentSuspended) => {
    const actionText = currentSuspended ? 'RESTORE / UNSUSPEND' : 'SUSPEND';
    const confirmAction = window.confirm(`Are you sure you want to ${actionText} user "${userName}" (ID #${userId})?`);
    if (!confirmAction) return;

    const reason = prompt(`Enter administrative reason to ${actionText} user #${userId}:`);
    if (reason === null) return;

    try {
      await api.toggleUserSuspension(userId, !currentSuspended, reason || 'Admin Action');
      setMsg(`User "${userName}" (ID #${userId}) suspension updated to ${!currentSuspended}.`);
      fetchAdminData();
    } catch (err) {
      setError('Suspension update error');
    }
  };

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="bg-white rounded-3xl p-12 text-center max-w-xl mx-auto my-12 shadow-xl border border-red-200">
        <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-extrabold text-slate-900">Access Restricted — Admin Portal Only</h3>
        <p className="text-xs text-slate-500 mt-2">
          You are currently logged in as <strong className="text-slate-800">{currentUser?.role || 'USER'}</strong>. Please log in with an account having the <strong>🛠️ System Admin</strong> role to access governance metrics.
        </p>
      </div>
    );
  }

  // Filter users for User Management Tab
  const filteredUsers = users.filter((u) => {
    const matchesSearch = !userSearch || 
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.collegeName?.toLowerCase().includes(userSearch.toLowerCase());
    
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 mb-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Governance & Platform Safety Engine</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Admin Governance Portal</h2>
          <p className="text-xs text-slate-500 mt-1">Review identity verifications, manage user accounts, inspect payments, and audit governance logs.</p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center space-x-1.5 self-start cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {msg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* OVERVIEW KPI CARDS (6 PRECISE DYNAMIC BACKEND METRICS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Metric 1: Total Users */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
          <p className="text-2xl font-black text-slate-900">{summary?.totalUsers ?? users.length}</p>
          <div className="text-[10px] text-slate-500 font-medium">Database Accounts</div>
        </div>

        {/* Metric 2: Total Sessions */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sessions</span>
          <p className="text-2xl font-black text-slate-900">{summary?.totalSessions ?? 0}</p>
          <div className="text-[10px] text-blue-600 font-semibold">Scheduled & Completed</div>
        </div>

        {/* Metric 3: Successful Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Successful Revenue</span>
          <p className="text-2xl font-black text-emerald-600">₹{summary?.successfulRevenue ?? 0}</p>
          <div className="text-[10px] text-emerald-600 font-medium">Verified Razorpay Payments</div>
        </div>

        {/* Metric 4: Peer Credits Transferred */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peer Credits Transferred</span>
          <p className="text-2xl font-black text-amber-700">⚡ {summary?.peerCreditsTransferred ?? 0}</p>
          <div className="text-[10px] text-amber-600 font-medium">Completed Swaps</div>
        </div>

        {/* Metric 5: Pending Verifications */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Verifications</span>
          <p className="text-2xl font-black text-indigo-700">{summary?.pendingVerifications ?? verifications.length}</p>
          <div className="text-[10px] text-indigo-600 font-medium">Needs Review</div>
        </div>

        {/* Metric 6: Pending Abuse Reports */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Abuse Reports</span>
          <p className="text-2xl font-black text-red-600">{summary?.pendingReports ?? reports.length}</p>
          <div className="text-[10px] text-red-600 font-medium">Flagged Incidents</div>
        </div>

      </div>

      {/* ADMIN MODULE TABS NAVIGATION */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 min-w-[120px] py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === 'users' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          User Management ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('verifications')}
          className={`flex-1 min-w-[120px] py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === 'verifications' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Verifications ({verifications.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 min-w-[120px] py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === 'reports' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Abuse Reports ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex-1 min-w-[120px] py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === 'payments' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Payment Monitoring ({payments.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 min-w-[120px] py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === 'logs' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Audit Logs ({logs.length})
        </button>
      </div>

      {/* MODULE 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                <span>User Account Administration</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">View registered platform users, filter by role, inspect status, and manage suspensions.</p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user name, email, college..."
                  className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Student</option>
                <option value="MENTOR">Mentor</option>
                <option value="ALUMNI">Alumni</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/60">
                    <th className="p-3 rounded-l-xl">User ID & Name</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">College / Company</th>
                    <th className="p-3">Verification</th>
                    <th className="p-3">Account Status</th>
                    <th className="p-3 rounded-r-xl text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">
                        #{u.id} {u.name}
                        <div className="text-[10px] text-slate-400 font-medium">{u.email}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          u.role === 'ALUMNI' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          u.role === 'MENTOR' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 font-medium">
                        {u.collegeName || 'N/A'}
                        {u.currentCompany && (
                          <div className="text-[10px] text-orange-700 font-bold">{u.currentDesignation || 'Professional'} @ {u.currentCompany}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          u.verificationStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          u.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {u.verificationStatus || 'UNVERIFIED'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          u.isSuspended ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {u.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleUserSuspension(u.id, u.name, u.isSuspended)}
                            className={`px-3 py-1.5 font-bold text-[11px] rounded-xl transition-all flex items-center gap-1 ml-auto cursor-pointer ${
                              u.isSuspended 
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                            }`}
                          >
                            {u.isSuspended ? (
                              <>
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restore</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-3.5 h-3.5" />
                                <span>Suspend</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              No users found matching your search or role filter.
            </div>
          )}
        </div>
      )}

      {/* MODULE 2: IDENTITY VERIFICATIONS QUEUE */}
      {activeTab === 'verifications' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Mentor & Alumni Identity Verification Queue</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Review credential submissions and grant verified mentor badges.</p>
          </div>

          {verifications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/60">
                    <th className="p-3 rounded-l-xl">User ID & Name</th>
                    <th className="p-3">College & Company</th>
                    <th className="p-3">LinkedIn & Document</th>
                    <th className="p-3">Stage</th>
                    <th className="p-3 rounded-r-xl text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {verifications.map((v) => (
                    <tr key={v.id || v.userId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">
                        #{v.userId || v.id} {v.userName || 'Mentor User'}
                        <div className="text-[10px] text-slate-400 font-medium">{v.userEmail}</div>
                      </td>
                      <td className="p-3 text-slate-700 font-medium">
                        {v.college || 'College N/A'}
                        <div className="text-[10px] text-slate-400">{v.company ? `${v.designation || 'Engineer'} @ ${v.company}` : 'Professional Mentor'} ({v.experienceYears || 3} yrs exp)</div>
                      </td>
                      <td className="p-3 space-y-1">
                        {v.linkedinUrl && (
                          <a href={v.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold flex items-center gap-1">
                            <span>LinkedIn Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <span className="text-indigo-700 font-mono text-[10px] block font-semibold">
                          📄 {v.govtIdDocumentPath || 'Govt ID Document'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          v.stage === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          v.stage === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {v.stage || 'PENDING'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleProcessVerification(v.id || v.userId, true)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Badge</span>
                          </button>
                          <button
                            onClick={() => handleProcessVerification(v.id || v.userId, false)}
                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[11px] rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              No pending mentor identity verification requests found.
            </div>
          )}
        </div>
      )}

      {/* MODULE 3: ABUSE REPORTS MODERATION */}
      {activeTab === 'reports' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Community Safety & Abuse Moderation Queue</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Inspect user flag reports and enforce platform safety rules.</p>
          </div>

          {reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/60">
                    <th className="p-3 rounded-l-xl">Report ID & Date</th>
                    <th className="p-3">Reported User</th>
                    <th className="p-3">Reason / Details</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 rounded-r-xl text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">
                        #{r.id}
                        <div className="text-[10px] text-slate-400 font-medium">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}
                        </div>
                      </td>
                      <td className="p-3 font-bold text-slate-800">
                        #{r.reportedUserId} {r.reportedUserName || 'User'}
                        <div className="text-[10px] text-slate-400 font-medium">{r.reportedUserEmail}</div>
                      </td>
                      <td className="p-3 text-slate-600 font-medium max-w-xs">{r.reason}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          r.status === 'PENDING' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggleUserSuspension(r.reportedUserId, r.reportedUserName || 'User', false)}
                            className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded-xl shadow-xs transition-all cursor-pointer"
                          >
                            Suspend User
                          </button>
                          <button
                            onClick={() => handleResolveReport(r.id, false)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 rounded-xl transition-all cursor-pointer"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleResolveReport(r.id, true)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-200 rounded-xl transition-all cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              No pending abuse reports found. Platform community is safe and clean!
            </div>
          )}
        </div>
      )}

      {/* MODULE 4: PAYMENT MONITORING (READ-ONLY MONITORING) */}
      {activeTab === 'payments' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>Razorpay Mentorship Payment Monitoring</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Read-only audit ledger of verified mentorship payments and transaction status.</p>
          </div>

          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/60">
                    <th className="p-3 rounded-l-xl">Txn & Order ID</th>
                    <th className="p-3">Student (Payer)</th>
                    <th className="p-3">Mentor (Recipient)</th>
                    <th className="p-3">Amount (₹)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 rounded-r-xl text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">
                        {p.transactionId || `TXN-${p.id}`}
                        <div className="text-[10px] text-slate-400 font-mono">Order: {p.razorpayOrderId}</div>
                      </td>
                      <td className="p-3 text-slate-800 font-semibold">{p.studentName}</td>
                      <td className="p-3 text-slate-800 font-semibold">{p.mentorName}</td>
                      <td className="p-3 font-black text-slate-900">₹{p.amount}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          p.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          p.status === 'FAILED' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-500 font-mono text-[11px]">
                        {p.createdAt ? new Date(p.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              No Razorpay payment records found.
            </div>
          )}
        </div>
      )}

      {/* MODULE 5: SYSTEM GOVERNANCE AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>System Governance Audit Logs</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Immutable audit trail of administrative moderation actions.</p>
          </div>

          {logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900">Admin #{log.adminId} ({log.adminName})</span>
                    <span className="ml-2 font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 uppercase">
                      {log.actionType}
                    </span>
                    <p className="text-slate-600 font-medium mt-1">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 font-medium">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              No administrative audit logs recorded yet.
            </div>
          )}
        </div>
      )}

    </div>
  );
}
