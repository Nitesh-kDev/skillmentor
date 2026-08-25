import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Zap, CheckCircle2, XCircle, Clock, AlertCircle, ArrowRightLeft, Users, Send, MessageSquare, Award, Sparkles, Check, X, GraduationCap, BookOpen } from 'lucide-react';
import { api } from '../services/api';

export default function PeerSkillExchangeView({ currentUser, onProfileUpdated, onOpenAuth }) {
  const [requests, setRequests] = useState([]);
  const [reciprocalMatches, setReciprocalMatches] = useState([]);

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('OPEN');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({
    title: '',
    description: '',
    category: 'SKILL_LEARNING',
    program: 'MCA',
    domainSubject: 'Software Development',
    skillTag: '',
    creditBudget: 10
  });

  const [activeApplyRequest, setActiveApplyRequest] = useState(null);
  const [applyMessage, setApplyMessage] = useState('');

  const [activeViewApplicationsRequest, setActiveViewApplicationsRequest] = useState(null);
  const [applications, setApplications] = useState([]);

  const currentUserId = currentUser ? (currentUser.id || currentUser.userId) : null;

  const categories = [
    { id: 'SKILL_LEARNING', label: 'Skill Learning' },
    { id: 'PROJECT_HELP', label: 'Project Help' },
    { id: 'DOUBT_SOLVING', label: 'Doubt Solving' },
    { id: 'ACADEMIC_HELP', label: 'Academic Help' },
    { id: 'CAREER_GUIDANCE', label: 'Career Guidance' },
    { id: 'INTERVIEW_PREPARATION', label: 'Interview Preparation' },
    { id: 'RESUME_PROFILE', label: 'Resume & Profile' },
    { id: 'MENTORSHIP', label: 'Mentorship' },
    { id: 'OTHER', label: 'Other' }
  ];

  const programs = [
    { id: 'BTECH', label: 'BTech' },
    { id: 'MCA', label: 'MCA' },
    { id: 'BBA', label: 'BBA' },
    { id: 'MBA', label: 'MBA' },
    { id: 'LLB', label: 'LLB' },
    { id: 'OTHER', label: 'Other' }
  ];

  const domainSuggestions = [
    'Software Development',
    'Artificial Intelligence',
    'Data Science',
    'Finance',
    'Marketing',
    'Human Resources',
    'Corporate Law',
    'Business Analytics',
    'Management'
  ];

  const handleOpenCreateModal = () => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    // Auto-detect user course if available
    let initialProgram = 'MCA';
    if (currentUser.course) {
      const c = currentUser.course.toUpperCase();
      if (c.includes('B.TECH') || c.includes('BTECH')) initialProgram = 'BTECH';
      else if (c.includes('BBA')) initialProgram = 'BBA';
      else if (c.includes('MBA')) initialProgram = 'MBA';
      else if (c.includes('LLB')) initialProgram = 'LLB';
    }
    setCreateData((prev) => ({ ...prev, program: initialProgram }));
    setIsCreateOpen(true);
  };

  const handleOpenApplyModal = (req) => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    setActiveApplyRequest(req);
  };

  useEffect(() => {
    fetchFilteredRequests();
    fetchReciprocalMatches();
  }, [categoryFilter, programFilter, statusFilter]);

  const fetchFilteredRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getPeerRequests(
        categoryFilter,
        domainFilter,
        statusFilter,
        programFilter,
        domainFilter,
        searchQuery
      );
      setRequests(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch student help requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchReciprocalMatches = async () => {
    if (!currentUser) return;
    try {
      const data = await api.getSuggestedReciprocalMatches();
      setReciprocalMatches(data || []);
    } catch (err) {
      // Non-blocking
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFilteredRequests();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!createData.title.trim() || !createData.description.trim()) {
      setError('Title and description are required.');
      return;
    }

    if (currentUser?.walletBalance != null && createData.creditBudget > currentUser.walletBalance) {
      setError(`Insufficient credit balance. You have ${currentUser.walletBalance} credits, but offered ${createData.creditBudget} credits.`);
      return;
    }

    try {
      await api.createPeerRequest({
        ...createData,
        title: createData.title.trim(),
        description: createData.description.trim(),
        skillTag: createData.domainSubject || 'General'
      });
      setSuccessMsg('Student help request created successfully!');
      setIsCreateOpen(false);
      setCreateData({
        title: '',
        description: '',
        category: 'SKILL_LEARNING',
        program: 'MCA',
        domainSubject: 'Software Development',
        skillTag: '',
        creditBudget: 10
      });
      fetchFilteredRequests();
      fetchReciprocalMatches();
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      setError(err.message || 'Failed to create student help request');
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!activeApplyRequest) return;
    setError('');
    setSuccessMsg('');

    try {
      await api.applyToPeerRequest(activeApplyRequest.id, applyMessage);
      setSuccessMsg('Application submitted successfully to requester!');
      setActiveApplyRequest(null);
      setApplyMessage('');
      fetchFilteredRequests();
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    }
  };

  const handleOpenApplicationsModal = async (req) => {
    setActiveViewApplicationsRequest(req);
    setError('');
    try {
      const data = await api.getPeerRequestApplications(req.id);
      setApplications(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch applicants');
    }
  };

  const handleSelectApplicant = async (applicationId) => {
    if (!activeViewApplicationsRequest) return;
    setError('');
    setSuccessMsg('');
    try {
      await api.selectPeerApplicant(activeViewApplicationsRequest.id, applicationId);
      setSuccessMsg('Applicant selected! Chat room created in My Sessions & Chat.');
      setActiveViewApplicationsRequest(null);
      fetchFilteredRequests();
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      setError(err.message || 'Failed to select applicant');
    }
  };

  const handleCompleteRequest = async (requestId) => {
    setError('');
    setSuccessMsg('');
    try {
      await api.completePeerRequest(requestId);
      setSuccessMsg('Request completed! Credits transferred to helper wallet.');
      fetchFilteredRequests();
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      setError(err.message || 'Failed to complete request');
    }
  };

  const handleCancelRequest = async (requestId) => {
    setError('');
    setSuccessMsg('');
    try {
      await api.cancelPeerRequest(requestId);
      setSuccessMsg('Student help request cancelled.');
      fetchFilteredRequests();
    } catch (err) {
      setError(err.message || 'Failed to cancel request');
    }
  };

  const handleAcceptMatch = async (matchId) => {
    setError('');
    setSuccessMsg('');
    try {
      await api.acceptReciprocalMatch(matchId);
      setSuccessMsg('Reciprocal match accepted! 0-credit free session created.');
      fetchReciprocalMatches();
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      setError(err.message || 'Failed to accept match');
    }
  };

  const handleDeclineMatch = async (matchId) => {
    setError('');
    setSuccessMsg('');
    try {
      await api.declineReciprocalMatch(matchId);
      setSuccessMsg('Reciprocal match declined.');
      fetchReciprocalMatches();
    } catch (err) {
      setError(err.message || 'Failed to decline match');
    }
  };

  const formatCategoryLabel = (cat) => {
    if (!cat) return 'General';
    const found = categories.find((c) => c.id === cat);
    return found ? found.label : cat.replace('_', ' ');
  };

  return (
    <div className="space-y-8 animate-fade-in">

      {/* 1. HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-8 text-white shadow-xl shadow-orange-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Multi-Program Student Knowledge Exchange</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Student Help Requests</h2>
            <p className="text-orange-100 text-xs sm:text-sm leading-relaxed">
              Post what you need help with across academic programs (BTech, MCA, BBA, MBA, LLB), apply to assist fellow students, or activate free reciprocal skill swaps!
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-3 bg-white hover:bg-orange-50 text-orange-600 font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center space-x-2 self-start md:self-center active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Student Help Request</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. RECIPROCAL MATCH SUGGESTER BANNER */}
      {reciprocalMatches.length > 0 && (
        <div className="card-light p-6 rounded-3xl border-2 border-orange-300 bg-gradient-to-r from-orange-50/90 to-amber-50/90 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">🎯 Smart Reciprocal Skill Match</h3>
                <p className="text-xs text-slate-500">Mutual skill match detected! Both students exchange skills for 0 credits.</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-3 py-1 bg-orange-100 text-orange-700 rounded-full border border-orange-200">
              Mutual Skill Swap
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reciprocalMatches.map((m) => {
              const isUserA = currentUserId != null && Number(currentUserId) === Number(m.userAId);
              const partnerName = isUserA ? m.userBName : m.userAName;
              const myNeededSkill = isUserA ? m.skillTagA : m.skillTagB;
              const partnerNeededSkill = isUserA ? m.skillTagB : m.skillTagA;

              return (
                <div key={m.id} className="bg-white p-5 rounded-2xl border border-orange-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-100">
                      Direct Skill Swap with {partnerName}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-600 fill-emerald-500" />
                      <span>0 Credits (Free Mutual Swap)</span>
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-slate-700">
                    <p><strong>You want:</strong> {myNeededSkill}</p>
                    <p><strong>{partnerName} wants:</strong> {partnerNeededSkill}</p>
                  </div>

                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleAcceptMatch(m.id)}
                      className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-2xs flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Direct Swap</span>
                    </button>
                    <button
                      onClick={() => handleDeclineMatch(m.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MULTI-PROGRAM FILTER BAR & BROWSE OPEN REQUESTS */}
      <div className="space-y-4">

        <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">

            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Program Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Program</label>
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="">All Programs (MCA, MBA, BTech...)</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="OPEN">Open Requests</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Search Keywords / Domain</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Spring Boot, Finance, Law..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { setCategoryFilter(''); setProgramFilter(''); setDomainFilter(''); setSearchQuery(''); setStatusFilter('OPEN'); }}
              className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-semibold"
            >
              Reset Filters
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
          </div>
        </form>

        {/* Requests List Grid */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-slate-500 font-medium">Loading student help requests...</p>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.length > 0 ? (
              requests.map((req) => {
                const isRequester = currentUserId != null && Number(currentUserId) === Number(req.requesterId);

                return (
                  <div key={req.id} className="card-light p-6 rounded-3xl border border-slate-200/80 flex flex-col justify-between space-y-4 hover:border-orange-300 transition-all shadow-xs">

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-orange-50 text-orange-700 border border-orange-200">
                          {formatCategoryLabel(req.category)}
                        </span>

                        <span className="text-xs font-extrabold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-yellow-500 fill-amber-400 drop-shadow-xs" />
                          <span>Offer: ⚡ {req.creditBudget} Credits</span>
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-base">{req.title}</h3>

                      {/* Program & Domain Meta Badges */}
                      <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
                        <span className="bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-orange-600" />
                          <span>Program: {req.program || 'Other'}</span>
                        </span>

                        <span className="bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                          <span>Domain: {req.domainSubject || req.skillTag || 'General'}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{req.description}</p>

                      <div className="pt-1 text-[11px] text-slate-500">
                        <span><strong>Posted by:</strong> {req.requesterName} ({req.requesterCollege || 'College'})</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {req.applicationCount != null ? `${req.applicationCount} Applications` : ''}
                      </span>

                      <div className="flex items-center space-x-2">
                        {!isRequester && req.status === 'OPEN' && (
                          <button
                            onClick={() => handleOpenApplyModal(req)}
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center space-x-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Apply to Help</span>
                          </button>
                        )}

                        {isRequester && (
                          <>
                            {req.status === 'OPEN' && (
                              <button
                                onClick={() => handleOpenApplicationsModal(req)}
                                className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs rounded-xl border border-orange-200 transition-all flex items-center space-x-1"
                              >
                                <Users className="w-3.5 h-3.5" />
                                <span>View Applicants ({req.applicationCount || 0})</span>
                              </button>
                            )}

                            {req.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => handleCompleteRequest(req.id)}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Mark Completed (Transfer Credits)</span>
                              </button>
                            )}

                            {req.status === 'OPEN' && (
                              <button
                                onClick={() => handleCancelRequest(req.id)}
                                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition-all flex items-center space-x-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-16 card-light rounded-3xl">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">No student help requests found.</p>
                <p className="text-xs text-slate-400 mt-1">Be the first to post a student help request!</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL 1: CREATE STUDENT HELP REQUEST */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">

            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-amber-200" />
                <h3 className="text-lg font-bold">Create Student Help Request</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">

              {/* Form Order: Category, Program, Domain / Subject, Title, Description, Credit Budget */}

              {/* 1. Category */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={createData.category}
                  onChange={(e) => setCreateData({ ...createData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* 2. Program */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Program</label>
                <select
                  value={createData.program}
                  onChange={(e) => setCreateData({ ...createData, program: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-semibold"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* 3. Domain / Subject */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Domain / Subject</label>
                <input
                  type="text"
                  required
                  value={createData.domainSubject}
                  onChange={(e) => setCreateData({ ...createData, domainSubject: e.target.value, skillTag: e.target.value })}
                  placeholder="e.g. Backend Development"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                />

                {/* Quick Domain Suggestions */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {domainSuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setCreateData({ ...createData, domainSubject: sug, skillTag: sug })}
                      className="px-2 py-0.5 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-md text-[10px] font-semibold transition-colors"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Request Title */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Request Title</label>
                <input
                  type="text"
                  required
                  value={createData.title}
                  onChange={(e) => setCreateData({ ...createData, title: e.target.value })}
                  placeholder="e.g. Need help with Spring Boot REST API"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-semibold"
                />
              </div>

              {/* 5. Detailed Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  value={createData.description}
                  onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                  placeholder="Explain what help you need, what you've tried so far, and expected assistance..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              {/* 6. Credit Budget */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Credit Budget Offering</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={createData.creditBudget}
                  onChange={(e) => setCreateData({ ...createData, creditBudget: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-extrabold text-amber-800"
                />
              </div>

              <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                <span>Current Wallet Balance:</span>
                <span className="font-extrabold text-amber-800 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-500 fill-amber-400" />
                  <span>{currentUser?.walletBalance ?? 50} Credits</span>
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all"
              >
                Create Student Help Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: APPLY TO HELP */}
      {activeApplyRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-bold text-slate-800">Apply to Help Student</h3>
              </div>
              <button onClick={() => setActiveApplyRequest(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4 text-xs">

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Target Request</span>
                <p className="font-extrabold text-slate-900">{activeApplyRequest.title}</p>
                <p className="text-slate-500 text-[11px]">
                  Requester: {activeApplyRequest.requesterName} • Program: {activeApplyRequest.program || 'Other'} • Offer: {activeApplyRequest.creditBudget} Credits
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Application Message</label>
                <textarea
                  required
                  rows={4}
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  placeholder="Explain why you are a great fit to help with this request..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all"
              >
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW APPLICANTS & SELECT HELPER */}
      {activeViewApplicationsRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">

            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-bold text-slate-800">Applicants for Request</h3>
              </div>
              <button onClick={() => setActiveViewApplicationsRequest(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-orange-50 rounded-2xl border border-orange-200">
                <p className="font-extrabold text-orange-900">{activeViewApplicationsRequest.title}</p>
                <p className="text-[11px] text-orange-700 mt-0.5">Selecting an applicant will assign them to your request and auto-reject others.</p>
              </div>

              {applications.length > 0 ? (
                applications.map((app) => (
                  <div key={app.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-sm">{app.applicantName} ({app.applicantCollege || 'College'})</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${app.status === 'SELECTED' ? 'bg-emerald-100 text-emerald-800' :
                        app.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                        {app.status}
                      </span>
                    </div>

                    <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80">{app.message}</p>

                    {app.status === 'APPLIED' && (
                      <button
                        onClick={() => handleSelectApplicant(app.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Select This Helper</span>
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400">No applicants have applied to this request yet.</div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
