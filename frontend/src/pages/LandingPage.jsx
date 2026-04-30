import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap, ArrowRight, CheckCircle2, TrendingUp, Trophy, Star,
  ShieldCheck, Zap, Activity, Sparkles, Users, Award, BarChart3
} from 'lucide-react';

const STATS = [
  { value: '500+', label: 'Active Students', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  { value: '2K+', label: 'Achievements Logged', icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-50' },
  { value: '95%', label: 'Placement Rate', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { value: '4.9★', label: 'User Rating', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
]

const FEATURES = [
  {
    icon: Trophy,
    title: 'Centralized Achievements',
    desc: 'Upload and manage all your academic and extracurricular certificates in one secure place.',
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    color: 'text-blue-600',
  },
  {
    icon: Zap,
    title: 'Real-time Leaderboards',
    desc: 'See where you stand in your department and globally. Turn competition into motivation.',
    gradient: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-50',
    color: 'text-purple-600',
  },
  {
    icon: BarChart3,
    title: 'Placement Analytics',
    desc: 'Understand your placement readiness score based on verified activities and performance.',
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    color: 'text-emerald-600',
  },
]

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem('acadex_splash_shown')
  );
  const [splashFadeOut, setSplashFadeOut] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouse = e => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  useEffect(() => {
    if (showSplash) {
      const t1 = setTimeout(() => setSplashFadeOut(true), 2400);
      const t2 = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('acadex_splash_shown', 'true');
      }, 2800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [showSplash]);

  if (loading) return <div className="min-h-screen bg-slate-950" />;
  if (user) {
    const map = { student: '/student', faculty: '/faculty', admin: '/admin', placement: '/placement', dept_head: '/depthead', event_organizer: '/organizer' };
    return <Navigate to={map[user.role] || '/login'} replace />;
  }

  if (showSplash) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-400 ${splashFadeOut ? 'opacity-0' : 'opacity-100'}`}
        style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 50%, #0f0f1e 100%)' }}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 animate-blob"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-15 animate-blob animation-delay-2000"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        <div className="relative z-10 flex flex-col items-center animate-splash-text">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl mb-6"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.2)'
            }}>
            <GraduationCap className="w-11 h-11 text-white" />
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold text-white tracking-tight mb-3">Acadex</h1>
          <p className="text-lg text-slate-400 font-medium tracking-widest uppercase">Track · Improve · Get Placed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #fafafa 0%, #f5f3ff 50%, #fafafa 100%)' }}>

      {/* Cursor glow (desktop) */}
      <div className="fixed pointer-events-none z-0 hidden lg:block transition-all duration-300 ease-out"
        style={{
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)',
          left: mousePos.x - 300, top: mousePos.y - 300,
        }} />

      {/* Background orbs */}
      <div className="fixed top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent)' }} />
      <div className="fixed bottom-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.07), transparent)' }} />

      {/* ── Header ── */}
      <header className={`px-6 py-4 lg:px-12 flex items-center justify-between sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-soft' : 'bg-transparent'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 16px rgba(99,102,241,0.3)' }}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Acadex</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 rounded-xl hover:bg-slate-100">
            Login
          </Link>
          <Link to="/register" className="btn-primary text-sm gap-2">
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

        {/* Left: Text */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 text-xs font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Platform Live · v2.0
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold text-slate-900 tracking-tight leading-[1.08]">
            Your{' '}
            <span className="relative inline-block">
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)' }}>
                Smart Academic
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full opacity-40"
                style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)' }} />
            </span>
            <br />Management Portal
          </h1>

          <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Track achievements, monitor progress, and stay placement-ready — all in one intelligent platform built for modern students.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link to="/register"
              className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto gap-2 group rounded-xl shadow-lg"
              style={{ boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login"
              className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto rounded-xl">
              Sign In
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center lg:justify-start gap-6 pt-2">
            {[
              { icon: ShieldCheck, text: 'Secure & Private' },
              { icon: Zap, text: 'Real-time Updates' },
              { icon: CheckCircle2, text: 'Verified Achievements' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Icon className="w-3.5 h-3.5 text-brand-500" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Floating UI */}
        <div className="relative h-[420px] sm:h-[520px] w-full hidden md:block">
          {/* Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent)' }} />

          {/* Main card */}
          <div className="absolute top-[5%] left-[0%] right-[10%] glass-card p-6 animate-float z-20">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md">JD</div>
                <div>
                  <div className="h-3.5 w-28 bg-slate-200 rounded-full mb-1.5" />
                  <div className="h-2.5 w-36 bg-slate-100 rounded-full" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-700">Ready</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <Trophy className="w-5 h-5 text-purple-500 mb-2" />
                <p className="text-2xl font-bold text-slate-800">12</p>
                <p className="text-xs text-slate-500 font-medium">Achievements</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <Activity className="w-5 h-5 text-brand-500 mb-2" />
                <p className="text-2xl font-bold text-slate-800">85<span className="text-sm font-normal text-slate-400">/100</span></p>
                <p className="text-xs text-slate-500 font-medium">Score</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Placement Progress</span>
                <span className="font-bold text-brand-600">85%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-[85%] rounded-full"
                  style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', boxShadow: '0 0 8px rgba(99,102,241,0.4)' }} />
              </div>
            </div>
          </div>

          {/* Performance card */}
          <div className="absolute bottom-[15%] right-[0%] left-[15%] glass-card p-5 animate-float-delayed z-30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-800">Performance Trend</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-end gap-1.5 h-20">
              {[35, 55, 42, 75, 60, 90, 82].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-md transition-all duration-300 hover:opacity-100 opacity-80"
                  style={{
                    height: `${h}%`,
                    background: `linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)`,
                    opacity: i === 5 ? 1 : 0.6 + i * 0.05,
                  }} />
              ))}
            </div>
          </div>

          {/* Rank chip */}
          <div className="absolute top-[2%] right-[2%] glass-card px-4 py-3 flex items-center gap-3 animate-float-slow z-40">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Star className="w-4.5 h-4.5 text-amber-500" style={{ width: '18px', height: '18px' }} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Dept Rank</p>
              <p className="text-sm font-bold text-slate-800">#3 of 120</p>
            </div>
          </div>

          {/* Placement chip */}
          <div className="absolute bottom-[8%] left-[2%] px-4 py-3 rounded-2xl flex items-center gap-3 z-40 animate-float"
            style={{ background: 'linear-gradient(135deg, #0d0d1a, #1a1a2e)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" style={{ width: '18px', height: '18px' }} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Status</p>
              <p className="text-sm font-bold text-white">Placement Ready</p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Stats Row ── */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-12 pb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ value, label, icon: Icon, color, bg }) => (
            <div key={label} className="card p-5 text-center hover-lift group">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-12 pb-20">
        <div className="pt-8 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, gradient, bg, color }) => (
            <div key={title} className="group card p-6 hover-lift cursor-default">
              <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110`}
                style={{ transition: 'all 0.3s' }}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 absolute transition-all duration-300`}
                  style={{ background: `linear-gradient(135deg, ${gradient.includes('blue') ? '#3b82f6' : gradient.includes('purple') ? '#8b5cf6' : '#10b981'}, transparent)` }} />
                <Icon className={`w-6 h-6 ${color} relative z-10`} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200/60 py-6 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-700">Acadex</span>
          </div>
          <p className="text-xs text-slate-400">© 2026 Acadex. Smart Academic Achievement Portal.</p>
        </div>
      </footer>
    </div>
  );
}
