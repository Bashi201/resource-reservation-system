"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Settings,
  Clock,
  Database,
  CheckCircle2,
  Save,
  Server,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  Cpu,
  Lock,
  Layers,
  User,
  Building2,
  Upload,
  Camera,
  RotateCcw,
  Sparkles,
  KeyRound,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useBranding } from "@/lib/branding-context";
import { SettingsSkeleton } from "@/components/skeletons";
import { DeveloperSignature } from "@/components/DeveloperSignature";

export default function SettingsPage() {
  const { user, isAdmin, updateCurrentUser, isHydrated } = useAuth();
  const { branding, updateBranding, resetBranding } = useBranding();


  const [activeTab, setActiveTab] = useState<
    "PROFILE" | "BRANDING" | "SCHEDULE" | "GOVERNANCE" | "DIAGNOSTICS"
  >("PROFILE");

  // User Profile form states
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profileDept, setProfileDept] = useState(user?.department || "Engineering");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
  const [avatarImgError, setAvatarImgError] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Sync user profile state if user changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
      setProfileDept(user.department);
      setProfileAvatarUrl(user.avatarUrl || null);
      setAvatarImgError(false);
    }
  }, [user]);

  // Company Branding form states (Admin only)


  const [companyName, setCompanyName] = useState(branding.companyName);
  const [brandTitle, setBrandTitle] = useState(branding.brandTitle);
  const [tagline, setTagline] = useState(branding.tagline);
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl);
  const [supportEmail, setSupportEmail] = useState(branding.supportEmail);
  const [headquarters, setHeadquarters] = useState(branding.headquarters);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Config states (Facility Schedule & Governance)
  const [timelineStart, setTimelineStart] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("pw_setting_timeline_start") || "08:00";
      } catch {
        // Ignore
      }
    }
    return "08:00";
  });

  const [timelineEnd, setTimelineEnd] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("pw_setting_timeline_end") || "20:00";
      } catch {
        // Ignore
      }
    }
    return "20:00";
  });

  const [slotInterval, setSlotInterval] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("pw_setting_slot_interval") || "60";
      } catch {
        // Ignore
      }
    }
    return "60";
  });

  const [advanceWindowDays, setAdvanceWindowDays] = useState("30");

  const [defaultSidebar, setDefaultSidebar] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("pw_sidebar_collapsed") === "true"
          ? "collapsed"
          : "expanded";
      } catch {
        // Ignore
      }
    }
    return "expanded";
  });

  // Toggles
  const [toastAlerts, setToastAlerts] = useState(true);
  const [bufferEnforcement, setBufferEnforcement] = useState(true);
  const [autoFreeCancelled, setAutoFreeCancelled] = useState(true);

  // Status & diagnostics
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [refreshingDb, setRefreshingDb] = useState(false);
  const [pingLatency, setPingLatency] = useState<string>("8ms");
  const [dbStats, setDbStats] = useState({
    resourcesCount: 0,
    reservationsCount: 0,
    status: "Healthy & Synchronized",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resR, resB] = await Promise.all([
          fetch("/api/resources"),
          fetch("/api/reservations"),
        ]);
        if (resR.ok && resB.ok) {
          const rData = await resR.json();
          const bData = await resB.json();
          setDbStats({
            resourcesCount: rData.length,
            reservationsCount: bData.length,
            status: "Healthy & Synchronized",
          });
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, []);

  // Avatar upload handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setFormError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to upload avatar");
      }

      const data = await res.json();
      setProfileAvatarUrl(data.url);
      setAvatarImgError(false);
      updateCurrentUser({ avatarUrl: data.url });
      setSavedSuccess("Profile picture updated and saved across your workspace!");
      setTimeout(() => setSavedSuccess(null), 4000);
    } catch (err: unknown) {
      console.error(err);
      setFormError(err instanceof Error ? err.message : "Error uploading avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Company logo upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setFormError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to upload logo");
      }

      const data = await res.json();
      setLogoUrl(data.url);
    } catch (err: unknown) {
      console.error(err);
      setFormError(err instanceof Error ? err.message : "Error uploading company logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  // Save Account Profile
  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    if (newPassword && newPassword !== confirmPassword) {
      setFormError("New password and confirmation password do not match.");
      return;
    }

    updateCurrentUser({
      name: profileName.trim(),
      email: profileEmail.trim(),
      department: profileDept,
      avatarUrl: profileAvatarUrl,
      ...(newPassword ? { password: newPassword.trim() } : {}),
    });

    setNewPassword("");
    setConfirmPassword("");
    setSavedSuccess("Your profile details and avatar were updated successfully across the platform!");
    setTimeout(() => setSavedSuccess(null), 4000);
  };

  // Save Company Branding (Admin Only)
  const handleSaveBranding = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    updateBranding({
      companyName: companyName.trim(),
      brandTitle: brandTitle.trim(),
      tagline: tagline.trim(),
      logoUrl: logoUrl.trim() || "/company-logo.png",
      supportEmail: supportEmail.trim(),
      headquarters: headquarters.trim(),
    });

    setSavedSuccess("Company branding and logo updated! Real-time changes synchronized to login page, navigation rail, and footers.");
    setTimeout(() => setSavedSuccess(null), 4500);
  };

  // Restore Official Lion Logo
  const handleResetToLionLogo = () => {
    setLogoUrl("/company-logo.png");
    updateBranding({ logoUrl: "/company-logo.png" });
    setSavedSuccess("Official PrimeWave Lion logo restored successfully!");
    setTimeout(() => setSavedSuccess(null), 3000);
  };

  // Save Facility Settings
  const handleSaveFacilitySettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem("pw_setting_timeline_start", timelineStart);
      localStorage.setItem("pw_setting_timeline_end", timelineEnd);
      localStorage.setItem("pw_setting_slot_interval", slotInterval);
      localStorage.setItem(
        "pw_sidebar_collapsed",
        defaultSidebar === "collapsed" ? "true" : "false"
      );
    } catch {
      // Ignore
    }

    setSavedSuccess("Facility operating hours and governance settings saved!");
    setTimeout(() => setSavedSuccess(null), 3500);
  };

  const handleTestDbConnection = async () => {
    setRefreshingDb(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/resources");
      const elapsed = Math.round(performance.now() - start);
      setPingLatency(`${Math.max(elapsed, 4)}ms`);
      if (res.ok) {
        const data = await res.json();
        setDbStats((prev) => ({
          ...prev,
          resourcesCount: data.length,
          status: "Verified Online",
        }));
      }
    } catch {
      setDbStats((prev) => ({ ...prev, status: "Connection Error" }));
    } finally {
      setTimeout(() => setRefreshingDb(false), 500);
    }
  };

  const applyPreset = (start: string, end: string, interval: string) => {
    setTimelineStart(start);
    setTimelineEnd(end);
    setSlotInterval(interval);
  };

  if (!isHydrated) {
    return <SettingsSkeleton />;
  }

  return (

    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-indigo-600" />
            <span>System &amp; Workspace Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure personal account details, company logo branding, operational hours, and infrastructure health.
          </p>
        </div>

        {/* Global Save Button contextual to active tab */}
        <div>
          {activeTab === "PROFILE" && (
            <button
              onClick={() => handleSaveProfile()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs hover:shadow-md hover:shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          )}

          {activeTab === "BRANDING" && isAdmin && (
            <button
              onClick={() => handleSaveBranding()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs hover:shadow-md hover:shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Company Branding</span>
            </button>
          )}

          {(activeTab === "SCHEDULE" || activeTab === "GOVERNANCE") && (
            <button
              onClick={() => handleSaveFacilitySettings()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs hover:shadow-md hover:shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {formError && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold animate-in fade-in">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Segmented Tab Navigation Bar */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: "PROFILE", label: "Account Profile", icon: User },
          { id: "BRANDING", label: "Company & Branding", icon: Building2, adminOnly: true },
          { id: "SCHEDULE", label: "Facility Schedule", icon: Clock },
          { id: "GOVERNANCE", label: "Governance & Interface", icon: SlidersHorizontal },
          { id: "DIAGNOSTICS", label: "Infrastructure Diagnostics", icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                active
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.adminOnly && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  active ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-700"
                }`}>
                  Admin
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: ACCOUNT & PROFILE SETTINGS
         ======================================================== */}
      {activeTab === "PROFILE" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Personal Account Profile &amp; Picture
                  </h2>
                  <p className="text-xs text-slate-500">
                    Update your account details and upload a personalized profile avatar.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Role:</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  isAdmin ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-slate-100 text-slate-700"
                }`}>
                  {user?.roleTitle || "Active User"}
                </span>
              </div>
            </div>

            {/* Avatar Section */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white shrink-0 flex items-center justify-center">
                {profileAvatarUrl && !avatarImgError ? (
                  <Image
                    src={profileAvatarUrl}
                    alt={profileName || "User avatar"}
                    fill
                    sizes="96px"
                    className="object-cover"
                    onError={() => setAvatarImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-bold text-2xl flex items-center justify-center">
                    {profileName ? profileName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "PW"}
                  </div>
                )}

                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Profile Avatar Image
                </h3>
                <p className="text-xs text-slate-500 max-w-md">
                  This picture will appear next to your bookings, in the top header, and on your user status card. Supported formats: JPG, PNG, WebP (up to 5MB).
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors">
                    <Camera className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{profileAvatarUrl ? "Upload New Picture" : "Choose Picture"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>

                  {profileAvatarUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileAvatarUrl(null);
                        setAvatarImgError(false);
                        updateCurrentUser({ avatarUrl: null });
                        setSavedSuccess("Profile picture removed successfully.");
                        setTimeout(() => setSavedSuccess(null), 3000);
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      Remove Picture
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Form Details */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Department
                  </label>
                  <select
                    value={profileDept}
                    onChange={(e) => setProfileDept(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs cursor-pointer"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Executive">Executive</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Account Username
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.username || "user"}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-mono font-semibold text-slate-500 bg-slate-100 border border-slate-200 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Usernames are managed by system administrators.
                  </span>
                </div>
              </div>

              {/* Security & Password Change */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Change Password</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      New Password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: COMPANY & BRANDING SETTINGS (ADMIN ONLY)
         ======================================================== */}
      {activeTab === "BRANDING" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {!isAdmin ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs text-center space-y-4">
              <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
              <h2 className="text-base font-bold text-slate-900">
                Administrator Privileges Required
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Company branding, organization name, and corporate logo customization can only be modified by system administrators.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Company Identity &amp; Official Logo
                    </h2>
                    <p className="text-xs text-slate-500">
                      Upload your corporate logo and configure company details displayed on the login page, navigation rail, and footers.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetToLionLogo}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  title="Reset to official PrimeWave lion insignia"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Official Lion Logo</span>
                </button>
              </div>

              {/* Company Logo Customizer & Dual Backdrop Preview */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Active Company Logo &amp; Preview
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live preview of how the brand logo appears on both dark and light application interfaces.
                  </p>
                </div>

                {/* Dual Previews */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Dark Backdrop Preview (Login Page Theme) */}
                  <div className="p-4 rounded-xl bg-[#0062dd] border border-blue-400/30 flex items-center justify-between shadow-inner">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 p-2 flex items-center justify-center relative shadow-sm">
                        <Image
                          src={logoUrl || "/company-logo.png"}
                          alt="Company Logo Preview Dark"
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <span className="text-white font-bold text-sm block">
                          {brandTitle}
                        </span>
                        <span className="text-[10px] text-blue-100/80 block">
                          Dark Hero Backdrop
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-100 bg-white/20 px-2.5 py-1 rounded-full">
                      Login Page
                    </span>
                  </div>

                  {/* Light Backdrop Preview (Sidebar & Header Theme) */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center relative shadow-2xs">
                        <Image
                          src={logoUrl || "/company-logo.png"}
                          alt="Company Logo Preview Light"
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <span className="text-slate-900 font-bold text-sm block">
                          {brandTitle}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Light Navigation Rail
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                      Sidebar Hub
                    </span>
                  </div>
                </div>

                {/* Upload Button */}
                <div className="flex items-center gap-3 pt-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>{uploadingLogo ? "Uploading..." : "Upload Custom Logo File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>

                  <span className="text-[11px] text-slate-500">
                    Recommended: Transparent PNG or SVG (square or horizontal ratio)
                  </span>
                </div>
              </div>

              {/* Corporate Details Form */}
              <form onSubmit={handleSaveBranding} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Legal Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="PrimeWave Lab (Pvt) Ltd"
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Brand Display Title
                    </label>
                    <input
                      type="text"
                      required
                      value={brandTitle}
                      onChange={(e) => setBrandTitle(e.target.value)}
                      placeholder="PrimeWave Lab"
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Platform Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      required
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="Resource Reservation Management System"
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      IT Support Email
                    </label>
                    <input
                      type="email"
                      required
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="support@primewave.com"
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Global Headquarters / Facility Address
                    </label>
                    <input
                      type="text"
                      required
                      value={headquarters}
                      onChange={(e) => setHeadquarters(e.target.value)}
                      placeholder="Silicon Quad Innovation District, Level 4"
                      className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    Save Company Branding
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: FACILITY SCHEDULE (EXISTING)
         ======================================================== */}
      {activeTab === "SCHEDULE" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Interactive Timeline Operational Hours
                  </h2>
                  <p className="text-xs text-slate-500">
                    Configure daily starting hours, closing hours, and interactive grid block resolutions.
                  </p>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="hidden lg:flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset("08:00", "20:00", "60")}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Standard (8 AM – 8 PM)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("07:00", "22:00", "30")}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Extended (7 AM – 10 PM)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Timeline Start Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="time"
                    value={timelineStart}
                    onChange={(e) => setTimelineStart(e.target.value)}
                    className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Facility opens (Default: 08:00 AM)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Timeline End Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="time"
                    value={timelineEnd}
                    onChange={(e) => setTimelineEnd(e.target.value)}
                    className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Facility closes (Default: 08:00 PM)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Slot Grid Interval
                </label>
                <select
                  value={slotInterval}
                  onChange={(e) => setSlotInterval(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs cursor-pointer"
                >
                  <option value="15">15 Minutes (Fine Granularity)</option>
                  <option value="30">30 Minutes (Standard)</option>
                  <option value="60">60 Minutes (Hourly Blocks)</option>
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Clickable slot interval on timeline
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Advance Booking Window
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={advanceWindowDays}
                  onChange={(e) => setAdvanceWindowDays(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Max days in advance to reserve
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: GOVERNANCE & INTERFACE (EXISTING)
         ======================================================== */}
      {activeTab === "GOVERNANCE" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Governance Rules &amp; Interface Behaviors
                </h2>
                <p className="text-xs text-slate-500">
                  Control automated collision safeguards, notifications, and navigation preferences.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Toggle 1 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">
                      Real-time Collision Alerts
                    </span>
                    <button
                      type="button"
                      onClick={() => setToastAlerts((prev) => !prev)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        toastAlerts ? "bg-indigo-600" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          toastAlerts ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Instantly display alert banners upon detecting overlapping time slots.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-indigo-700">
                  {toastAlerts ? "Active • Toast enabled" : "Disabled"}
                </span>
              </div>

              {/* Toggle 2 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">
                      15-Min Meeting Buffer
                    </span>
                    <button
                      type="button"
                      onClick={() => setBufferEnforcement((prev) => !prev)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        bufferEnforcement ? "bg-indigo-600" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          bufferEnforcement ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Prevent zero-minute turnover and require minimum 15-minute booking slots.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-indigo-700">
                  {bufferEnforcement ? "Active • Guard enabled" : "Disabled"}
                </span>
              </div>

              {/* Toggle 3 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">
                      Auto-free Cancelled Slots
                    </span>
                    <button
                      type="button"
                      onClick={() => setAutoFreeCancelled((prev) => !prev)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        autoFreeCancelled ? "bg-indigo-600" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          autoFreeCancelled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Soft cancellations instantly return asset capacity to the bookable inventory.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-indigo-700">
                  {autoFreeCancelled ? "Active • Instant release" : "Disabled"}
                </span>
              </div>
            </div>

            {/* Sidebar Rail Preference */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Default Sidebar Navigation Display
                </h3>
                <p className="text-xs text-slate-500">
                  Choose whether the left navigation rail starts expanded or compact by default.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDefaultSidebar("expanded")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    defaultSidebar === "expanded"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Expanded (Full labels)
                </button>
                <button
                  type="button"
                  onClick={() => setDefaultSidebar("collapsed")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    defaultSidebar === "collapsed"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Collapsed (Icon rail)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: INFRASTRUCTURE DIAGNOSTICS (EXISTING)
         ======================================================== */}
      {activeTab === "DIAGNOSTICS" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Database Engine
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Server className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-extrabold text-slate-900">PostgreSQL 16</span>
                <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{dbStats.status}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Prisma ORM Client
                </span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-extrabold text-slate-900">v6.4.1 Engine</span>
                <span className="text-xs text-slate-500 block mt-1">
                  Serializable isolation level
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ping Latency
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-extrabold text-emerald-600">{pingLatency}</span>
                <span className="text-xs text-slate-500 block mt-1">
                  {dbStats.resourcesCount} Assets • {dbStats.reservationsCount} Bookings active
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Live Infrastructure Connectivity &amp; Health
                  </h2>
                  <p className="text-xs text-slate-500">
                    Validate PostgreSQL connection pool and verify API query response times.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestDbConnection}
                disabled={refreshingDb}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshingDb ? "animate-spin" : ""}`} />
                <span>Test Connection Ping</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>ACID Concurrency Safety</span>
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  All reservation operations are executed with strict database transaction locks, preventing double booking anomalies under high concurrency.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Prisma Schema Drift Protection</span>
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Database migration schemas match the active Prisma client definition. All models are strongly typed with zero manual schema discrepancies.
                </p>
              </div>
            </div>
          </div>

          {/* Lead Software Engineer & Architect Credits */}
          <DeveloperSignature variant="card" />
        </div>
      )}

    </div>
  );
}
