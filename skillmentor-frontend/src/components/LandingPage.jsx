import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  GraduationCap, 
  CheckCircle2, 
  Users, 
  Briefcase, 
  Code, 
  HelpCircle, 
  Target, 
  BookOpen,
  FileText,
  Video,
  Award,
  Compass,
  Lock,
  Star
} from 'lucide-react';

export default function LandingPage({ onOpenAuth, onExploreDiscovery }) {
  return (
    <div className="space-y-20 animate-fade-in pb-16">
      
      {/* ==========================================
          1. HERO SECTION (Clean 2-Column Desktop)
         ========================================== */}
      <section className="relative rounded-3xl bg-gradient-to-b from-orange-50/40 via-white to-white border border-slate-200/80 p-6 sm:p-10 lg:p-12 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Content & CTA */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Small Eyebrow Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200/80 text-orange-800 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Student Learning & Mentorship Platform</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Learn from Peers. <br />
              Get Mentored. <br />
              <span className="text-orange-600">Grow Together.</span>
            </h1>

            {/* Short Supporting Paragraph */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
              SkillMentor helps students learn from peers, connect with verified mentors and alumni, get help with projects and technical doubts, and prepare for their careers — all in one place.
            </p>

            {/* Clean CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={onOpenAuth}
                className="px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-600/20 transition-all flex items-center space-x-2 active:scale-95 cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreDiscovery}
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-sm rounded-xl shadow-2xs transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Users className="w-4 h-4 text-slate-500" />
                <span>Explore Mentors</span>
              </button>
            </div>

          </div>

          {/* Right Column: Clean Visual Composition */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-6 shadow-md relative space-y-4">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-600 text-white font-bold text-xs flex items-center justify-center">
                    SM
                  </div>
                  <span className="font-extrabold text-xs text-slate-800">SkillMentor Platform</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">
                  Verified Active
                </span>
              </div>

              {/* Central Platform Mock Card */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Active Peer Swap</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-400" /> 10 Credits
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  <span className="font-semibold text-slate-800">Topic:</span> React & Node.js Technical Doubts
                </div>
              </div>

              {/* 3 Floating Capability Cards */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center space-x-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs hover:border-orange-200 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm shrink-0">
                    🤝
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Peer Learning</h4>
                    <p className="text-[11px] text-slate-500">Swap skills & solve doubts together</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs hover:border-amber-200 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                    🎓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Verified Mentors</h4>
                    <p className="text-[11px] text-slate-500">Guidance from seniors & alumni</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs hover:border-emerald-200 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                    🚀
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Career Growth</h4>
                    <p className="text-[11px] text-slate-500">Mock interviews & resume prep</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ==========================================
          2. WHAT IS SKILLMENTOR? (3 Pillar Cards)
         ========================================== */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-orange-700 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            What is SkillMentor?
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">One Platform. Three Ways to Grow.</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Whether you want to learn a new skill, share what you know, or get guidance from someone experienced, SkillMentor brings the right people together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Learn From Peers */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 hover:border-orange-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Learn From Peers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Get help with technical doubts, projects, coding and other student needs.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-bold text-orange-600 flex items-center gap-1">
              <span>Peer Doubt Solving</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Share Your Skills */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 hover:border-amber-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Share Your Skills</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Help other students, build your reputation and earn SkillMentor Credits.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-bold text-amber-700 flex items-center gap-1">
              <span>Earn Credits & Rating</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Learn From Mentors */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Learn From Mentors</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect with verified seniors, alumni and professionals for personalized guidance.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <span>1-on-1 Mentorship</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

      {/* ==========================================
          3. HOW PEER SKILL EXCHANGE WORKS
         ========================================== */}
      <section className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 sm:p-10 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-orange-700 bg-orange-100/80 px-3 py-1 rounded-full border border-orange-200">
            Peer Exchange Mechanics
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Teach. Earn. Learn.</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Peer learning is designed to make knowledge exchange accessible without requiring students to pay each other for basic peer help.
          </p>
        </div>

        {/* Step Flow Diagram */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-xs font-extrabold text-slate-400">STEP 1</span>
            <h4 className="font-bold text-sm text-slate-800">You know Java</h4>
            <p className="text-[11px] text-slate-500">List skills you can share</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-xs font-extrabold text-slate-400">STEP 2</span>
            <h4 className="font-bold text-sm text-slate-800">Help another student</h4>
            <p className="text-[11px] text-slate-500">Answer doubts or review code</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-xs font-extrabold text-slate-400">STEP 3</span>
            <h4 className="font-bold text-sm text-slate-800">Earn SkillMentor Credits</h4>
            <p className="text-[11px] text-slate-500">Credits added to your wallet</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-xs font-extrabold text-slate-400">STEP 4</span>
            <h4 className="font-bold text-sm text-slate-800">Use credits when you need help</h4>
            <p className="text-[11px] text-slate-500">Book peer help sessions for free</p>
          </div>
        </div>

        {/* Credit System Explanation Callout */}
        <div className="bg-white border border-amber-200 p-6 rounded-2xl max-w-xl mx-auto text-center space-y-2 shadow-2xs">
          <div className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>Start with 50 SkillMentor Credits</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Help another student, earn credits, and use them when you need help.
          </p>
        </div>
      </section>

      {/* ==========================================
          4. STUDENT HELP
         ========================================== */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Stuck? Find Someone Who Can Help.</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Post what you need help with and connect with students who have relevant knowledge or experience.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs text-center space-y-2 hover:border-orange-200 transition-all">
            <div className="text-2xl">💻</div>
            <h4 className="font-bold text-xs text-slate-800">Project Help</h4>
            <p className="text-[10px] text-slate-500">Full-stack & app guidance</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs text-center space-y-2 hover:border-orange-200 transition-all">
            <div className="text-2xl">❓</div>
            <h4 className="font-bold text-xs text-slate-800">Technical Doubts</h4>
            <p className="text-[10px] text-slate-500">Quick conceptual clarity</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs text-center space-y-2 hover:border-orange-200 transition-all">
            <div className="text-2xl">🧩</div>
            <h4 className="font-bold text-xs text-slate-800">Coding & Development</h4>
            <p className="text-[10px] text-slate-500">Debugging & logic review</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs text-center space-y-2 hover:border-orange-200 transition-all">
            <div className="text-2xl">🎯</div>
            <h4 className="font-bold text-xs text-slate-800">Placement Prep</h4>
            <p className="text-[10px] text-slate-500">DSA & interview practice</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs text-center space-y-2 hover:border-orange-200 transition-all col-span-2 sm:col-span-1">
            <div className="text-2xl">📚</div>
            <h4 className="font-bold text-xs text-slate-800">Other Student Needs</h4>
            <p className="text-[10px] text-slate-500">Academic & course support</p>
          </div>
        </div>
      </section>

      {/* ==========================================
          5. MENTORSHIP
         ========================================== */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Guidance From People Who've Been There.</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Connect with verified seniors, alumni and industry professionals for practical guidance that goes beyond the classroom.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs text-xs font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-600" />
            <span>Resume Reviews</span>
          </div>

          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs text-xs font-bold text-slate-800 flex items-center gap-2">
            <Video className="w-4 h-4 text-amber-600" />
            <span>Mock Interviews</span>
          </div>

          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs text-xs font-bold text-slate-800 flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Career Guidance</span>
          </div>

          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs text-xs font-bold text-slate-800 flex items-center gap-2">
            <Code className="w-4 h-4 text-blue-600" />
            <span>Technical Mentorship</span>
          </div>

          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs text-xs font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-600" />
            <span>Placement Preparation</span>
          </div>
        </div>
      </section>

      {/* ==========================================
          6. TRUST
         ========================================== */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 space-y-6 shadow-md">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Built Around a Trusted Community</h2>
          <p className="text-xs text-slate-400">Authentic profile verification and peer reviews for a safe learning environment.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
            <div className="text-xl">🛡️</div>
            <h4 className="font-bold text-xs text-white">Verified Profiles</h4>
            <p className="text-[10px] text-slate-400">Academic & identity verification</p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
            <div className="text-xl">🔐</div>
            <h4 className="font-bold text-xs text-white">Secure Auth</h4>
            <p className="text-[10px] text-slate-400">JWT & role-based access</p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
            <div className="text-xl">⭐</div>
            <h4 className="font-bold text-xs text-white">Reviews & Rating</h4>
            <p className="text-[10px] text-slate-400">Transparent community feedback</p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
            <div className="text-xl">🎓</div>
            <h4 className="font-bold text-xs text-white">Student & Mentor Network</h4>
            <p className="text-[10px] text-slate-400">Collaborative campus ecosystem</p>
          </div>
        </div>
      </section>

      {/* ==========================================
          7. HOW IT WORKS (4 Timeline Steps)
         ========================================== */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How It Works</h2>
          <p className="text-xs text-slate-500">Get started in 4 simple steps.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <span className="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">01</span>
            <h4 className="font-bold text-sm text-slate-900 pt-2">Create Your Profile</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Sign up with your college credentials to get started.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <span className="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">02</span>
            <h4 className="font-bold text-sm text-slate-900 pt-2">Find or Request Help</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Browse mentor slots or post a student help request.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <span className="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">03</span>
            <h4 className="font-bold text-sm text-slate-900 pt-2">Connect & Learn</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Join 1-on-1 sessions and live chat to get guidance.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <span className="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">04</span>
            <h4 className="font-bold text-sm text-slate-900 pt-2">Complete & Build Reputation</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Rate your session, transfer credits, and grow your profile.</p>
          </div>
        </div>
      </section>

      {/* ==========================================
          8. WHO IS SKILLMENTOR FOR?
         ========================================== */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 space-y-6 text-center shadow-2xs">
        <div className="max-w-xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-orange-700 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            Designed to grow across disciplines
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Built for Students Across Disciplines</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            SkillMentor connects students across academic backgrounds so they can learn from each other and grow together.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
          <span className="px-4 py-2 bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200">B.Tech / Engineering</span>
          <span className="px-4 py-2 bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200">MCA / Computer Science</span>
          <span className="px-4 py-2 bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200">BBA / MBA</span>
          <span className="px-4 py-2 bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200">BCA</span>
          <span className="px-4 py-2 bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200">LLB / LLM</span>
          <span className="px-4 py-2 bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200">Other disciplines</span>
        </div>
      </section>

      {/* ==========================================
          9. FINAL CTA
         ========================================== */}
      <section className="rounded-3xl bg-slate-900 p-8 sm:p-12 text-white text-center space-y-5 shadow-xl">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Your Next Skill. Your Next Mentor. Your Next Opportunity.</h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Join SkillMentor and start learning, sharing and growing with students, mentors and alumni.
        </p>
        <div className="pt-2 space-y-3">
          <button
            onClick={onOpenAuth}
            className="px-8 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all inline-flex items-center space-x-2 active:scale-95 cursor-pointer"
          >
            <span>Create Your Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-xs text-slate-400 font-medium">Start with 50 SkillMentor Credits</p>
        </div>
      </section>

    </div>
  );
}
