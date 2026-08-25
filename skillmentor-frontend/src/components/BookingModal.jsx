import React, { useState } from 'react';
import { X, Calendar, Clock, Zap, CreditCard, ShieldCheck, AlertCircle, GraduationCap, Building, ArrowRightLeft } from 'lucide-react';
import { api } from '../services/api';

export default function BookingModal({ isOpen, onClose, selectedMentor, currentUser, isPeerMatch, onBookingSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    topicSkill: '',
    scheduledTime: '',
    durationMinutes: 60
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !selectedMentor) return null;

  const activeUser = currentUser || JSON.parse(localStorage.getItem('user') || '{}');
  const mentorName = selectedMentor.name || selectedMentor.peerName || 'Student / Mentor';
  const mentorId = selectedMentor.id || selectedMentor.peerId;

  // Provider Role Based Session Economy (STUDENT = Peer Credit; MENTOR/ALUMNI = Paid Mentorship)
  const providerRole = selectedMentor.role || (selectedMentor.hourlyRate ? 'MENTOR' : 'STUDENT');
  const isStudentPeer = providerRole === 'STUDENT' || isPeerMatch || Boolean(selectedMentor.peerOffersSkill);
  const isPeerSwap = isStudentPeer;

  const scheduleTitle = isStudentPeer 
    ? `${mentorName}'s Set Available Days & Time Slots:` 
    : `Mentor ${mentorName}'s Available Days & Time Slots:`;

  const availableSlots = (selectedMentor.availableSlots && selectedMentor.availableSlots.trim()) 
    ? selectedMentor.availableSlots.trim() 
    : 'Schedule not set yet (Contact for preferred time)';

  // SAME COLLEGE VERIFIED ALUMNI BENEFIT CHECK
  const isSameCollege = Boolean(selectedMentor.collegeName && activeUser?.collegeName &&
    selectedMentor.collegeName.toLowerCase().trim() === activeUser.collegeName.toLowerCase().trim());

  const isSameCollegeAlumni = activeUser?.role === 'STUDENT' &&
    (selectedMentor.role === 'ALUMNI' || selectedMentor.role === 'MENTOR') &&
    selectedMentor.verificationStatus === 'VERIFIED' &&
    isSameCollege;

  const alumniBenefitType = selectedMentor.alumniBenefitType || 'NONE';
  const alumniDiscountPercent = selectedMentor.alumniDiscountPercent || 0;

  // DYNAMIC PRICE CALCULATION (30 min vs 60 min)
  const durationMin = parseInt(formData.durationMinutes) || 60;
  const baseHourlyRate = selectedMentor.hourlyRate || 800;
  const baseSessionPrice = Math.round((baseHourlyRate / 60) * durationMin);

  let calculatedPrice = baseSessionPrice;
  let isFreeAlumniSession = false;
  let isDiscountedAlumniSession = false;

  if (!isPeerSwap && isSameCollegeAlumni) {
    if (alumniBenefitType === 'FREE') {
      calculatedPrice = 0;
      isFreeAlumniSession = true;
    } else if (alumniBenefitType === 'DISCOUNT' && alumniDiscountPercent > 0) {
      if (alumniDiscountPercent >= 100) {
        calculatedPrice = 0;
        isFreeAlumniSession = true;
      } else {
        calculatedPrice = Math.round(baseSessionPrice * (1.0 - alumniDiscountPercent / 100.0));
        isDiscountedAlumniSession = true;
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.scheduledTime) {
      setError('Please select a valid session date and time.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        mentorId: mentorId,
        title: formData.title || (isPeerMatch ? `Reciprocal Swap: ${selectedMentor.peerOffersSkill || 'Skills'}` : (isPeerSwap ? `Peer Skill Exchange: ${formData.topicSkill || 'Tech'}` : `Mentorship Session: ${formData.topicSkill || 'Tech'}`)),
        topicSkill: formData.topicSkill || (selectedMentor.peerOffersSkill || 'Mentorship'),
        scheduledTime: formData.scheduledTime,
        durationMinutes: durationMin,
        sessionType: isPeerSwap ? 'PEER_CREDIT' : 'PAID_MENTOR',
        creditCost: isPeerMatch ? 0 : (isPeerSwap ? 10 : 0)
      };

      await api.createBooking(payload);
      onBookingSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Booking submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-amber-200" />
            <h3 className="text-lg font-bold">
              {isPeerMatch ? `Confirm Reciprocal Swap with ${mentorName}` : (isPeerSwap ? `Request Peer Swap with ${mentorName}` : `Book Mentorship Session with ${mentorName}`)}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* AVAILABILITY SLOT BADGE */}
          <div className="p-3.5 bg-orange-50/90 rounded-2xl border border-orange-200 text-orange-900 space-y-1">
            <div className="flex items-center gap-1.5 font-extrabold text-[11px] text-orange-900">
              <Clock className="w-4 h-4 text-orange-600 shrink-0" />
              <span>{scheduleTitle}</span>
            </div>
            <p className="font-mono text-xs font-bold text-orange-800 pl-5">
              {availableSlots}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Session Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={isPeerMatch ? `Direct Mutual Swap: ${selectedMentor.peerOffersSkill || 'Skills'}` : (isPeerSwap ? `Peer Exchange: ${selectedMentor.peerOffersSkill || 'Skills'}` : 'e.g. Resume Review & Mock Interview Guidance')}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Topic / Skill Focus</label>
              <input
                type="text"
                required
                value={formData.topicSkill}
                onChange={(e) => setFormData({ ...formData, topicSkill: e.target.value })}
                placeholder="e.g. React, Java, DSA..."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Duration</label>
              <select
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-bold"
              >
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes (1 Hr)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Scheduled Date & Time</label>
            <input
              type="datetime-local"
              required
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
            />
          </div>

          {/* DYNAMIC PRICE & POLICY BADGE */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-500 block">Session Exchange Policy:</span>
              <span className="text-[11px] font-bold text-slate-700">
                {isPeerMatch ? '🤝 Mutual Reciprocal Skill Swap' : 
                 (isFreeAlumniSession ? '🎓 Same-College Alumni Benefit (FREE)' : 
                 (isDiscountedAlumniSession ? `🎓 Same-College Alumni Benefit (${alumniDiscountPercent}% Discount)` : 
                 (isSameCollege ? '🎓 Same College Connection' : '🌐 Professional Mentorship')))}
              </span>
            </div>

            {isPeerMatch ? (
              <span className="font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                <span>0 Credits (Free Mutual Swap)</span>
              </span>
            ) : isPeerSwap ? (
              <span className="font-extrabold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-yellow-500 fill-amber-400 drop-shadow-xs" />
                <span>⚡ 10 Credits</span>
              </span>
            ) : isFreeAlumniSession ? (
              <span className="font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>FREE Guidance (₹0 Payable)</span>
              </span>
            ) : isDiscountedAlumniSession ? (
              <span className="font-extrabold text-orange-900 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200 flex items-center gap-1.5 shadow-2xs">
                <CreditCard className="w-4 h-4 text-orange-600" />
                <span>₹{calculatedPrice} for {durationMin} min ({alumniDiscountPercent}% OFF, Reg: ₹{baseSessionPrice})</span>
              </span>
            ) : (
              <span className="font-extrabold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-2xs">
                <CreditCard className="w-4 h-4 text-slate-600" />
                <span>₹{calculatedPrice} for {durationMin} min (₹{baseHourlyRate}/hr)</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Confirming Booking...' : (isPeerMatch ? 'Confirm 0-Credit Mutual Swap' : (isPeerSwap ? 'Confirm 10-Credit Peer Swap' : (isFreeAlumniSession ? 'Confirm Free Booking (₹0)' : `Book Session (₹${calculatedPrice}) & Proceed`)))}
          </button>

        </form>
      </div>
    </div>
  );
}
