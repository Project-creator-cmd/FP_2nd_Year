import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight, CheckCircle2, TrendingUp, Trophy, Star, Bell, ShieldCheck, Zap, Activity } from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem('acadex_splash_shown')
  );
  const [splashFadeOut, setSplashFadeOut] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (showSplash) {
      const timer1 = setTimeout(() => setSplashFadeOut(true), 2400); 
      const timer2 = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('acadex_splash_shown', 'true');
      }, 2800); 
      return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }
  }, [showSplash]);

  if (loading) return <div className="min-h-screen bg-slate-900" />;

  // Active sessions skip the landing page entirely
  if (user) {
    const map = { student: '/student', faculty: '/faculty', admin: '/admin', placement: '/placement' };
    return <Navigate to={map[user.role] || '/login'} replace />;
  }

  if (showSplash) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center bg-slate-950 z-50 transition-opacity duration-300 ${splashFadeOut ? 'opacity-0' : 'opacity-100'}`}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/30 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 flex flex-col items-center animate-splash-text">
          <div className="w-20 h-20 bg-brand-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-500/20 mb-6">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4">Acadex</h1>
          <p className="text-xl md:text-2xl text-slate-300 font-medium tracking-wide">Track. Improve. Get Placed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans animate-fade-in relative overflow-hidden">
      {/* Subtle Mesh Gradients */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-400/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Sticky Glassmorphism Header */}
      <header className={`px-6 py-4 lg:px-12 flex items-center justify-between sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/70 backdrop-blur-md border-b border-slate-200/50 shadow-sm' : 'bg-transparent'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-md">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">Acadex</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            Login
          </Link>
          <Link to="/register" className="btn-primary flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/30 transition-all duration-300">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main Hero Section (Asymmetrical Split Layout) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center z-10 relative">
        
        {/* Left Column (Text & CTAs) */}
        <div className="space-y-8 max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 text-xs sm:text-sm font-semibold transition-transform hover:scale-105">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Platform Live Now v2.0
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            Your {' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-purple-600 to-brand-600 animate-text-shimmer">
              Smart Academic
            </span><br className="hidden lg:block"/>
            {' '}Management Portal
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Track achievements, monitor progress, and stay placement-ready — all in one intelligent platform.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-4 w-full sm:w-auto flex items-center justify-center gap-2 group shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 hover:-translate-y-1 transition-all duration-300 rounded-xl">
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-4 w-full sm:w-auto flex items-center justify-center gap-2 hover:-translate-y-1 transition-all duration-300 rounded-xl bg-white">
               Login to Dashboard
            </Link>
          </div>
        </div>

        {/* Right Column (Floating UI Presentation) */}
        <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] w-full hidden md:block">
          {/* Main Backing Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-brand-500/10 rounded-full blur-[80px]"></div>

          {/* Floating UI Card 1 (Main Profile/Stats) */}
          <div className="absolute top-[10%] left-[5%] right-[15%] bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] animate-float z-20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">JD</div>
                <div>
                  <div className="h-4 w-24 bg-slate-200 rounded-full mb-2"></div>
                  <div className="h-3 w-32 bg-slate-100 rounded-full"></div>
                </div>
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                 <Trophy className="w-6 h-6 text-purple-500 mb-2" />
                 <p className="text-2xl font-bold text-slate-800">12</p>
                 <p className="text-xs text-slate-500 font-medium">Achievements</p>
               </div>
               <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                 <Activity className="w-6 h-6 text-brand-500 mb-2" />
                 <p className="text-2xl font-bold text-slate-800">85<span className="text-sm font-normal text-slate-500">/100</span></p>
                 <p className="text-xs text-slate-500 font-medium">Placement Score</p>
               </div>
            </div>
          </div>

          {/* Floating UI Card 2 (Performance Graph Mock) */}
          <div className="absolute bottom-[20%] right-[0%] left-[20%] bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] animate-float-delayed z-30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-800">Performance Trend</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-end gap-2 h-24">
              {[40, 60, 45, 80, 65, 95].map((height, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-brand-500 to-brand-400 rounded-t-md opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${height}%` }}></div>
              ))}
            </div>
          </div>

          {/* Floating Detail Chip 1 */}
          <div className="absolute top-[5%] right-[5%] bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-slate-100 flex items-center gap-3 animate-float-fast z-40">
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Global Rank</p>
              <p className="text-sm font-bold text-slate-800">Top 5%</p>
            </div>
          </div>
          
          {/* Floating Detail Chip 2 */}
          <div className="absolute bottom-[10%] left-[5%] bg-slate-900 rounded-2xl p-4 shadow-xl flex items-center gap-3 animate-float z-40">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Status</p>
              <p className="text-sm font-bold text-white">Placement Ready</p>
            </div>
          </div>
        </div>
      </main>

      {/* Features Row (Bottom Area) */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-12 pb-20">
        <div className="pt-12 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          
          <div className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-soft hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Centralized Achievements</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Upload and manage all your academic and extracurricular certificates in one secure place.</p>
          </div>

          <div className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-soft hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Real-time Leaderboards</h3>
            <p className="text-sm text-slate-500 leading-relaxed">See where you stand in your department and globally. Turn competition into motivation.</p>
          </div>

          <div className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-soft hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Placement Analytics</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Understand your placement readiness score based on verified activities and academic performance.</p>
          </div>

        </div>
      </section>
    </div>
  );
}
