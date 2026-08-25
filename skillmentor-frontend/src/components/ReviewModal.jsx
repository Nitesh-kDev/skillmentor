import React, { useState, useEffect } from 'react';
import { X, Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function ReviewModal({ isOpen, onClose, session, onReviewSuccess }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setFeedback('');
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, session]);

  if (!isOpen || !session) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.submitReview(session.id, rating, feedback);
      if (res && (res.id || res.sessionId)) {
        setSuccessMsg('Review submitted successfully!');
        setTimeout(() => {
          if (onReviewSuccess) onReviewSuccess();
          onClose();
        }, 1200);
      } else {
        setError(res?.message || 'Failed to submit review');
      }
    } catch (err) {
      setError(err.message || 'Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200/80">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="text-base font-extrabold text-slate-900">Rate Your Mentorship Session</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Session & Mentor Context */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Session</span>
            <p className="font-extrabold text-slate-900 text-sm leading-snug">{session.title}</p>
            <div className="pt-1 text-slate-600 font-medium">
              <span>Mentor: </span>
              <strong className="text-slate-900">{session.mentorName}</strong>
            </div>
          </div>

          {/* How was your session? */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-800">How was your session?</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none transition-transform active:scale-110 cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= rating
                        ? 'text-amber-500 fill-amber-500 drop-shadow-2xs'
                        : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                {rating} / 5
              </span>
            </div>
          </div>

          {/* Feedback Text Area */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-800">Your feedback</label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell other students about your experience..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || Boolean(successMsg)}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Submitting Review...' : successMsg ? '✓ Review Submitted' : 'Submit Review'}
          </button>
        </form>

      </div>
    </div>
  );
}
