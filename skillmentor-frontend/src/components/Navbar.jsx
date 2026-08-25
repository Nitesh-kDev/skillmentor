import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Zap,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  CreditCard,
  MessageSquare,
  Briefcase,
  LayoutDashboard,
  Home,
  ChevronDown,
  Menu,
  X,
  ArrowRightLeft,
  Calendar,
  Compass,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenApiDocs,
  onOpenProfileModal
}) {
  const [openDropdown, setOpenDropdown] = useState(null); // 'explore' | 'sessions' | 'workspace' | 'profile' | null
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  const isAdmin = currentUser && currentUser.role === 'ADMIN';
  const isMentorOrAlumni = currentUser && (currentUser.role === 'MENTOR' || currentUser.role === 'ALUMNI');
  const isStudent = currentUser && currentUser.role === 'STUDENT';

  // Close dropdowns on click outside or Escape press
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown(prev => prev === name ? null : name);
  };

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const initialLetter = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs" ref={navRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand Logo Image */}
          <div
            className="flex items-center space-x-3 cursor-pointer shrink-0"
            onClick={() => handleNavigate(currentUser ? (isAdmin ? 'admin' : (isMentorOrAlumni ? 'mentorDashboard' : 'discovery')) : 'landing')}
          >
            <img src="/logo.png" alt="SkillMentor Logo" className="h-9 object-contain" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 font-medium text-xs">

            {/* PUBLIC HOME LINK */}
            <button
              onClick={() => handleNavigate('landing')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${activeTab === 'landing'
                ? 'text-orange-600 font-bold bg-orange-50/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            {/* STUDENT NAVIGATION (Explore ▾, My Sessions ▾, Wallet) */}
            {isStudent && (
              <>
                {/* EXPLORE DROPDOWN */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('explore')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors cursor-pointer ${activeTab === 'discovery' || activeTab === 'peerExchange'
                      ? 'text-orange-600 font-bold bg-orange-50/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    <Compass className="w-4 h-4 text-orange-500" />
                    <span>Explore</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'explore' ? 'rotate-180 text-orange-600' : 'text-slate-400'}`} />
                  </button>

                  {openDropdown === 'explore' && (
                    <div className="absolute left-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Explore Opportunities
                      </div>
                      <button
                        onClick={() => handleNavigate('discovery')}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${activeTab === 'discovery' ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        <BookOpen className="w-4 h-4 text-orange-500" />
                        <div>
                          <p className="font-bold leading-tight">Mentors & Alumni</p>
                          <p className="text-[10px] text-slate-400 font-normal">Connect for guidance & mock interviews</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleNavigate('peerExchange')}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${activeTab === 'peerExchange' ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        <ArrowRightLeft className="w-4 h-4 text-orange-500" />
                        <div>
                          <p className="font-bold leading-tight">Student Help Requests</p>
                          <p className="text-[10px] text-slate-400 font-normal">Post & fulfill peer help requests</p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* MY SESSIONS DIRECT BUTTON */}
                <button
                  onClick={() => handleNavigate('sessions')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${activeTab === 'sessions'
                    ? 'text-orange-600 font-bold bg-orange-50/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>My Sessions</span>
                </button>

                {/* WALLET */}
                <button
                  onClick={() => handleNavigate('wallet')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${activeTab === 'wallet'
                    ? 'text-orange-600 font-bold bg-orange-50/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <span>Wallet</span>
                </button>
              </>
            )}

            {/* MENTOR / ALUMNI WORKSPACE */}
            {isMentorOrAlumni && !isAdmin && (
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('workspace')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors cursor-pointer ${activeTab === 'mentorDashboard' || activeTab === 'sessions'
                    ? 'text-orange-600 font-bold bg-orange-50/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-orange-600" />
                  <span>Workspace</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'workspace' ? 'rotate-180 text-orange-600' : 'text-slate-400'}`} />
                </button>

                {openDropdown === 'workspace' && (
                  <div className="absolute left-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Mentor Portal
                    </div>
                    <button
                      onClick={() => handleNavigate('mentorDashboard')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${activeTab === 'mentorDashboard' ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-orange-600" />
                      <span>My Workspace</span>
                    </button>
                    <button
                      onClick={() => handleNavigate('sessions')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${activeTab === 'sessions' ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      <MessageSquare className="w-4 h-4 text-orange-600" />
                      <span>Student Requests & Chat</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ADMIN GOVERNANCE PORTAL */}
            {isAdmin && (
              <button
                onClick={() => handleNavigate('admin')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${activeTab === 'admin'
                  ? 'text-orange-600 font-bold bg-orange-50/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                <span>Admin Governance Portal</span>
              </button>
            )}

            {/* UNAUTHENTICATED PUBLIC LINKS */}
            {!currentUser && (
              <>
                <button
                  onClick={() => handleNavigate('discovery')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${activeTab === 'discovery'
                    ? 'text-orange-600 font-bold bg-orange-50/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span>Mentors & Alumni</span>
                </button>

                <button
                  onClick={() => handleNavigate('peerExchange')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${activeTab === 'peerExchange'
                    ? 'text-orange-600 font-bold bg-orange-50/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <ArrowRightLeft className="w-4 h-4 text-orange-500" />
                  <span>Student Help Requests</span>
                </button>
              </>
            )}

          </nav>

          {/* Right Action Items & User Profile */}
          <div className="flex items-center space-x-3">

            {/* Credit Wallet Pill (Students Only) */}
            {isStudent && (
              <div
                onClick={() => handleNavigate('wallet')}
                title="Click to manage SkillMentor credits in Wallet"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50/90 border border-amber-200/90 text-amber-800 text-xs font-extrabold shadow-2xs cursor-pointer hover:bg-amber-100/90 transition-colors"
              >
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span> {currentUser.walletBalance ?? 50} Credits</span>
              </div>
            )}

            {currentUser ? (
              /* LOGGED IN USER PROFILE DROPDOWN */
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('profile')}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/60"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-extrabold flex items-center justify-center text-xs shadow-2xs">
                    {initialLetter}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-slate-800 max-w-[110px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${openDropdown === 'profile' ? 'rotate-180 text-orange-600' : ''}`} />
                </button>

                {/* PROFILE DROPDOWN MENU */}
                {openDropdown === 'profile' && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">

                    {/* Header Block */}
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                          {currentUser.role}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{currentUser.verificationStatus || 'VERIFIED'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="pt-1">
                      {isStudent && (
                        <button
                          onClick={() => {
                            setOpenDropdown(null);
                            onOpenProfileModal();
                          }}
                          className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors cursor-pointer text-left"
                        >
                          <UserIcon className="w-4 h-4 text-orange-600" />
                          <span>My Profile & Skills</span>
                        </button>
                      )}

                      {isMentorOrAlumni && !isAdmin && (
                        <button
                          onClick={() => {
                            setOpenDropdown(null);
                            onOpenProfileModal();
                          }}
                          className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors cursor-pointer text-left"
                        >
                          <Briefcase className="w-4 h-4 text-orange-600" />
                          <span>My Profile & Slots</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setOpenDropdown(null);
                          onLogout();
                        }}
                        className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left border-t border-slate-100 mt-1"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Logout</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              /* SIGN IN / REGISTER BUTTON */
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-md shadow-orange-500/20 transition-all transform active:scale-95 cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>
      </div>

      {/* MOBILE RESPONSIVE MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <button
              onClick={() => handleNavigate('landing')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold text-left ${activeTab === 'landing' ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            {isStudent && (
              <>
                <div className="pt-2 pb-1 px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Explore
                </div>
                <button
                  onClick={() => handleNavigate('discovery')}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold text-left ${activeTab === 'discovery' ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  <span>Mentors & Alumni</span>
                </button>

                <button
                  onClick={() => handleNavigate('peerExchange')}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold text-left ${activeTab === 'peerExchange' ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <ArrowRightLeft className="w-4 h-4 text-orange-500" />
                  <span>Student Help Requests</span>
                </button>

                <div className="pt-2 pb-1 px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  My Work & Sessions
                </div>
                <button
                  onClick={() => handleNavigate('sessions')}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold text-left ${activeTab === 'sessions' ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>My Sessions & Chat</span>
                </button>

                <button
                  onClick={() => handleNavigate('wallet')}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold text-left ${activeTab === 'wallet' ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <span>Wallet ({currentUser?.walletBalance ?? 50} Credits)</span>
                </button>
              </>
            )}

            {isMentorOrAlumni && !isAdmin && (
              <>
                <button
                  onClick={() => handleNavigate('mentorDashboard')}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold text-left ${activeTab === 'mentorDashboard' ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-orange-600" />
                  <span>Mentor Workspace & Slots</span>
                </button>

                <button
                  onClick={() => handleNavigate('sessions')}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold text-left ${activeTab === 'sessions' ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <MessageSquare className="w-4 h-4 text-orange-600" />
                  <span>Student Requests & Chat</span>
                </button>
              </>
            )}

            {isAdmin && (
              <button
                onClick={() => handleNavigate('admin')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold text-left ${activeTab === 'admin' ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                <span>Admin Governance Portal</span>
              </button>
            )}

            {!currentUser && (
              <>
                <button
                  onClick={() => handleNavigate('discovery')}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold text-left ${activeTab === 'discovery' ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span>Mentors & Alumni</span>
                </button>
                <button
                  onClick={() => handleNavigate('peerExchange')}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold text-left ${activeTab === 'peerExchange' ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <ArrowRightLeft className="w-4 h-4 text-orange-500" />
                  <span>Student Help Requests</span>
                </button>
              </>
            )}
          </div>

          {currentUser ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center space-x-3 px-3 py-2 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-extrabold flex items-center justify-center text-xs">
                  {initialLetter}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium capitalize">{currentUser.role}</p>
                </div>
              </div>

              {isStudent && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenProfileModal();
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 text-left"
                >
                  <UserIcon className="w-4 h-4 text-orange-600" />
                  <span>My Profile & Skills</span>
                </button>
              )}

              {isMentorOrAlumni && !isAdmin && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenProfileModal();
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 text-left"
                >
                  <Briefcase className="w-4 h-4 text-orange-600" />
                  <span>My Profile & Slots</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 text-left"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-md cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            </div>
          )}

        </div>
      )}
    </header>
  );
}
