import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  RefreshCw, 
  Save, 
  AlertCircle, 
  Building, 
  GraduationCap, 
  Users,
  Check,
  Award
} from 'lucide-react';
import { api } from '../services/api';

export default function MentorDashboard({ currentUser, onOpenChat }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const [profileData, setProfileData] = useState({
    hourlyRate: currentUser?.hourlyRate || 800,
    alumniBenefitType: currentUser?.alumniBenefitType || 'NONE',
    alumniDiscountPercent: currentUser?.alumniDiscountPercent || 0,
    availableSlots: currentUser?.availableSlots || 'Mon, Wed, Fri (6:00 PM - 9:00 PM)',
    bio: currentUser?.bio || '',
    collegeName: currentUser?.collegeName || '',
    currentCompany: currentUser?.currentCompany || '',
    currentDesignation: currentUser?.currentDesignation || ''
  });

  useEffect(() => {
    fetchMentorSummary();
  }, []);

  const fetchMentorSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMentorSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to fetch mentor summary:', err);
      setError('Unable to load mentor workspace data.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    setMsg('');

    try {
      await api.updateProfile(profileData);
      setMsg('Availability slots, session rates, and alumni benefits updated successfully!');
      fetchMentorSummary();
    } catch (err) {
      setError('Failed to update mentor profile configuration');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleStatusUpdate = async (sessionId, status) => {
    try {
      await api.updateSessionStatus(sessionId, status);
      fetchMentorSummary();
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-orange-700 mb-2">
            <LayoutDashboard className="w-4 h-4 text-orange-600" />
            <span>Mentor & Alumni Workspace</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mentor Workspace</h2>
          <p className="text-xs text-slate-500 mt-1">Manage your availability, mentorship sessions, student requests and professional profile.</p>
        </div>

        <button
          onClick={fetchMentorSummary}
          disabled={loading}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center space-x-1.5 self-start cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Requests</span>
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
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* OVERVIEW METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Mentorship Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mentorship Revenue</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">₹{summary?.mentorshipRevenue ?? 0}</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>Successful Payments</span>
          </p>
        </div>

        {/* Card 2: Student Requests */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Requests</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl sm:text-3xl font-black text-orange-600">{summary?.pendingRequestsCount ?? 0}</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Incoming mentorship requests</p>
        </div>

        {/* Card 3: Upcoming Sessions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upcoming Sessions</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl sm:text-3xl font-black text-blue-600">{summary?.upcomingSessionsCount ?? 0}</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Confirmed sessions</p>
        </div>

        {/* Card 4: Completed Sessions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Sessions</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">{summary?.completedSessionsCount ?? 0}</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Completed mentorship sessions</p>
        </div>

      </div>

      {/* AVAILABILITY & MENTORSHIP PRICING */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span>Availability & Mentorship Pricing</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Configure your weekly availability slots and hourly mentorship rate.</p>
        </div>

        <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 mb-1">Available Days & Time Slots</label>
            <input
              type="text"
              value={profileData.availableSlots}
              onChange={(e) => setProfileData({ ...profileData, availableSlots: e.target.value })}
              placeholder="e.g. Mon, Wed, Fri (6:00 PM - 9:00 PM)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Session Rate (₹ / Hour)</label>
            <input
              type="number"
              value={profileData.hourlyRate}
              onChange={(e) => setProfileData({ ...profileData, hourlyRate: e.target.value })}
              placeholder="800"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
            />
          </div>

          {/* SAME-COLLEGE GUIDANCE BENEFIT CONFIGURATION (ALUMNI & MENTOR ROLES) */}
          {(currentUser?.role === 'ALUMNI' || currentUser?.role === 'MENTOR') && (
            <div className="md:col-span-2 p-4 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-3">
              <div>
                <label className="block font-bold text-orange-900 text-xs flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-orange-600" />
                  <span>Same-College Student Guidance Benefit</span>
                </label>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Offer an automatic pricing benefit to verified students attending your alma mater (<strong className="text-slate-800">{currentUser?.collegeName || 'Your College'}</strong>).
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-800">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="alumniBenefitType"
                    value="NONE"
                    checked={profileData.alumniBenefitType === 'NONE'}
                    onChange={(e) => setProfileData({ ...profileData, alumniBenefitType: e.target.value })}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500 cursor-pointer"
                  />
                  <span>No Special Benefit (Standard Hourly Rate)</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="alumniBenefitType"
                    value="FREE"
                    checked={profileData.alumniBenefitType === 'FREE'}
                    onChange={(e) => setProfileData({ ...profileData, alumniBenefitType: e.target.value })}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500 cursor-pointer"
                  />
                  <span>Free Session (₹0 for Same-College Students)</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="alumniBenefitType"
                    value="DISCOUNT"
                    checked={profileData.alumniBenefitType === 'DISCOUNT'}
                    onChange={(e) => setProfileData({ ...profileData, alumniBenefitType: e.target.value })}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500 cursor-pointer"
                  />
                  <span>Percentage Discount</span>
                </label>
              </div>

              {profileData.alumniBenefitType === 'DISCOUNT' && (
                <div className="w-48 pt-1">
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">Discount Percentage (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={profileData.alumniDiscountPercent}
                      onChange={(e) => setProfileData({ ...profileData, alumniDiscountPercent: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-bold"
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Current Company</label>
            <input
              type="text"
              value={profileData.currentCompany}
              onChange={(e) => setProfileData({ ...profileData, currentCompany: e.target.value })}
              placeholder="e.g. Google / TechCorp"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Current Designation</label>
            <input
              type="text"
              value={profileData.currentDesignation}
              onChange={(e) => setProfileData({ ...profileData, currentDesignation: e.target.value })}
              placeholder="e.g. Senior Software Engineer"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Public Mentor Bio</label>
            <textarea
              rows={3}
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              placeholder="Describe your industry experience, technical domain, and mock interview guidance..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
            />
          </div>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              disabled={saveLoading}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saveLoading ? 'Saving...' : 'Save Availability & Pricing'}</span>
            </button>
          </div>

        </form>
      </div>

      {/* INCOMING STUDENT SESSION REQUESTS TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            <span>Incoming Student Booking Requests</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Review and respond to pending mentorship booking requests.</p>
        </div>

        {summary?.incomingRequests && summary.incomingRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/60">
                  <th className="p-3 rounded-l-xl">Student</th>
                  <th className="p-3">Session Title</th>
                  <th className="p-3">Scheduled Time</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.incomingRequests.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      {s.studentName}
                      {s.sameCollegeConnection && (
                        <span className="block text-[10px] text-orange-600 font-semibold mt-0.5">
                          Same-college connection
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{s.title}</td>
                    <td className="p-3 text-slate-600 font-medium">
                      {s.scheduledTime ? new Date(s.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'} ({s.durationMinutes}m)
                    </td>
                    <td className="p-3 font-black text-slate-900">
                      {s.sessionType === 'PEER_CREDIT' ? ((s.creditCost === 0 || s.title?.toLowerCase().includes('reciprocal')) ? 'Free Swap' : `⚡ ${s.creditCost} Credits`) : (s.paymentRequired ? `₹${s.priceInINR}` : 'FREE')}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(s.id, 'ACCEPTED')}
                          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(s.id, 'REJECTED')}
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[11px] rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => onOpenChat(s)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-xl border border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
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
            No incoming student mentorship requests yet.
          </div>
        )}
      </div>

      {/* UPCOMING & RECENT SESSIONS TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Confirmed & Completed Sessions</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">View active, upcoming, and completed mentorship sessions.</p>
        </div>

        {summary?.upcomingSessions && summary.upcomingSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/60">
                  <th className="p-3 rounded-l-xl">Student</th>
                  <th className="p-3">Session Title</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.upcomingSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{s.studentName}</td>
                    <td className="p-3 text-slate-700 font-medium">{s.title}</td>
                    <td className="p-3 text-slate-600 font-medium">
                      {s.scheduledTime ? new Date(s.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </td>
                    <td className="p-3 font-black text-slate-900">
                      {s.sessionType === 'PEER_CREDIT' ? ((s.creditCost === 0 || s.title?.toLowerCase().includes('reciprocal')) ? 'Free Swap' : `⚡ ${s.creditCost} Credits`) : (s.paymentRequired ? `₹${s.priceInINR}` : 'FREE')}
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        s.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {s.status === 'ACCEPTED' && !s.title?.toLowerCase().includes('help') && !s.title?.toLowerCase().includes('request') && s.sessionType !== 'PEER_CREDIT' && (
                          <button
                            onClick={() => handleStatusUpdate(s.id, 'COMPLETED')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Complete</span>
                          </button>
                        )}
                        <button
                          onClick={() => onOpenChat(s)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-xl border border-indigo-200 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
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
            No confirmed or completed sessions yet.
          </div>
        )}
      </div>

    </div>
  );
}
