import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  CreditCard, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Gift, 
  HelpCircle, 
  ShieldCheck, 
  X,
  FileText,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

export default function WalletDashboard({ currentUser, onWalletUpdate }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creditFilter, setCreditFilter] = useState('ALL'); // 'ALL' | 'EARNED' | 'SPENT' | 'PENDING'
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchWalletSummary();
  }, []);

  const fetchWalletSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getWalletSummary();
      setSummary(data);
      if (onWalletUpdate && data && data.availableCredits !== undefined) {
        onWalletUpdate(data.availableCredits);
      }
    } catch (err) {
      console.error('Failed to load wallet summary:', err);
      setError(err.message || 'Unable to load your wallet right now.');
    } finally {
      setLoading(false);
    }
  };

  // Filter credit activities dynamically
  const filteredActivities = (summary?.creditActivities || []).filter(act => {
    if (creditFilter === 'EARNED') return act.type === 'EARNED' || act.type === 'WELCOME_BONUS';
    if (creditFilter === 'SPENT') return act.type === 'SPENT';
    if (creditFilter === 'PENDING') return act.status === 'PENDING' || act.type === 'PENDING_SPENT';
    return true;
  });

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your Wallet</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage your peer learning credits and mentorship payment activity.
          </p>
        </div>

        <button
          onClick={fetchWalletSummary}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Wallet</span>
        </button>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchWalletSummary}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* LOADING SKELETON */}
      {loading && !summary ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-slate-100 rounded-3xl animate-pulse" />
            <div className="h-48 bg-slate-100 rounded-3xl animate-pulse" />
          </div>
          <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
        </div>
      ) : summary ? (
        <>
          {/* ==========================================
              1. TWO-PART WALLET SUMMARY CARDS
             ========================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD A: SKILLMENTOR CREDITS */}
            <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold border border-white/20">
                    <Zap className="w-3.5 h-3.5 fill-current text-amber-200" />
                    <span>Peer Learning Currency</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-amber-100 uppercase tracking-wider">Available Balance</h3>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight">{summary.availableCredits ?? 0}</span>
                    <span className="text-lg font-bold text-amber-100">Credits</span>
                  </div>
                </div>

                <p className="text-xs text-amber-100 leading-relaxed font-medium pt-1">
                  Earn credits by helping other students and spend them when you need peer help. No money is involved in peer credit exchanges.
                </p>
              </div>

              <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            </div>

            {/* CARD B: MENTORSHIP PAYMENTS */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col justify-between border border-slate-800">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
                    <CreditCard className="w-3.5 h-3.5 text-orange-500" />
                    <span>Real-Money Payments</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Paid</h3>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight">₹{summary.totalPaidINR ?? 0}</span>
                    <span className="text-xs font-semibold text-slate-400">INR</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-medium pt-1">
                  Track payments made for 1-on-1 sessions with verified mentors and alumni. Processed securely via Razorpay.
                </p>
              </div>

              <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-orange-500/10 blur-2xl pointer-events-none" />
            </div>

          </div>

          {/* ==========================================
              2. CREDIT SUMMARY METRICS & FILTERS
             ========================================== */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Credit Activity</h3>
                <p className="text-xs text-slate-500 font-medium">Track credits earned and spent through peer help sessions.</p>
              </div>

              {/* Activity Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto">
                <button
                  onClick={() => setCreditFilter('ALL')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    creditFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setCreditFilter('EARNED')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    creditFilter === 'EARNED' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Earned
                </button>
                <button
                  onClick={() => setCreditFilter('SPENT')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    creditFilter === 'SPENT' ? 'bg-white text-orange-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Spent
                </button>
                <button
                  onClick={() => setCreditFilter('PENDING')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    creditFilter === 'PENDING' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>

            {/* Credit Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-1">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">{summary.availableCredits ?? 0} Credits</p>
              </div>
              <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Earned</span>
                <p className="text-lg font-black text-emerald-700 mt-0.5">+{summary.earnedCredits ?? 0} Credits</p>
              </div>
              <div className="p-3.5 bg-orange-50/60 rounded-2xl border border-orange-100">
                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Spent</span>
                <p className="text-lg font-black text-orange-700 mt-0.5">−{summary.spentCredits ?? 0} Credits</p>
              </div>
              <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-100">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Pending</span>
                <p className="text-lg font-black text-amber-700 mt-0.5">{summary.pendingCredits ?? 0} Credits</p>
              </div>
            </div>

            {/* Credit Activity Table */}
            {filteredActivities.length > 0 ? (
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/60">
                      <th className="p-3 rounded-l-xl">Activity</th>
                      <th className="p-3">Student / Partner</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Credits</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 rounded-r-xl">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredActivities.map((act, index) => (
                      <tr key={act.id ? `act-${act.id}-${index}` : `act-${index}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{act.activityTitle}</td>
                        <td className="p-3 text-slate-700 font-medium">{act.partnerName}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                            act.type === 'WELCOME_BONUS' ? 'bg-amber-100 text-amber-800' :
                            act.type === 'EARNED' ? 'bg-emerald-100 text-emerald-800' :
                            act.type === 'SPENT' ? 'bg-orange-100 text-orange-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {act.type === 'WELCOME_BONUS' ? 'Welcome Bonus' : act.type === 'EARNED' ? 'Earned' : 'Spent'}
                          </span>
                        </td>
                        <td className={`p-3 font-extrabold text-sm ${
                          act.formattedCredits?.startsWith('+') ? 'text-emerald-600' :
                          act.formattedCredits?.startsWith('-') ? 'text-orange-600' :
                          'text-slate-600'
                        }`}>
                          ⚡ {act.formattedCredits} Credits
                        </td>
                        <td className="p-3 text-slate-500 font-medium">
                          {act.date ? new Date(act.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            act.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            act.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {act.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                Your credit activity will appear here once you earn or spend SkillMentor Credits.
              </div>
            )}
          </div>

          {/* ==========================================
              3. HOW SKILLMENTOR CREDITS WORK
             ========================================== */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">How SkillMentor Credits Work</h3>
              <p className="text-xs text-slate-500 font-medium">Simple 4-step peer exchange model.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                  🎁
                </div>
                <h4 className="font-bold text-xs text-slate-900">Step 1: Get Credits</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Receive welcome credits when registering your student profile.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  🤝
                </div>
                <h4 className="font-bold text-xs text-slate-900">Step 2: Help Peers</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Earn credits by successfully helping other students with doubts and skills.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-sm">
                  🎯
                </div>
                <h4 className="font-bold text-xs text-slate-900">Step 3: Request Help</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Use credits when requesting eligible peer help or technical guidance.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <h4 className="font-bold text-xs text-slate-900">Step 4: Complete Session</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Credits are settled automatically according to platform session rules.
                </p>
              </div>
            </div>
          </div>

          {/* ==========================================
              4. MENTORSHIP PAYMENTS HISTORY
             ========================================== */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-6 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Mentorship Payment History</h3>
                <p className="text-xs text-slate-500 font-medium">Payments made for sessions with verified mentors and alumni.</p>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Razorpay Secured
              </span>
            </div>

            {summary.mentorshipPayments && summary.mentorshipPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/60">
                      <th className="p-3 rounded-l-xl">Mentor</th>
                      <th className="p-3">Session</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 rounded-r-xl text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.mentorshipPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{p.mentorName}</td>
                        <td className="p-3 text-slate-700 font-medium">Session #{p.sessionId}</td>
                        <td className="p-3 font-black text-slate-900">₹{p.amount}</td>
                        <td className="p-3 text-slate-500 font-medium">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            p.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            p.status === 'INITIATED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {p.status === 'SUCCESS' ? 'Paid' : p.status === 'INITIATED' ? 'Pending' : p.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedPayment(p)}
                            className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                No mentorship payments yet.
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* ==========================================
          5. PAYMENT DETAILS MODAL
         ========================================== */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-100">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-orange-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Payment Receipt Details</h3>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Mentor</span>
                <span className="font-extrabold text-slate-900">{selectedPayment.mentorName}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Session ID</span>
                <span className="font-bold text-slate-800">#{selectedPayment.sessionId}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Amount Paid</span>
                <span className="font-black text-slate-900 text-sm">₹{selectedPayment.amount} {selectedPayment.currency}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Payment Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  selectedPayment.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {selectedPayment.status === 'SUCCESS' ? 'Paid' : selectedPayment.status}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Payment Date</span>
                <span className="font-medium text-slate-700">
                  {selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString() : '—'}
                </span>
              </div>

              {selectedPayment.razorpayOrderId && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Razorpay Order ID</span>
                  <span className="font-mono text-[11px] text-slate-600">{selectedPayment.razorpayOrderId}</span>
                </div>
              )}

              {selectedPayment.razorpayPaymentId && (
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-medium">Razorpay Payment ID</span>
                  <span className="font-mono text-[11px] text-slate-600">{selectedPayment.razorpayPaymentId}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedPayment(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
