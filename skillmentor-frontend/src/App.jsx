import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import MentorDiscovery from './components/MentorDiscovery';
import BookingModal from './components/BookingModal';
import WalletDashboard from './components/WalletDashboard';
import SessionsView from './components/SessionsView';
import LiveChatModal from './components/LiveChatModal';
import ReviewModal from './components/ReviewModal';
import OpenApiDocsModal from './components/OpenApiDocsModal';
import AdminPanel from './components/AdminPanel';
import MentorDashboard from './components/MentorDashboard';
import StudentProfileModal from './components/StudentProfileModal';
import MentorProfileModal from './components/MentorProfileModal';
import PaymentReceiptModal from './components/PaymentReceiptModal';
import LandingPage from './components/LandingPage';
import PeerSkillExchangeView from './components/PeerSkillExchangeView';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing'); // 'landing' | 'discovery' | 'mentorDashboard' | 'sessions' | 'wallet' | 'admin'
  const [currentUser, setCurrentUser] = useState(null);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isStudentProfileOpen, setIsStudentProfileOpen] = useState(false);
  const [isMentorProfileOpen, setIsMentorProfileOpen] = useState(false);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isPeerMatch, setIsPeerMatch] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatSession, setActiveChatSession] = useState(null);

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [activeReviewSession, setActiveReviewSession] = useState(null);

  const [isApiDocsOpen, setIsApiDocsOpen] = useState(false);

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    // Attempt auto-login if JWT token exists
    const token = localStorage.getItem('token');
    if (token) {
      refreshCurrentUser();
    }
  }, []);

  const refreshCurrentUser = () => {
    api.getCurrentUser()
      .then((user) => {
        if (user && (user.id || user.userId)) {
          handleUserAuthenticated(user);
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        setActiveTab('landing');
      });
  };

  const handleUserAuthenticated = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    // Role-based initial tab routing
    if (user.role === 'ADMIN') {
      setActiveTab('admin');
    } else if (user.role === 'MENTOR' || user.role === 'ALUMNI') {
      setActiveTab('mentorDashboard');
    } else {
      setActiveTab('discovery');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setActiveTab('landing');
  };

  const handleOpenBookingForMentor = (mentor) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setSelectedMentor(mentor);
    setIsPeerMatch(false);
    setIsBookingOpen(true);
  };

  const handleOpenBookingForPeer = (peerMatch) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setSelectedMentor(peerMatch);
    setIsPeerMatch(true);
    setIsBookingOpen(true);
  };

  const handleOpenProfileForUser = () => {
    if (!currentUser) return;
    if (currentUser.role === 'STUDENT') {
      setIsStudentProfileOpen(true);
    } else if (currentUser.role === 'MENTOR' || currentUser.role === 'ALUMNI') {
      setIsMentorProfileOpen(true);
    }
  };

  // STEP 2: FRONTEND - Razorpay Standard Web Checkout Integration
  const handlePaySessionWithRazorpay = async (session) => {
    try {
      // 1. Backend Call: Create Razorpay Order (Backend determines authoritative amount)
      const orderRes = await api.createRazorpayOrder(session.id);

      const rzpOrderId = orderRes?.razorpay_order_id || orderRes?.order_id || orderRes?.razorpayOrderId;

      if (!orderRes || !rzpOrderId) {
        console.error('Order creation response payload error:', orderRes);
        alert('Failed to initialize Razorpay Order from backend. Please ensure Spring Boot backend is running.');
        return;
      }

      const razorpayKeyId = orderRes?.keyId || orderRes?.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || '';
      const orderAmountPaise = orderRes?.amount ? Math.round(orderRes.amount * 100) : (session.priceInINR ? Math.round(session.priceInINR * 100) : null);
      const orderAmountINR = orderRes?.amount || session.priceInINR;

      // Check if Razorpay SDK script is loaded
      if (typeof window.Razorpay !== 'function') {
        alert('Payment gateway SDK is currently unavailable. Please refresh the page or check your internet connection.');
        return;
      }

      // 2. Razorpay Modal Options Configuration
      const options = {
        key: razorpayKeyId,
        amount: orderAmountPaise, // in paise from backend response
        currency: orderRes?.currency || 'INR',
        name: 'SkillMentor',
        description: `Mentorship Session Booking #${session.id} (${session.topicSkill || 'Mentorship'})`,
        image: '/logo.png',
        order_id: rzpOrderId,
        prefill: {
          name: currentUser?.name || 'Student',
          email: currentUser?.email || 'student@jssaten.ac.in',
          contact: currentUser?.phone || '9999999999'
        },
        notes: {
          sessionId: session.id,
          studentName: currentUser?.name
        },
        theme: {
          color: '#F97316' // Warm Orange theme matching logo
        },
        handler: async function (response) {
          try {
            const isVerified = await api.verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id || response.order_id || rzpOrderId,
              razorpayPaymentId: response.razorpay_payment_id || response.payment_id,
              razorpaySignature: response.razorpay_signature || response.signature,
              sessionId: session.id
            });

            if (isVerified) {
              setReceiptData({
                amount: orderAmountINR,
                sessionTitle: session.title,
                mentorName: session.mentorName,
                razorpayOrderId: response.razorpay_order_id || rzpOrderId,
                razorpayPaymentId: response.razorpay_payment_id || response.payment_id,
                session: session
              });
              setIsReceiptOpen(true);
              setActiveTab('sessions');
            } else {
              alert('Payment Verification Failed: HMAC signature mismatch.');
            }
          } catch (verifyErr) {
            alert('Error during signature verification: ' + verifyErr.message);
          }
        },
        modal: {
          ondismiss: function () {
            console.log('Razorpay Checkout Modal dismissed by user.');
          }
        }
      };

      try {
        const razorpayInstance = new window.Razorpay(options);

        razorpayInstance.on('payment.failed', function (response) {
          alert(`Payment Failed! Reason: ${response.error?.description || 'Transaction declined'}`);
        });

        razorpayInstance.open();
      } catch (sdkError) {
        console.error('Razorpay SDK Checkout Error:', sdkError);
        alert('Failed to launch Razorpay Checkout. Please check network connection and try again.');
      }

    } catch (err) {
      console.error('Razorpay checkout initialization error:', err);
      alert(err.message || 'Payment initialization failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Inter',sans-serif]">

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenApiDocs={() => setIsApiDocsOpen(true)}
        onOpenProfileModal={handleOpenProfileForUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* PUBLIC PRE-LOGIN LANDING PAGE */}
        {activeTab === 'landing' && (
          <LandingPage
            onOpenAuth={() => setIsAuthOpen(true)}
            onExploreDiscovery={() => setActiveTab('discovery')}
          />
        )}

        {/* DISCOVERY VIEW */}
        {activeTab === 'discovery' && (
          <MentorDiscovery
            currentUser={currentUser}
            onSelectMentor={handleOpenBookingForMentor}
            onSelectPeerMatch={handleOpenBookingForPeer}
          />
        )}

        {/* PEER SKILL EXCHANGE & HELP REQUESTS VIEW */}
        {activeTab === 'peerExchange' && (
          <PeerSkillExchangeView
            currentUser={currentUser}
            onProfileUpdated={refreshCurrentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {/* MENTOR / ALUMNI WORKSPACE */}
        {activeTab === 'mentorDashboard' && (
          <MentorDashboard
            currentUser={currentUser}
            onOpenChat={(session) => { setActiveChatSession(session); setIsChatOpen(true); }}
          />
        )}

        {/* SESSIONS & CHAT VIEW */}
        {activeTab === 'sessions' && (
          <SessionsView
            currentUser={currentUser}
            onOpenChat={(session) => { setActiveChatSession(session); setIsChatOpen(true); }}
            onOpenReview={(session) => { setActiveReviewSession(session); setIsReviewOpen(true); }}
            onPaySession={handlePaySessionWithRazorpay}
            onProfileUpdated={refreshCurrentUser}
            onExploreMentors={() => setActiveTab('discovery')}
          />
        )}

        {/* WALLET & PAYMENTS (STUDENT) */}
        {activeTab === 'wallet' && (
          <WalletDashboard
            currentUser={currentUser}
            onWalletUpdate={(newBal) => setCurrentUser((prev) => prev ? { ...prev, walletBalance: newBal } : prev)}
          />
        )}

        {/* ADMIN GOVERNANCE PORTAL (ADMIN ONLY) */}
        {activeTab === 'admin' && (
          <AdminPanel currentUser={currentUser} />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 SkillMentor developed by Nitesh kumar</p>
          <div className="flex space-x-4 font-semibold text-slate-600">
            <button onClick={() => setIsApiDocsOpen(true)} className="hover:text-blue-600">OpenAPI Docs</button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleUserAuthenticated}
      />

      <StudentProfileModal
        isOpen={isStudentProfileOpen}
        onClose={() => setIsStudentProfileOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={refreshCurrentUser}
      />

      <MentorProfileModal
        isOpen={isMentorProfileOpen}
        onClose={() => setIsMentorProfileOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={refreshCurrentUser}
      />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedMentor={selectedMentor}
        currentUser={currentUser}
        isPeerMatch={isPeerMatch}
        onBookingSuccess={() => { setActiveTab('sessions'); refreshCurrentUser(); }}
      />

      <LiveChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        session={activeChatSession}
        currentUser={currentUser}
      />

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        session={activeReviewSession}
        onReviewSuccess={() => setActiveTab('sessions')}
      />

      <PaymentReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receiptData={receiptData}
        onOpenChat={() => {
          if (receiptData?.session) {
            setActiveChatSession(receiptData.session);
            setIsChatOpen(true);
          }
        }}
      />

      <OpenApiDocsModal
        isOpen={isApiDocsOpen}
        onClose={() => setIsApiDocsOpen(false)}
      />

    </div>
  );
}
