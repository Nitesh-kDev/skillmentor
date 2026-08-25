import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, BookOpen, GraduationCap, Building, Save, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import AvailabilityEditor from './AvailabilityEditor';

export default function StudentProfileModal({ isOpen, onClose, currentUser, onProfileUpdated }) {
  const [profileData, setProfileData] = useState({
    name: '',
    collegeName: '',
    course: '',
    currentYear: '',
    availableSlots: 'Mon, Wed, Fri (6:00 PM - 9:00 PM)',
    bio: '',
    verificationStatus: 'VERIFIED'
  });

  const [skills, setSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillType, setNewSkillType] = useState('OFFERED'); // 'OFFERED' | 'WANTED'
  const [newSkillLevel, setNewSkillLevel] = useState('INTERMEDIATE');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchFullProfile();
    }
  }, [isOpen, currentUser]);

  const fetchFullProfile = async () => {
    try {
      const p = await api.getCurrentUser();
      setProfileData({
        name: p.name || currentUser.name || '',
        collegeName: p.collegeName || 'JSS Academy of Technical Education',
        course: p.course || 'B.Tech Computer Science',
        currentYear: p.currentYear || '3rd Year',
        availableSlots: p.availableSlots || 'Mon, Wed, Fri (6:00 PM - 9:00 PM)',
        bio: p.bio || '',
        verificationStatus: p.verificationStatus || 'VERIFIED'
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
      setMsg('Student profile details saved successfully!');
      if (onProfileUpdated) onProfileUpdated(updated);
    } catch (err) {
      setError('Failed to update profile details');
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
        type: newSkillType,
        proficiency: newSkillLevel
      });
      setNewSkillName('');
      setMsg(`Added ${newSkillType === 'OFFERED' ? 'Teach' : 'Learn'} skill: ${newSkill.skillName}`);
      await fetchFullProfile();
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      setError('Failed to add skill');
    }
  };

  const handleDeleteSkill = async (skillItem) => {
    setError('');
    try {
      if (skillItem.id != null) {
        await api.deleteSkill(skillItem.id);
      } else if (skillItem.skillName) {
        await api.deleteSkillByName(skillItem.skillName);
      }
      setSkills((prev) => prev.filter((s) => s.id !== skillItem.id && s.skillName !== skillItem.skillName));
      setMsg(`Skill "${skillItem.skillName}" removed`);
      await fetchFullProfile();
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      setError('Failed to delete skill');
    }
  };

  if (!isOpen) return null;

  const offeredSkills = skills.filter((s) => s.type === 'OFFERED');
  const wantedSkills = skills.filter((s) => s.type === 'WANTED');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-extrabold text-slate-900">Student Profile & Skill Inventory</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
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

          {/* 1. BASIC INFORMATION & ACADEMIC PROFILE */}
          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-slate-900 text-sm">
                Basic Academic Information
              </h4>
              <span className="text-[10px] font-extrabold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 uppercase">
                Student Account
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Nitesh Kumar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>College Name</span>
                  <span className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={profileData.collegeName}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl font-bold cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course / Degree</label>
                <input
                  type="text"
                  required
                  value={profileData.course}
                  onChange={(e) => setProfileData({ ...profileData, course: e.target.value })}
                  placeholder="MCA"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Academic Year</label>
                <select
                  value={profileData.currentYear}
                  onChange={(e) => setProfileData({ ...profileData, currentYear: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-bold"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student Bio</label>
              <textarea
                rows={2}
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Tell us about your skills, interests, and learning goals"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
              />
            </div>

            {/* 2. STRUCTURED AVAILABILITY EDITOR */}
            <AvailabilityEditor
              value={profileData.availableSlots}
              onChange={(newSlots) => setProfileData((prev) => ({ ...prev, availableSlots: newSlots }))}
            />

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

          {/* 3. STUDENT SKILL INVENTORY */}
          <div className="space-y-4 text-xs pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm">Peer Skill Inventory</h4>
              <span className="text-[11px] font-semibold text-slate-400">Dynamically synced to matcher</span>
            </div>

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g. Java, React, Python, DSA"
                className="w-full sm:flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />

              <select
                value={newSkillType}
                onChange={(e) => setNewSkillType(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-extrabold focus:outline-none"
              >
                <option value="OFFERED">I Can Teach</option>
                <option value="WANTED">I Want to Learn</option>
              </select>

              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>

              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill</span>
              </button>
            </form>

            {/* Skills Display List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* I Can Teach */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-2">
                <h5 className="font-extrabold text-emerald-900 text-xs flex items-center justify-between">
                  <span>I Can Teach ({offeredSkills.length})</span>
                </h5>
                <div className="flex flex-wrap gap-2">
                  {offeredSkills.length > 0 ? (
                    offeredSkills.map((s, idx) => (
                      <span key={s.id || idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold shadow-2xs">
                        <span>{s.skillName}</span>
                        <span className="text-[9px] text-emerald-600 uppercase font-mono">({s.proficiency})</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSkill(s)}
                          className="hover:text-red-600 p-0.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-emerald-400 hover:text-red-600" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No teaching skills added yet.</span>
                  )}
                </div>
              </div>

              {/* I Want to Learn */}
              <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-200 space-y-2">
                <h5 className="font-extrabold text-orange-900 text-xs flex items-center justify-between">
                  <span>I Want to Learn ({wantedSkills.length})</span>
                </h5>
                <div className="flex flex-wrap gap-2">
                  {wantedSkills.length > 0 ? (
                    wantedSkills.map((s, idx) => (
                      <span key={s.id || idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-orange-800 rounded-xl border border-orange-200 text-xs font-semibold shadow-2xs">
                        <span>{s.skillName}</span>
                        <span className="text-[9px] text-orange-600 uppercase font-mono">({s.proficiency})</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSkill(s)}
                          className="hover:text-red-600 p-0.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-orange-400 hover:text-red-600" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No learning skills added yet.</span>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
