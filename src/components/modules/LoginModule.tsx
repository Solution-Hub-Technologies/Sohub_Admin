import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginModule: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('admin@sohub.com.bd');
  const [password, setPassword] = useState('sohub123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const success = await login(email, password);
    setLoading(false);
    if (!success) {
      setErrorMsg('Invalid authentication credentials. Please try again.');
    }
  };

  const handleQuickDemoLogin = async () => {
    setEmail('admin@sohub.com.bd');
    setPassword('sohub123');
    setLoading(true);
    await login('admin@sohub.com.bd', 'sohub123');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Dynamic Glow Orbs in Background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#ff751a]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* SOHUB Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#ff751a] text-white font-black text-3xl shadow-brand-lg mb-2">
            S
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            SOHUB Admin
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#ff751a]/20 text-[#ff751a] font-mono border border-[#ff751a]/40">
              v2.4
            </span>
          </h1>
          <p className="text-slate-400 text-sm">Enterprise Vending & Machine Management Console</p>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#ff751a]" /> Secure Portal Login
            </h2>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Supabase Auth
            </span>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold animate-fade-in">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sohub.com.bd"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ff751a] focus:border-[#ff751a] transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ff751a] focus:border-[#ff751a] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#ff751a] hover:bg-[#ea580c] text-white font-bold rounded-xl shadow-brand-lg transition-all flex items-center justify-center gap-2 group text-sm disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
              <span className="bg-slate-900 px-3 text-slate-500">Quick Access</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full py-3 px-4 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold rounded-xl border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-center gap-2 text-xs"
          >
            <Sparkles className="w-4 h-4 text-[#ff751a]" />
            <span>1-Click Demo Login as Super Admin</span>
          </button>
        </div>

        {/* Footer Security Badges */}
        <div className="mt-8 flex items-center justify-center gap-4 text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> SSL Encrypted
          </span>
          <span>•</span>
          <span>Schema: sohub_admin</span>
          <span>•</span>
          <span>SOHUB Technologies</span>
        </div>
      </div>
    </div>
  );
};
