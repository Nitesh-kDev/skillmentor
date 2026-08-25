import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Briefcase, Building, Clock, Calendar, Save, CheckCircle2, AlertCircle, ShieldCheck, Link, GraduationCap } from 'lucide-react';
import { api } from '../services/api';
import AvailabilityEditor from './AvailabilityEditor';

export default function MentorProfileModal({ isOpen, onClose, currentUser, onProfileUpdated }) {
  const [profileData, setProfileData] = useState({
    collegeName: '',
    currentCompany: '',
    currentDesignation: '',
    hourlyRate: 800,
    alumniBenefitType: 'NONE',
    alumniDiscountPercent: 0,
    availableSlots: 'Mon, Wed, Fri (6:00 PM - 9:00 PM)',
    bio: '',
    linkedinUrl: '',
    govtIdType: 'Aadhaar Card',
    govtIdNumber: '',
    govtIdUrl: '',
    verificationStatus: 'UNVERIFIED'
  });

  const [skills, setSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('EXPERT');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchMentorProfile();
    }
  }, [isOpen, currentUser]);

  const fetchMentorProfile = async () => {
    try {
      const p = await api.getCurrentUser();
      setProfileData({
        collegeName: p.collegeName || '',
        currentCompany: p.currentCompany || '',
        currentDesignation: p.currentDesignation || '',
        hourlyRate: p.hourlyRate || 800,
        alumniBenefitType: p.alumniBenefitType || 'NONE',
        alumniDiscountPercent: p.alumniDiscountPercent || 0,
        availableSlots: p.availableSlots || 'Mon, Wed, Fri (6:00 PM - 9:00 PM)',
        bio: p.bio || '',
        linkedinUrl: p.linkedinUrl || '',
        govtIdType: p.govtIdType || 'Aadhaar Card',
        govtIdNumber: p.govtIdNumber || '',
        govtIdUrl: p.govtIdUrl || '',
        verificationStatus: p.verificationStatus || 'UNVERIFIED'
      });
      setSkills(p.skills || []);
    } catch (err) {
      // Ignore
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');

    try {
      const updated = await api.updateProfile(profileData);
      setMsg('Mentor profile details, alumni benefits & document verification updated successfully!');
      if (onProfileUpdated) onProfileUpdated(updated);
      await fetchMentorProfile();
    } catch (err) {
      setError('Failed to update mentor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setError('');
    try {
      const newSkill = await api.addSkill({
        skillName: newSkillName.trim(),
        type: 'OFFERED',
        proficiency: newSkillLevel
      });
      setNewSkillName('');
      setMsg(`Added offered skill: ${newSkill.skillName}`);
      await fetchMentorProfile();
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      setError('Failed to add skill');
    }
  };

  const handleDeleteSkill = async (skillItem) => {
    const skillId = typeof skillItem === 'object' ? skillItem.id : skillItem;
    const skillName = typeof skillItem === 'object' ? skillItem.skillName : null;

    if (!skillId && !skillName) {
      setError('Invalid skill target');
      return;
    }

    setError('');
    try {
      if (skillId != null) {
        await api.deleteSkill(skillId);
      } else if (skillName) {
        await api.deleteSkillByName(skillName);
      }
      setSkills((prev) => prev.filter((s) => s.id !== skillId && s.skillName !== skillName));
      setMsg(`Skill "${skillName || 'Item'}" removed successfully`);
      await fetchMentorProfile();
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      setError('Failed to delete skill');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-amber-200" />
            <h3 className="text-base font-extrabold">Mentor Profile & Verification Settings</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {msg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{msg}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. MENTOR CAREER DETAILS FORM */}
          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Career & Availability Settings
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Company</label>
                <input
                  type="text"
                  value={profileData.currentCompany}
                  onChange={(e) => setProfileData({ ...profileData, currentCompany: e.target.value })}
                  placeholder="e.g. Google / TechCorp"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation / Title</label>
                <input
                  type="text"
                  value={profileData.currentDesignation}
                  onChange={(e) => setProfileData({ ...profileData, currentDesignation: e.target.value })}
                  placeholder="e.g. Staff Engineer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alma Mater / College Name</label>
                <input
                  type="text"
                  value={profileData.collegeName}
                  onChange={(e) => setProfileData({ ...profileData, collegeName: e.target.value })}
                  placeholder="e.g. JSS Academy of Technical Education"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Hourly Rate (₹)</label>
                <input
                  type="number"
                  value={profileData.hourlyRate}
                  onChange={(e) => setProfileData({ ...profileData, hourlyRate: e.target.value })}
                  placeholder="800"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-extrabold text-orange-900"
                />
              </div>
            </div>

            {/* SAME-COLLEGE GUIDANCE BENEFIT CONFIGURATION */}
            {(currentUser?.role === 'ALUMNI' || currentUser?.role === 'MENTOR') && (
              <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-3">
                <div>
                  <label className="block font-extrabold text-orange-900 text-xs flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-orange-600" />
                    <span>Same-College Student Guidance Benefit</span>
                  </label>
                  <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                    Offer an automatic pricing benefit to verified students attending your college.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-800">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="alumniBenefitTypeModal"
                      value="NONE"
                      checked={profileData.alumniBenefitType === 'NONE'}
                      onChange={(e) => setProfileData({ ...profileData, alumniBenefitType: e.target.value })}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <span>No Special Benefit (Standard Rate)</span>
                  </label>

                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="alumniBenefitTypeModal"
                      value="FREE"
                      checked={profileData.alumniBenefitType === 'FREE'}
                      onChange={(e) => setProfileData({ ...profileData, alumniBenefitType: e.target.value })}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <span>Free Session (₹0 for Same-College Students)</span>
                  </label>

                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="alumniBenefitTypeModal"
                      value="DISCOUNT"
                      checked={profileData.alumniBenefitType === 'DISCOUNT'}
                      onChange={(e) => setProfileData({ ...profileData, alumniBenefitType: e.target.value })}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <span>Percentage Discount</span>
                  </label>
                </div>

                {profileData.alumniBenefitType === 'DISCOUNT' && (
                  <div className="w-48 pt-1">
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">Discount Percentage (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={profileData.alumniDiscountPercent}
                        onChange={(e) => setProfileData({ ...profileData, alumniDiscountPercent: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-bold text-xs"
                      />
                      <span className="absolute right-3 top-1.5 text-xs font-bold text-slate-400">%</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Link className="w-3.5 h-3.5 text-orange-600" />
                <span>LinkedIn Profile URL</span>
              </label>
              <input
                type="url"
                value={profileData.linkedinUrl}
                onChange={(e) => setProfileData({ ...profileData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/yourname"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-mono text-xs"
              />
            </div>

            {/* GOVERNMENT ID DOCUMENT & VERIFICATION SECTION */}
            <div className="p-4 bg-orange-50/80 rounded-2xl border border-orange-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                  <span className="font-extrabold text-orange-900 text-xs">Mentor Verification & Govt ID Upload</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  profileData.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                  profileData.verificationStatus === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {profileData.verificationStatus || 'UNVERIFIED'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Document Type</label>
                  <select
                    value={profileData.govtIdType}
                    onChange={(e) => setProfileData({ ...profileData, govtIdType: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-semibold"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Passport">Passport</option>
                    <option value="College Degree Certificate">College Degree Certificate</option>
                    <option value="Company Employee ID">Company Employee ID</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Document ID Number</label>
                  <input
                    type="text"
                    value={profileData.govtIdNumber}
                    onChange={(e) => setProfileData({ ...profileData, govtIdNumber: e.target.value })}
                    placeholder="e.g. XXXX-XXXX-1234"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Document File Link / Drive URL</label>
                <input
                  type="url"
                  value={profileData.govtIdUrl}
                  onChange={(e) => setProfileData({ ...profileData, govtIdUrl: e.target.value })}
                  placeholder="https://drive.google.com/your_id_document.pdf"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-mono text-xs"
                />
              </div>
            </div>

            {/* STRUCTURED AVAILABILITY EDITOR */}
            <AvailabilityEditor
              value={profileData.availableSlots}
              onChange={(newSlots) => setProfileData((prev) => ({ ...prev, availableSlots: newSlots }))}
            />

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Public Bio & Expertise</label>
              <textarea
                rows={3}
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Describe your domain experience, interview coaching style, and topics..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Details</span>
              </button>
            </div>
          </form>

          {/* 2. ADD OFFERED SKILLS FORM */}
          <form onSubmit={handleAddSkill} className="p-4 bg-orange-50/80 rounded-2xl border border-orange-200 space-y-3 text-xs">
            <h4 className="font-extrabold text-orange-900 text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-orange-600" />
              <span>Add Mentoring Skill</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. React, System Design, DSA, AWS"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proficiency Level</label>
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-bold"
                >
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              Add Skill to Profile
            </button>
          </form>

          {/* 3. MENTOR SKILLS LIST */}
          <div className="space-y-2 text-xs">
            <h5 className="font-extrabold text-slate-800 text-xs">Current Mentoring Skills ({skills.length})</h5>
            
            {skills.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {skills.map((s) => (
                  <div key={s.id || s.skillName} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div>
                      <span className="font-bold text-slate-900">{s.skillName}</span>
                      <span className="ml-2 text-[10px] text-orange-700 font-extrabold uppercase">{s.proficiency}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(s)}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold rounded-lg border border-red-200 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                      title="Delete Skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">No skills added yet.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
