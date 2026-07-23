import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight, CheckCircle2, Shield } from 'lucide-react';

export const LoginModule: React.FC = () => {
  const { login, showToast } = useApp();
  const [email, setEmail] = useState('admin@sohub.com.bd');
  const [password, setPassword] = useState('sohub123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const success = await login(email, password);
    setLoading(false);
    if (!success) {
      setErrorMsg('Invalid authentication credentials. Please check your email or password.');
    }
  };

  const handleQuickDemoLogin = async () => {
    setEmail('admin@sohub.com.bd');
    setPassword('sohub123');
    setLoading(true);
    await login('admin@sohub.com.bd', 'sohub123');
    setLoading(false);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    showToast('Password reset: Please contact your Super Admin to reset password.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-hidden font-sans select-none antialiased">
      {/* Background Ambient Glow Orbs (Apple & Vercel Inspired) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff751a]/12 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#ff751a]/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Grid Overlay Texture for Tech Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(#ff751a_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none"></div>

      {/* Main Centered Login Container */}
      <div className="my-auto w-full max-w-[420px] relative z-10 space-y-6">
        {/* Glassmorphic Auth Card */}
        <div className="backdrop-blur-2xl bg-slate-900/70 p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl shadow-black/80 space-y-7 relative overflow-hidden">
          {/* Subtle Accent Glow Bar on top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ff751a] to-transparent opacity-80"></div>

          {/* 1. Brand Header Section */}
          <div className="space-y-4 text-center sm:text-left">
            <div className="flex items-center justify-between">
              {/* Minimal SOHUB Logo */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#ff751a] to-[#ffa05c] flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-[#ff751a]/30 border border-white/20">
                  S
                </div>
                <div className="text-left">
                  <span className="font-extrabold text-white text-lg tracking-tight block">SOHUB</span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block -mt-1">Enterprise</span>
                </div>
              </div>

              {/* Version Pill Badge */}
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#ff751a]/10 text-[#ff751a] border border-[#ff751a]/25 shadow-2xs">
                Portal v2.0
              </span>
            </div>

            <div className="pt-2 space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Sign in to manage SOHUB Machines & Quotations
              </p>
            </div>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 2. Form Components */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Work Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sohub.com.bd"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff751a] focus:ring-2 focus:ring-[#ff751a]/20 transition-all font-mono shadow-inner"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff751a] focus:ring-2 focus:ring-[#ff751a]/20 transition-all font-mono shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Auxiliary Actions: Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-[#ff751a] focus:ring-[#ff751a]/40 cursor-pointer"
                />
                <span>Remember this device</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-slate-400 hover:text-[#ff751a] font-medium transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* 3. Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-5 bg-[#ff751a] hover:bg-[#ea580c] active:translate-y-0 text-white font-extrabold rounded-2xl shadow-lg shadow-[#ff751a]/25 hover:shadow-xl hover:shadow-[#ff751a]/35 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group text-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800/80"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
              <span className="bg-slate-900/90 px-3 text-slate-500 font-semibold">One-Click Demo</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full py-3 px-4 bg-slate-950/60 hover:bg-slate-800/60 text-slate-300 font-bold rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#ff751a]" />
            <span>1-Click Demo Login as Super Admin</span>
          </button>
        </div>

        {/* 4. Footer & Trust Indicators */}
        <div className="space-y-2 text-center text-xs">
          <div className="inline-flex items-center gap-1.5 text-slate-400 font-medium bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800/60">
            <Shield className="w-3.5 h-3.5 text-[#ff751a]" />
            <span>Protected by Supabase Auth & SOHUB Shield</span>
          </div>

          <p className="text-[11px] text-slate-500 font-mono">
            © 2026 Solution Hub Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
