"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useBranding } from "@/lib/branding-context";
import { DeveloperSignature } from "@/components/DeveloperSignature";

import {
  User as UserIcon,
  Lock,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Loader2,

  CheckCircle2,
  Building2,
  Cpu,
  Layers,
  ArrowRight,
  HelpCircle,
  ExternalLink,
  X,
  KeyRound,
  UserPlus,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAs } = useAuth();
  const { branding } = useBranding();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successRole, setSuccessRole] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [systemNotice, setSystemNotice] = useState<{
    title: string;
    message: string;
    type: "password" | "access";
  } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        setSuccessRole("Authenticated");
        setTimeout(() => {
          router.push("/");
        }, 300);
      } else {
        setError(result.error || "Authentication failed. Please check credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: "admin" | "user") => {
    setError(null);
    setLoading(true);
    setSuccessRole(role === "admin" ? "Administrator" : "Standard User");
    setTimeout(async () => {
      await loginAs(role);
    }, 300);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0062dd] overflow-x-hidden flex flex-col justify-between p-4 sm:p-6 lg:p-10 selection:bg-blue-300 selection:text-blue-950 font-sans">
      {/* ========================================================
          FULL-SCREEN VIBRANT ROYAL BLUE BACKDROP WITH 3D SPHERES
         ======================================================== */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, #0076f7 0%, #0062dd 40%, #0050be 80%, #00378b 100%)",
        }}
      />

      {/* 3D Blue Sphere 1: Top Left ambient orb */}
      <div
        className={`fixed -top-32 -left-32 w-[340px] sm:w-[440px] h-[340px] sm:h-[440px] rounded-full z-1 pointer-events-none transition-all duration-1000 ease-out ${
          isMounted ? "opacity-40 scale-100" : "opacity-0 scale-90"
        }`}
        style={{
          background:
            "radial-gradient(circle at 35% 35%, #59adff 0%, #0267dd 60%, #003e9c 100%)",
        }}
      />

      {/* 3D Blue Sphere 2: Massive bottom-left glowing orb */}
      <div
        className={`fixed -bottom-28 -left-20 w-[360px] sm:w-[480px] h-[360px] sm:h-[480px] rounded-full z-1 pointer-events-none transition-all duration-1000 delay-100 ease-out ${
          isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
        }`}
        style={{
          background:
            "radial-gradient(circle at 32% 28%, #41a6ff 0%, #066de4 45%, #013f93 85%, #002766 100%)",
          boxShadow:
            "inset -28px -28px 56px rgba(0, 20, 60, 0.65), inset 18px 18px 36px rgba(255, 255, 255, 0.28), 0 32px 70px rgba(0, 0, 0, 0.35)",
        }}
      />

      {/* 3D Blue Sphere 3: Overlapping bright front orb */}
      <div
        className={`fixed bottom-2 left-32 sm:left-64 w-48 sm:w-72 h-48 sm:h-72 rounded-full z-2 pointer-events-none transition-all duration-1000 delay-200 ease-out ${
          isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #6ec0ff 0%, #1e8aff 40%, #025fc9 85%, #003780 100%)",
          boxShadow:
            "inset -20px -20px 44px rgba(0, 20, 60, 0.6), inset 14px 14px 28px rgba(255, 255, 255, 0.35), 0 24px 50px rgba(0, 0, 0, 0.3)",
        }}
      />

      {/* 3D Blue Sphere 4: Bottom-right corner orb */}
      <div
        className={`fixed -bottom-24 -right-16 w-56 sm:w-80 h-56 sm:h-80 rounded-full z-1 pointer-events-none transition-all duration-1000 delay-300 ease-out ${
          isMounted ? "opacity-85 translate-y-0" : "opacity-0 translate-y-16"
        }`}
        style={{
          background:
            "radial-gradient(circle at 35% 35%, #4bb0ff 0%, #0266da 55%, #003882 100%)",
          boxShadow:
            "inset -18px -18px 40px rgba(0, 20, 60, 0.55), inset 12px 12px 24px rgba(255, 255, 255, 0.25), 0 20px 45px rgba(0, 0, 0, 0.25)",
        }}
      />

      {/* ========================================================
          TOP BRAND STRIP (VISIBLE ON ALL SCREENS)
         ======================================================== */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between pb-4 sm:pb-6">
        <div className="flex items-center gap-3.5">
          {/* Official Company Lion Logo (Solid high-contrast white badge for crystal clarity) */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-2 flex items-center justify-center shadow-xl shadow-blue-950/40 ring-4 ring-white/30 shrink-0">
            <Image
              src={branding.logoUrl || "/company-logo.png"}
              alt="PrimeWave Lion Logo"
              width={52}
              height={52}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-extrabold text-base sm:text-lg tracking-tight font-heading">
                {branding.brandTitle}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold text-blue-100 uppercase tracking-wider backdrop-blur-xs">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-blue-100/90 font-medium hidden sm:block">
              {branding.companyName}
            </p>
          </div>
        </div>

        {/* System Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-blue-100 font-medium shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] sm:text-xs font-semibold">Cluster Online</span>
        </div>
      </header>

      {/* ========================================================
          MAIN CONTENT CONTAINER: SPLIT TWO-COLUMN HERO + CARD
         ======================================================== */}
      <main className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-14 py-4 sm:py-8 my-auto">
        
        {/* ========================================================
            LEFT COLUMN: RICH PRODUCTION COMPANY HERO SECTION
           ======================================================== */}
        <div
          className={`flex-1 text-white max-w-2xl transition-all duration-700 ease-out ${
            isMounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
          }`}
        >
          {/* Brand Tag Pill */}
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100 mb-5 shadow-sm">
            <span>Enterprise Resource Orchestration Platform</span>
          </div>

          {/* Primary Welcome Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight font-heading drop-shadow-sm">
            WELCOME TO <br className="hidden sm:block" />
            <span className="text-white drop-shadow-md">
              {branding.brandTitle.toUpperCase()}
            </span>
          </h1>

          {/* Subtitle Headline */}
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-100 tracking-wide mt-2">
            Centralized Lab &amp; Facility Reservation Hub
          </h2>

          {/* Authentic Corporate Description */}
          <p className="mt-4 text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal max-w-xl">
            Streamline operational scheduling for precision laboratory suites, advanced AR/VR hardware rigs,
            high-capacity conference facilities, and corporate vehicles. Powered by strict serializable
            transaction isolation to eliminate double-booking anomalies under high concurrent demand.
          </p>

          {/* 4 Production Trust Metric Badges */}
          <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-3.5 text-center">
              <span className="text-xl sm:text-2xl font-black text-white block">99.98%</span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-blue-100/80 block mt-0.5">
                Uptime SLA
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-3.5 text-center">
              <span className="text-xl sm:text-2xl font-black text-emerald-300 block">0 Clash</span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-blue-100/80 block mt-0.5">
                ACID Isolation
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-3.5 text-center">
              <span className="text-xl sm:text-2xl font-black text-white block">250+</span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-blue-100/80 block mt-0.5">
                Certified Assets
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-3.5 text-center">
              <span className="text-xl sm:text-2xl font-black text-white block">5 Hubs</span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-blue-100/80 block mt-0.5">
                Global Operations
              </span>
            </div>
          </div>

          {/* Company Location & Compliance Information Card */}
          <div className="mt-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-100">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-blue-200 shrink-0" />
              <div>
                <span className="font-bold text-white block text-[11px] sm:text-xs">
                  {branding.headquarters}
                </span>
                <span className="text-[10px] text-blue-200/80">
                  Global Facility Management Office
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ISO 27001 RBAC</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: FLOATING CLEAN WHITE SIGN IN CARD
           ======================================================== */}
        <div
          className={`w-full max-w-[460px] shrink-0 transition-all duration-700 delay-150 ease-out ${
            isMounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"
          }`}
        >
          <div className="bg-white rounded-[32px] p-6 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,25,80,0.35)] border border-white/80 space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
                  Sign in
                </h2>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  Secure Access
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Enter your credentials to access the PrimeWave resource orchestration network.
              </p>
            </div>

            {/* Success Feedback */}
            {successRole && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Signed in as {successRole}. Redirecting to dashboard...</span>
              </div>
            )}

            {/* Error Feedback */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* User Name input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="login-username-input"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username or work email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 placeholder:text-slate-400 border border-slate-200/80 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none text-xs sm:text-sm font-medium transition-all"
                />
              </div>

              {/* Password input with SHOW / HIDE toggle */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-11 pr-20 py-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 placeholder:text-slate-400 border border-slate-200/80 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none text-xs sm:text-sm font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[11px] font-bold tracking-wider text-[#0c4a8a] hover:text-blue-900 cursor-pointer select-none"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none text-[11px]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setSystemNotice({
                      title: "Password Recovery Assistance",
                      message:
                        "For enterprise security and ISO 27001 RBAC compliance, passwords must be reset by an authorized Administrator. Please reach out to your IT support desk at " +
                        branding.supportEmail +
                        " or request an Administrator in your organization.",
                      type: "password",
                    })
                  }
                  className="text-xs font-semibold text-[#0c4a8a] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Primary Blue Sign in Button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#0a4d9c] hover:bg-[#073c7b] active:scale-[0.99] transition-all shadow-md shadow-blue-900/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 mt-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </form>

            {/* Quick Login Section */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-bold text-[10px] tracking-wider">
                  Fast Demo Switcher
                </span>
              </div>
            </div>

            {/* 1-Click Role Buttons */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2.5">
                {/* Admin Mode */}
                <button
                  id="quick-login-admin"
                  type="button"
                  onClick={() => handleQuickLogin("admin")}
                  disabled={loading}
                  className="flex flex-col items-start p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Admin Mode</span>
                  </div>
                  <span className="text-[10px] text-blue-700/80 mt-0.5 line-clamp-1">
                    Full system access
                  </span>
                </button>

                {/* User Mode */}
                <button
                  id="quick-login-user"
                  type="button"
                  onClick={() => handleQuickLogin("user")}
                  disabled={loading}
                  className="flex flex-col items-start p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <UserCheck className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>User Mode</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    Standard booking
                  </span>
                </button>
              </div>

              {/* Credentials Reference Helper */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Admin: <strong className="text-slate-800">admin / admin123</strong></span>
                <span>User: <strong className="text-slate-800">user / user123</strong></span>
              </div>
            </div>

            {/* Bottom onboard helper */}
            <div className="text-center text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span>Need an account? </span>
              <button
                type="button"
                onClick={() =>
                  setSystemNotice({
                    title: "Organizational Account Onboarding",
                    message:
                      "PrimeWave is a private enterprise platform. New accounts are provisioned directly by authorized Administrators via the Team & Access Directory. Please request your department lead or workspace administrator to create your account.",
                    type: "access",
                  })
                }
                className="text-blue-700 hover:text-blue-900 font-bold cursor-pointer underline"
              >
                Request Access
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================
          ENTERPRISE SYSTEM NOTICE MODAL (Replaces browser alerts)
         ======================================================== */}
      {systemNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 space-y-4">
            <button
              onClick={() => setSystemNotice(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                {systemNotice.type === "password" ? (
                  <KeyRound className="w-5 h-5" />
                ) : (
                  <UserPlus className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {systemNotice.title}
                </h3>
                <span className="text-[11px] font-semibold text-indigo-600">
                  PrimeWave Security Governance
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {systemNotice.message}
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSystemNotice(null)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PRODUCTION FOOTER
         ======================================================== */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto pt-4 sm:pt-6 border-t border-white/15 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-blue-100/80">
        <p className="text-center md:text-left text-[11px] sm:text-xs">
          © 2026 {branding.companyName} • {branding.tagline}
        </p>

        <DeveloperSignature variant="login" />

        <div className="flex items-center gap-4 text-[11px]">
          <span className="hover:text-white transition-colors cursor-pointer">
            Support: {branding.supportEmail}
          </span>
          <span>•</span>
          <span className="hover:text-white transition-colors cursor-pointer">
            Security Status
          </span>
          <span>•</span>
          <span className="hover:text-white transition-colors cursor-pointer">
            Privacy Policy
          </span>
        </div>
      </footer>
    </div>

  );
}
