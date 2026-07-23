import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";

export const LightLogin: React.FC = () => {
  const { login, showToast } = useApp();
  const [email, setEmail] = useState("admin@sohub.com.bd");
  const [password, setPassword] = useState("sohub123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const success = await login(email, password);
    setLoading(false);
    if (!success) {
      setErrorMsg("Invalid credentials. Check your email or password.");
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    showToast("Password reset: Contact Super Admin at admin@sohub.com.bd.", "info");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-100 p-4 font-sans select-none antialiased">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative transition-all">
        {/* Ambient Orange Glow Overlay */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-orange-200/40 via-orange-100/20 to-transparent opacity-70 blur-3xl -mt-20 pointer-events-none"></div>

        <div className="p-8 sm:p-10 relative z-10">
          {/* Header & Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-white p-4 rounded-2xl shadow-lg shadow-orange-500/10 mb-5 border border-slate-100/80 transform hover:scale-105 transition-transform duration-200 flex items-center justify-center">
              <img
                src="/images.png"
                alt="SOHUB Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome Back
              </h2>
            </div>
          </div>

          {/* Error Feedback */}
          {errorMsg && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 h-12 pl-10 pr-4 rounded-xl focus:ring-2 focus:ring-[#ff751a]/30 focus:border-[#ff751a] w-full text-sm font-mono focus:outline-none transition-all"
                  placeholder="admin@sohub.com.bd"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                <a
                  href="#"
                  onClick={handleForgotPassword}
                  className="text-xs text-[#ff751a] hover:underline font-semibold"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 h-12 pl-10 pr-12 rounded-xl focus:ring-2 focus:ring-[#ff751a]/30 focus:border-[#ff751a] w-full text-sm font-mono focus:outline-none transition-all"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-2 rounded-lg text-sm font-medium transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-t from-[#ea580c] via-[#ff751a] to-[#ffa05c] hover:from-[#c2410c] hover:via-[#ea580c] hover:to-[#ff751a] text-white font-extrabold rounded-xl transition-all duration-200 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.99] flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Note */}
          <div className="mt-8 text-center border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-500 font-medium">
              🔒 Protected by <span className="font-bold text-slate-700">Supabase Auth</span> & <span className="font-bold text-slate-700">SOHUB Shield</span>
            </p>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              © 2026 Solution Hub Technologies
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
