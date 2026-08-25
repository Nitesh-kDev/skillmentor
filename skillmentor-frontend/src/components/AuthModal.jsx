import React, { useState } from 'react';
import { X, Mail, Lock, User, Briefcase, GraduationCap, ShieldCheck, CheckCircle2, Upload, AlertCircle, Building, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'otp'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    collegeEmail: '',
    collegeName: 'JSS Academy of Technical Education',
    course: 'B.Tech Computer Science',
    currentYear: '3rd Year',
    passingYear: 2027,
    currentCompany: '',
    currentDesignation: '',
    linkedinUrl: '',
    hourlyRate: 800,
    availableSlots: 'Mon, Wed, Fri (6:00 PM - 9:00 PM)',
    bio: ''
  });
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login({ email: formData.email, password: formData.password });
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res));
        onAuthSuccess(res);
        onClose();
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Network error during login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.register(formData);
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res));
        if (formData.role === 'STUDENT' && formData.collegeEmail) {
          setSuccessMsg('Registration successful! Automated college email verification applied.');
        }
        onAuthSuccess(res);
        onClose();
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const isVerified = await api.verifyCollegeOtp(formData.email, otpCode);
      if (isVerified) {
        setSuccessMsg('College email verified successfully!');
        const updatedUser = await api.getCurrentUser();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        onAuthSuccess(updatedUser);
        onClose();
      } else {
        setError('Invalid or expired OTP code.');
      }
    } catch (err) {
      setError(err.message || 'OTP verification error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.login({ email: demoEmail, password: 'password123' });
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res));
        onAuthSuccess(res);
        onClose();
      }
    } catch (err) {
      setError('Demo login error: Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-bold text-slate-800">
              {mode === 'login' && 'Sign In to SkillMentor'}
              {mode === 'register' && 'Create SkillMentor Account'}
              {mode === 'otp' && 'Verify College Email'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* Quick Demo Logins Bar (Local Development Only) */}
          {import.meta.env.DEV && (
            <div className="mb-6 p-3 bg-orange-50/80 border border-orange-200 rounded-2xl">
              <p className="text-xs font-bold text-orange-900 mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" /> Quick Role Logins (1-Click Dev Demo):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <button onClick={() => handleQuickDemoLogin('student@jssaten.ac.in')} className="px-3 py-2 bg-white hover:bg-orange-100 text-orange-800 font-bold rounded-xl border border-orange-200 shadow-2xs text-center truncate">
                  🎓 Student
                </button>
                <button onClick={() => handleQuickDemoLogin('mentor.alex@tech.com')} className="px-3 py-2 bg-white hover:bg-orange-100 text-orange-800 font-bold rounded-xl border border-orange-200 shadow-2xs text-center truncate">
                  👔 Mentor & Alumni
                </button>
                <button onClick={() => handleQuickDemoLogin('admin@skillmentor.com')} className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl border border-amber-300 shadow-2xs text-center truncate">
                  🛠️ System Admin
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Mode Switch Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-orange-600 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'register' ? 'bg-white text-orange-600 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="niteshkumar@gmail.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role Type</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-semibold"
                  >
                    <option value="STUDENT">Student (Current Undergrad/Postgrad)</option>
                    <option value="MENTOR">Mentor & Alumni (Graduate / Expert)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="niteshkumar@gmail.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* College & Course Affiliation Fields */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">College & Degree Information</span>
                
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">College / University Name</label>
                  <input
                    type="text"
                    name="collegeName"
                    required
                    value={formData.collegeName}
                    onChange={handleInputChange}
                    placeholder="e.g. JSS Academy of Technical Education"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Course / Branch</label>
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      placeholder="MCA"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>

                  {formData.role === 'STUDENT' ? (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Current Academic Year</label>
                      <select
                        name="currentYear"
                        value={formData.currentYear}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Passing Year (Graduation)</label>
                      <input
                        type="number"
                        name="passingYear"
                        value={formData.passingYear}
                        onChange={handleInputChange}
                        placeholder="e.g. 2020"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                  )}
                </div>
              </div>

              {(formData.role === 'MENTOR' || formData.role === 'ALUMNI') && (
                <div className="p-3 bg-orange-50/60 rounded-2xl border border-orange-100 space-y-2">
                  <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider block">Mentor & Alumni Professional Information</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Current Company</label>
                      <input
                        type="text"
                        name="currentCompany"
                        value={formData.currentCompany}
                        onChange={handleInputChange}
                        placeholder="e.g. Google / TechCorp"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Designation</label>
                      <input
                        type="text"
                        name="currentDesignation"
                        value={formData.currentDesignation}
                        onChange={handleInputChange}
                        placeholder="e.g. Senior Software Engineer"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">LinkedIn Profile URL (Required for Mentors)</label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      required
                      value={formData.linkedinUrl}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/yourname"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>
              )}

              {formData.role === 'STUDENT' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">College Email Address (.ac.in or .edu only)</label>
                  <input
                    type="email"
                    name="collegeEmail"
                    required
                    value={formData.collegeEmail || formData.email}
                    onChange={(e) => setFormData({ ...formData, collegeEmail: e.target.value, email: e.target.value })}
                    placeholder="example@jssaten.ac.in"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Must end in .ac.in or .edu (e.g. example@jssaten.ac.in)</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Register Account'}
              </button>
            </form>
          )}

          {/* OTP FORM */}
          {mode === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-xs text-slate-600">
                Enter the 6-digit OTP sent to your college email <span className="font-bold text-slate-800">{formData.collegeEmail}</span>.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full tracking-widest text-center font-mono text-lg py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP & Activate Badge'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
