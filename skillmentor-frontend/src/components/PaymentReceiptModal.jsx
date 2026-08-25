import React from 'react';
import { X, CheckCircle2, ShieldCheck, CreditCard, ExternalLink, MessageSquare } from 'lucide-react';

export default function PaymentReceiptModal({ isOpen, onClose, receiptData, onOpenChat }) {
  if (!isOpen || !receiptData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Top Decorative Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2 shadow-inner">
            <CheckCircle2 className="w-8 h-8 text-white fill-white/20" />
          </div>
          <h3 className="text-xl font-extrabold">Razorpay Payment Verified!</h3>
          <p className="text-xs text-emerald-100 mt-1">Session booking status updated to ACCEPTED</p>
          
          <button onClick={onClose} className="absolute right-4 top-4 p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Details Body */}
        <div className="p-6 space-y-4 text-xs">
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-slate-500 font-semibold">
              <span>Amount Paid</span>
              <span className="text-base font-extrabold text-slate-900">₹{receiptData.amount || 800} INR</span>
            </div>
            
            <div className="border-t border-slate-200/60 pt-2 space-y-1.5 text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Session Title</span>
                <span className="font-bold text-slate-900">{receiptData.sessionTitle || 'Mentorship Session'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Mentor</span>
                <span className="font-semibold text-blue-700">{receiptData.mentorName || 'Alex Rivera'}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Razorpay Order ID:</span>
              <span className="font-bold text-slate-800">{receiptData.razorpayOrderId}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Razorpay Payment ID:</span>
              <span className="font-bold text-slate-800">{receiptData.razorpayPaymentId}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>HMAC Signature:</span>
              <span className="font-bold text-emerald-700">VERIFIED ✓</span>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => { onClose(); if (onOpenChat) onOpenChat(); }}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center space-x-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open Live Chat</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Close Receipt
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
