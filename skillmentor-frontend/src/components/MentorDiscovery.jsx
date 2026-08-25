import React, { useState, useEffect } from 'react';
import { Search, Star, ShieldCheck, Zap, ArrowRightLeft, UserCheck, Calendar, Filter, Sparkles, Building, GraduationCap, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function MentorDiscovery({ currentUser, onSelectMentor, onSelectPeerMatch }) {
  const [viewMode, setViewMode] = useState('mentors'); // 'mentors' | 'peerMatches'
  const [mentors, setMentors] = useState([]);
  const [peerMatches, setPeerMatches] = useState([]);
  const [searchSkill, setSearchSkill] = useState('');
  const [searchCollege, setSearchCollege] = useState('');
  const [filterMyCollegeOnly, setFilterMyCollegeOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMentors();
    if (viewMode === 'peerMatches') {
      fetchPeerMatches();
    }
  }, [viewMode, filterMyCollegeOnly, searchCollege]);

  const fetchMentors = async (skillQuery = searchSkill, collegeQuery = searchCollege) => {
    setLoading(true);
    setError('');
    try {
      const activeCollege = filterMyCollegeOnly && currentUser?.collegeName ? currentUser.collegeName : collegeQuery;
      const res = await api.searchMentors(skillQuery, activeCollege);
      setMentors(res || []);
    } catch (err) {
      setError('Failed to fetch mentors from backend server');
    } finally {
      setLoading(false);
    }
  };

  const fetchPeerMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getPeerMatches();
      setPeerMatches(res || []);
    } catch (err) {
      setError('Failed to calculate reciprocal peer skill matches');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMentors(searchSkill, searchCollege);
  };

  const isStudent = !currentUser || currentUser.role === 'STUDENT';

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-8 sm:p-10 text-white shadow-xl shadow-orange-500/10">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mentorship & Skill Exchange Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Connect with Alumni & Mentors Across Colleges
          </h1>
          <p className="mt-3 text-orange-100 text-sm sm:text-base leading-relaxed">
            Find verified seniors & alumni for placement guidance, or swap skills with student peers using credit tokens with zero money involved.
          </p>

          {/* Mode Switch Pills */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setViewMode('mentors')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                viewMode === 'mentors'
                  ? 'bg-white text-orange-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Mentors & Alumni</span>
            </button>

            <button
              onClick={() => { setViewMode('peerMatches'); fetchPeerMatches(); }}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                viewMode === 'peerMatches'
                  ? 'bg-white text-orange-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Peer Reciprocal Matcher</span>
            </button>
          </div>
        </div>

        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      </div>

      {/* SEARCH & REAL-TIME COLLEGE FILTER BAR */}
      {viewMode === 'mentors' && (
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchSkill}
                onChange={(e) => setSearchSkill(e.target.value)}
                placeholder="Search mentors by skill (e.g. React, Java, System Design, DSA)..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-xs text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
              />
            </div>

            <div className="relative w-full sm:w-64">
              <Building className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchCollege}
                onChange={(e) => setSearchCollege(e.target.value)}
                placeholder="Filter by College Name..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-xs text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium text-orange-900"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Filter className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>

          {currentUser?.collegeName && (
            <div className="flex items-center space-x-2 px-1">
              <input
                type="checkbox"
                id="myCollegeOnly"
                checked={filterMyCollegeOnly}
                onChange={(e) => setFilterMyCollegeOnly(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
              />
              <label htmlFor="myCollegeOnly" className="text-xs font-semibold text-slate-700 cursor-pointer">
                🎓 Show Mentors & Alumni from my college (<span className="text-orange-600 font-bold">{currentUser.collegeName}</span>)
              </label>
            </div>
          )}
        </form>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-slate-500 font-medium">Loading discovery results...</p>
        </div>
      )}

      {/* MENTORS & ALUMNI GRID VIEW */}
      {viewMode === 'mentors' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.length > 0 ? (
            mentors.map((mentor) => {
              const activeUser = currentUser || JSON.parse(localStorage.getItem('user') || '{}');
              const isSameCollege = Boolean(activeUser?.collegeName && mentor.collegeName &&
                activeUser.collegeName.toLowerCase().trim() === mentor.collegeName.toLowerCase().trim());

              const isSelf = activeUser && activeUser.id === mentor.id;
              const isStudentPeer = mentor.role === 'STUDENT';

              // Verified Same-College Guidance Benefit check (ALUMNI & MENTOR ROLES)
              const isSameCollegeAlumni = activeUser?.role === 'STUDENT' &&
                (mentor.role === 'ALUMNI' || mentor.role === 'MENTOR') &&
                mentor.verificationStatus === 'VERIFIED' &&
                isSameCollege;

              const benefitBadgeLabel = isSameCollegeAlumni && mentor.alumniBenefitType === 'FREE'
                ? ' (Free Guidance)'
                : (isSameCollegeAlumni && mentor.alumniBenefitType === 'DISCOUNT' && mentor.alumniDiscountPercent > 0
                  ? ` (${mentor.alumniDiscountPercent}% Off)`
                  : '');

              return (
                <div key={mentor.id} className="card-light card-light-hover rounded-2xl p-6 flex flex-col justify-between hover:border-orange-300 transition-all">
                  <div>
                    {/* Header info */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                          {mentor.name ? mentor.name.charAt(0) : 'M'}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                            {mentor.name}
                            {mentor.verificationStatus === 'VERIFIED' && (
                              <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-50" title="Verified Mentor" />
                            )}
                          </h3>
                          <p className="text-xs text-slate-500 font-semibold">
                            {mentor.role === 'ALUMNI' ? `Alumni (${mentor.passingYear || 'Graduate'})` : mentor.role}
                          </p>
                        </div>
                      </div>
                      
                      {/* Rating Badge */}
                      <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{mentor.averageRating ? mentor.averageRating.toFixed(1) : '5.0'}</span>
                        <span className="text-[10px] text-amber-600">({mentor.totalReviews ?? 0})</span>
                      </div>
                    </div>

                    {/* College & Career Badges */}
                    <div className="mt-3 space-y-1">
                      {isSameCollege && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800 border border-orange-200">
                          <GraduationCap className="w-3 h-3 text-orange-600" /> 
                          Same College {mentor.role === 'ALUMNI' ? 'Alumni' : (mentor.role === 'MENTOR' ? 'Mentor' : 'Peer')}
                          {benefitBadgeLabel}
                        </span>
                      )}

                      <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{mentor.collegeName || 'College Not Specified'}</span>
                      </div>

                      {mentor.currentCompany && (
                        <div className="text-[11px] text-orange-700 font-extrabold">
                          💼 {mentor.currentDesignation || 'Professional'} @ {mentor.currentCompany}
                        </div>
                      )}

                      <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-[10px]">{mentor.availableSlots || 'Schedule Not Set'}</span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {mentor.bio || 'No bio provided yet.'}
                    </p>

                    {/* Skills Chips */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {mentor.skills && mentor.skills.length > 0 ? (
                        mentor.skills.map((s) => (
                          <span key={s.id} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                            {s.skillName} ({s.proficiency})
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No skills listed</span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer - ALWAYS CLEAN & PROPERLY ALIGNED */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">
                        {isStudentPeer ? 'Peer Skill Exchange' : (isSameCollege || mentor.role === 'ALUMNI' ? 'Alumni Mentorship' : '1-on-1 Mentorship')}
                      </span>
                      {isStudentPeer ? (
                        <p className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1 mt-0.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>⚡ 10 Credits</span>
                        </p>
                      ) : (
                        <p className="text-base font-extrabold text-slate-900 mt-0.5">
                          ₹{mentor.hourlyRate ? mentor.hourlyRate : 800} <span className="text-xs font-normal text-slate-500">/ hr</span>
                        </p>
                      )}
                    </div>

                    {/* Book Session Button (Shown ONLY to Students for other users) */}
                    {isStudent && !isSelf && (
                      <button
                        onClick={() => onSelectMentor(mentor)}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{isStudentPeer ? 'Book Peer Session' : 'Book Session'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-16 card-light rounded-3xl">
              <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No mentors or alumni found matching your search criteria.</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing your college or skill search filters!</p>
            </div>
          )}
        </div>
      )}

      {/* PEER MATCHES VIEW */}
      {viewMode === 'peerMatches' && !loading && (
        <div className="space-y-4">
          <div className="p-4 bg-orange-50/90 border border-orange-200 rounded-2xl text-xs text-orange-900 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-orange-600 shrink-0" />
            <span>
              <strong>Smart Reciprocal Skill Matcher:</strong> Below are peers whose offered skills match what you want to learn, and who want what you teach! Exchange sessions cost <strong>0 Credits (Free Mutual Swap)</strong>.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {peerMatches.length > 0 ? (
              peerMatches.map((match) => (
                <div key={match.peerId} className="card-light card-light-hover rounded-2xl p-6 flex flex-col justify-between hover:border-orange-300 transition-all">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold flex items-center justify-center">
                          {match.peerName ? match.peerName.charAt(0) : 'P'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{match.peerName}</h4>
                          <p className="text-xs text-slate-500">{match.peerEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                        <Zap className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                        <span>Free Mutual Swap</span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-emerald-700">
                        <span className="font-semibold">They Teach You:</span>
                        <span className="font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{match.peerOffersSkill}</span>
                      </div>
                      <div className="flex items-center justify-between text-orange-700">
                        <span className="font-semibold">You Teach Them:</span>
                        <span className="font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded">{match.peerWantsSkill}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      0 Credits (Free Mutual Swap)
                    </span>
                    {isStudent && (
                      <button
                        onClick={() => onSelectPeerMatch(match)}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Request Peer Swap</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 card-light rounded-2xl">
                <ArrowRightLeft className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">No reciprocal peer matches found yet.</p>
                <p className="text-xs text-slate-400 mt-1">Try adding more "Offered" and "Wanted" skills to your user profile!</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
