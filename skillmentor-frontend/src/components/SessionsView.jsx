import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  CreditCard, 
  Star, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  GraduationCap, 
  Check,
  UserCheck,
  Compass
} from 'lucide-react';
import { api } from '../services/api';
import { formatSessionDateTime } from '../utils/dateUtils';

export default function SessionsView({ currentUser, onOpenChat, onOpenReview, onPaySession, onProfileUpdated, onExploreMentors }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const currentUserId = currentUser ? (currentUser.id || currentUser.userId) : null;

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getMySessions();
      setSessions(res || []);
    } catch (err) {
      setError('Unable to load sessions.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (sessionId, newStatus) => {
    setError('');
    setMsg('');
    try {
      await api.updateSessionStatus(sessionId, newStatus);
      setMsg(`Session status updated to ${newStatus.toLowerCase()} successfully!`);
      await fetchSessions();
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      setError(err.message || 'Failed to update session status');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Sessions & Live Chat</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage your booked mentorship meetings, join real-time chat rooms, and review completed sessions.
          </p>
        </div>

        <button
          onClick={fetchSessions}
          disabled={loading}
          className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Sessions</span>
        </button>
      </div>

      {/* Success Notification */}
      {msg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2.5 font-medium shadow-2xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center justify-between font-medium shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchSessions}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl space-y-3">
          <div className="inline-block w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-bold">Loading sessions...</p>
        </div>
      )}

      {/* SESSIONS LIST */}
      {!loading && (
        <div className="space-y-4">
          {sessions.length > 0 ? (
            sessions.map((session) => {
              const isUserStudentInSession = currentUserId != null && Number(currentUserId) === Number(session.studentId);
              
              // Dynamic Participant Name & Role Resolution (STEP 2)
              const partnerName = isUserStudentInSession ? session.mentorName : session.studentName;
              
              // Provider & Participant Role Mapping
              const rawRole = isUserStudentInSession ? session.mentorRole : session.studentRole;
              let partnerRoleLabel = 'Student';
              if (rawRole === 'MENTOR') {
                partnerRoleLabel = 'Mentor';
              } else if (rawRole === 'ALUMNI') {
                partnerRoleLabel = 'Alumni';
              } else if (rawRole === 'STUDENT') {
                partnerRoleLabel = 'Student';
              }

              // Payment requirement check
              const isPaymentRequired = session.paymentRequired == null 
                ? (session.sessionType === 'PAID_MENTOR' && session.priceInINR > 0) 
                : Boolean(session.paymentRequired);

              // Payment Button strictly for STUDENT on PENDING paid sessions
              const isStudentRole = currentUser?.role === 'STUDENT';
              const showPaymentButton = isStudentRole && isUserStudentInSession &&
                session.sessionType === 'PAID_MENTOR' && session.status === 'PENDING' && isPaymentRequired && session.priceInINR > 0;

              // Rating Eligibility Check (STEP 6 & STEP 7):
              // Ratings allowed ONLY for MENTOR or ALUMNI providers on COMPLETED sessions
              const isProviderMentorOrAlumni = rawRole === 'MENTOR' || rawRole === 'ALUMNI' || session.mentorRole === 'MENTOR' || session.mentorRole === 'ALUMNI';
              const canReviewSession = isUserStudentInSession && 
                isProviderMentorOrAlumni && 
                session.status === 'COMPLETED' && 
                !session.hasBeenReviewed;

              const isAlreadyReviewed = isUserStudentInSession && isProviderMentorOrAlumni && Boolean(session.hasBeenReviewed);

              // Session Type Label (STEP 3)
              const getSessionTypeTag = () => {
                if (session.sessionType === 'PAID_MENTOR') {
                  if (!isPaymentRequired) {
                    return (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 font-extrabold text-xs">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Free Alumni Guidance (₹0)</span>
                      </span>
                    );
                  }
                  return (
                    <span className="text-slate-800 font-extrabold text-xs">
                      Paid Mentorship · ₹{session.priceInINR}
                    </span>
                  );
                } else {
                  // PEER_CREDIT
                  if (session.creditCost === 0) {
                    return (
                      <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 font-extrabold text-xs">
                        Free Mutual Swap
                      </span>
                    );
                  }
                  const isHelpRequest = session.title?.toLowerCase().includes('help') || session.title?.toLowerCase().includes('request');
                  return (
                    <span className="text-slate-800 font-extrabold text-xs flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                      <span>{isHelpRequest ? 'Student Help' : `⚡ ${session.creditCost || 10} Credit Swap`}</span>
                    </span>
                  );
                }
              };

              // User-Friendly Status Label & Badge Color (STEP 5)
              const getStatusBadge = () => {
                switch (session.status) {
                  case 'ACCEPTED':
                    return { label: 'Accepted', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
                  case 'COMPLETED':
                    return { label: 'Completed', class: 'bg-orange-50 text-orange-700 border-orange-200' };
                  case 'REJECTED':
                    return { label: 'Rejected', class: 'bg-red-50 text-red-700 border-red-200' };
                  case 'CANCELLED':
                    return { label: 'Cancelled', class: 'bg-slate-100 text-slate-600 border-slate-200' };
                  case 'PENDING':
                  default:
                    return { label: 'Pending', class: 'bg-amber-50 text-amber-700 border-amber-200' };
                }
              };

              const badge = getStatusBadge();

              return (
                <div 
                  key={session.id} 
                  className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  
                  {/* Left Info Column */}
                  <div className="space-y-2 flex-1">
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {/* User-Friendly Status Badge (STEP 5) */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${badge.class}`}>
                        {badge.label}
                      </span>

                      {/* Explicit Session Type Display (STEP 3) */}
                      {getSessionTypeTag()}
                    </div>

                    {/* Session Title */}
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">{session.title}</h3>
                    
                    {/* Dynamic Role Display (STEP 2): "With: Adarsh Porwal · Student" */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 font-medium">
                      <span>
                        <strong className="text-slate-400 font-semibold">With:</strong>{' '}
                        <span className="font-extrabold text-slate-900">{partnerName}</span>{' '}
                        <span className="text-slate-400 font-semibold">·</span>{' '}
                        <span className="font-bold text-slate-700">{partnerRoleLabel}</span>
                      </span>
                      {session.topicSkill && (
                        <span>
                          <strong className="text-slate-400 font-semibold">Topic:</strong>{' '}
                          <span className="font-bold text-slate-800">{session.topicSkill}</span>
                        </span>
                      )}
                    </div>

                    {/* Clean Formatted Date & Time (STEP 4) */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs pt-1">
                      <span className="flex items-center gap-1.5 text-slate-500 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatSessionDateTime(session.scheduledTime)}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{session.durationMinutes || 60} minutes</span>
                      </span>
                    </div>

                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end">
                    
                    {/* ACCEPT / DECLINE BUTTONS FOR PENDING REQUESTS (MENTOR / ALUMNI / PROVIDER) */}
                    {session.status === 'PENDING' && !isUserStudentInSession && (
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleUpdateStatus(session.id, 'ACCEPTED')}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                          title="Accept Session Request"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept Request</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(session.id, 'REJECTED')}
                          className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition-all flex items-center space-x-1 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}

                    {/* MARK SESSION COMPLETED BUTTON STRICTLY FOR MENTOR / ALUMNI */}
                    {session.status === 'ACCEPTED' && !isUserStudentInSession && (
                      <button
                        onClick={() => handleUpdateStatus(session.id, 'COMPLETED')}
                        className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-xl border border-emerald-200 transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Mark Session Completed</span>
                      </button>
                    )}

                    {/* STRICTLY STUDENT ONLY PAYMENT BUTTON */}
                    {showPaymentButton && (
                      <button
                        onClick={() => onPaySession(session)}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Pay ₹{session.priceInINR} via Razorpay</span>
                      </button>
                    )}

                    {/* LIVE CHAT ROOM BUTTON */}
                    <button
                      onClick={() => onOpenChat(session)}
                      className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs rounded-xl border border-orange-200 transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-orange-600" />
                      <span>Live Chat Room</span>
                    </button>

                    {/* RATE & REVIEW BUTTON (STRICTLY FOR COMPLETED MENTOR/ALUMNI SESSIONS) */}
                    {canReviewSession && (
                      <button
                        onClick={() => onOpenReview(session)}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 text-white fill-white" />
                        <span>Rate & Review</span>
                      </button>
                    )}

                    {/* ALREADY REVIEWED BADGE */}
                    {isAlreadyReviewed && (
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-600 font-extrabold text-xs rounded-xl border border-slate-200 flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Reviewed</span>
                      </span>
                    )}

                  </div>

                </div>
              );
            })
          ) : (
            /* Professional Empty State (STEP 15) */
            <div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl p-8 space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">No sessions yet</h3>
                <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto mt-1">
                  Your booked mentorship and student-help sessions will appear here once scheduled.
                </p>
              </div>

              {onExploreMentors && (
                <div className="pt-2">
                  <button
                    onClick={onExploreMentors}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <Compass className="w-4 h-4 text-orange-400" />
                    <span>Explore Mentors</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
