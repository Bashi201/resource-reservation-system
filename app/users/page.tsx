"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Reservation } from "@prisma/client";
import { UsersSkeleton, Skeleton } from "@/components/skeletons";
import {
  Users,
  Search,
  ShieldCheck,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  ChevronRight,
  UserPlus,
  Loader2,
  Edit,
  ShieldOff,
  ArrowLeft,
  KeyRound,
  Upload,
  Trash2,
  Camera,
} from "lucide-react";
import { useAuth, RegisteredAccount, UserRole } from "@/lib/auth-context";

export default function UsersPage() {
  const {
    isAdmin,
    isHydrated,
    isLoading: authLoading,
    accounts,
    createAccount,
    updateAccount,
    deleteAccount,
    toggleAccountStatus,
  } = useAuth();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedRole, setSelectedRole] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<RegisteredAccount | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formDept, setFormDept] = useState("Engineering");
  const [formRole, setFormRole] = useState<RegisteredAccount["role"]>("Team Member");
  const [formStatus, setFormStatus] = useState<RegisteredAccount["status"]>("ACTIVE");
  const [formAvatarUrl, setFormAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<RegisteredAccount | null>(null);

  // Fetch reservations to calculate live booking count per user
  const fetchReservations = useCallback(async () => {
    try {
      const res = await fetch("/api/reservations");
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch (e) {
      console.error("Error loading reservations:", e);
    } finally {
      setLoadingReservations(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingAccount(null);
    setFormName("");
    setFormEmail("");
    setFormUsername("");
    setFormPassword("password123");
    setFormDept("Engineering");
    setFormRole("Team Member");
    setFormStatus("ACTIVE");
    setFormAvatarUrl(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (account: RegisteredAccount) => {
    setEditingAccount(account);
    setFormName(account.name);
    setFormEmail(account.email);
    setFormUsername(account.username);
    setFormPassword(account.password || "password123");
    setFormDept(account.department);
    setFormRole(account.role);
    setFormStatus(account.status);
    setFormAvatarUrl(account.avatarUrl || null);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle avatar upload via /api/upload
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setFormAvatarUrl(data.url);
    } catch (err: unknown) {
      console.error(err);
      setFormError(err instanceof Error ? err.message : "Error uploading avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Auto-suggest username when email is typed in create mode
  const handleEmailChange = (val: string) => {
    setFormEmail(val);
    if (!editingAccount && !formUsername) {
      const suggested = val.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
      setFormUsername(suggested);
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formEmail.trim() || !formUsername.trim()) {
      setFormError("Full name, email, and username are required.");
      return;
    }

    if (!formPassword.trim()) {
      setFormError("A login password is required so the user can authenticate.");
      return;
    }

    // Determine roleTier from role title
    const roleTier: UserRole = formRole === "Administrator" ? "admin" : "user";

    if (editingAccount) {
      await updateAccount(editingAccount.id, {
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        username: formUsername.trim().toLowerCase(),
        password: formPassword.trim(),
        department: formDept,
        role: formRole,
        roleTier,
        status: formStatus,
        avatarUrl: formAvatarUrl,
      });

      setActionSuccess(`Account for "${formName.trim()}" updated successfully.`);
    } else {
      const result = await createAccount({
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        username: formUsername.trim().toLowerCase(),
        password: formPassword.trim(),
        department: formDept,
        role: formRole,
        roleTier,
        status: formStatus,
        avatarUrl: formAvatarUrl,
      });

      if (!result.success) {
        setFormError(result.error || "Failed to create user account.");
        return;
      }

      setActionSuccess(`New user "${formName.trim()}" created! They can now log in immediately with their credentials.`);
    }

    setTimeout(() => setActionSuccess(null), 5000);
    setIsModalOpen(false);
  };

  const handleToggleStatus = async (account: RegisteredAccount) => {
    await toggleAccountStatus(account.id);
    setActionSuccess(
      `Account for "${account.name}" marked as ${
        account.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
      }.`
    );
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleDeleteUser = (account: RegisteredAccount) => {
    setAccountToDelete(account);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;
    await deleteAccount(accountToDelete.id);
    setActionSuccess(`Account for "${accountToDelete.name}" was permanently removed.`);
    setTimeout(() => setActionSuccess(null), 3500);
    setAccountToDelete(null);
  };

  // Map active reservations count to user by email
  const bookingCountByEmail = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of reservations) {
      if (r.status === "CONFIRMED") {
        const email = r.bookerEmail.toLowerCase();
        counts[email] = (counts[email] || 0) + 1;
      }
    }
    return counts;
  }, [reservations]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchesDept = selectedDept === "ALL" || acc.department === selectedDept;
      const matchesRole = selectedRole === "ALL" || acc.role === selectedRole;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        acc.name.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q) ||
        acc.username.toLowerCase().includes(q) ||
        acc.department.toLowerCase().includes(q);

      return matchesDept && matchesRole && matchesSearch;
    });
  }, [accounts, selectedDept, selectedRole, searchQuery]);

  const activeAccountsCount = accounts.filter((a) => a.status === "ACTIVE").length;
  const departmentsList = Array.from(new Set(accounts.map((a) => a.department)));

  if (!isHydrated || authLoading) {
    return <UsersSkeleton />;
  }

  if (!isAdmin) {
    return (

      <div className="min-h-[65vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <ShieldOff className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Administrator Access Required
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              The Team &amp; Access Directory is restricted to system administrators. Standard accounts do not have permission to view or manage organizational user accounts.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 text-left space-y-1">
            <span className="font-bold text-slate-800 block">Required Authorization:</span>
            <span>Switch to an account with <strong className="text-indigo-600">Administrator</strong> privileges to access personnel directories and permissions.</span>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-600" />
            <span>Team &amp; Access Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage company personnel, create active accounts, assign roles, and govern booking privileges.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs hover:shadow-md hover:shadow-indigo-600/20 transition-all transform active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Team Accounts
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">
              {accounts.length}
            </span>
            <span className="text-xs text-slate-500 block mt-1">
              {activeAccountsCount} active accounts authorized to book
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Bookers
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-emerald-600">
              {Object.keys(bookingCountByEmail).length}
            </span>
            <span className="text-xs text-slate-500 block mt-1">
              Have confirmed active reservations
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Departments Represented
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">
              {departmentsList.length}
            </span>
            <span className="text-xs text-slate-500 block mt-1">
              Engineering, Design, Exec, Ops &amp; Marketing
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Department Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-50 border border-slate-200/80 overflow-x-auto">
          {["ALL", "Engineering", "Executive", "Product & Design", "Operations", "Marketing"].map(
            (dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedDept === dept
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                {dept === "ALL" ? "All Departments" : dept}
              </button>
            )
          )}
        </div>

        {/* Search & Role Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full sm:w-auto rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-white border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="Administrator">Administrator</option>
            <option value="Facility Lead">Facility Lead</option>
            <option value="Team Member">Team Member</option>
          </select>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, username..."
              className="w-full rounded-xl pl-10 pr-9 py-2 text-xs text-slate-800 bg-slate-50 hover:bg-white border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Team Table / Directory List */}
      {loadingReservations ? (
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Team Member</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Role Tier</th>
                  <th className="py-3.5 px-4">Active Bookings</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[1, 2, 3, 4, 5].map((row) => (
                  <tr key={row} className="hover:bg-slate-50/50">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-36 rounded-md" />
                          <Skeleton className="h-3 w-48 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-24 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-6 w-28 rounded-full" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-12 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Skeleton className="h-8 w-16 rounded-lg" />
                        <Skeleton className="h-8 w-16 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredAccounts.length === 0 ? (

        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No members found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No accounts matched your current filter criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Team Member</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Role Tier</th>
                  <th className="py-3.5 px-4">Active Bookings</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredAccounts.map((account) => {
                  const activeBookings = bookingCountByEmail[account.email.toLowerCase()] || 0;
                  const initials = account.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={account.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          {account.avatarUrl ? (
                            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs relative">
                              <Image
                                src={account.avatarUrl}
                                alt={account.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {account.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                (@{account.username})
                              </span>
                            </div>
                            <span className="block text-[11px] text-slate-500">
                              {account.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span>{account.department}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            account.role === "Administrator"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : account.role === "Facility Lead"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-slate-50 text-slate-600 border border-slate-200"
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{account.role}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {activeBookings > 0 ? (
                          <Link
                            href={`/reservations`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                          >
                            <span>{activeBookings} active slot{activeBookings === 1 ? "" : "s"}</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span className="text-slate-400">0 active</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {account.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Suspended
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(account)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer text-xs"
                            title="Edit Account Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleToggleStatus(account)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              account.status === "ACTIVE"
                                ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                            }`}
                            title={account.status === "ACTIVE" ? "Suspend Account" : "Activate Account"}
                          >
                            {account.status === "ACTIVE" ? (
                              <ShieldOff className="w-3.5 h-3.5" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            )}
                            <span>{account.status === "ACTIVE" ? "Suspend" : "Activate"}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteUser(account)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 sm:p-8 border border-slate-200 relative shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {editingAccount ? "Edit Team Member Account" : "Onboard New Team Member"}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Configure login credentials, role permissions, and profile details.
            </p>

            <form onSubmit={handleSaveMember} className="space-y-4">
              {/* Profile Photo Uploader */}
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs flex items-center justify-center">
                  {formAvatarUrl ? (
                    <Image
                      src={formAvatarUrl}
                      alt="Avatar preview"
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                      {formName ? formName.charAt(0).toUpperCase() : <Camera className="w-6 h-6 text-slate-400" />}
                    </div>
                  )}

                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-bold text-slate-800">
                    Profile Picture / Avatar
                  </label>
                  <span className="text-[11px] text-slate-400 block mb-2">
                    JPG, PNG, or WebP up to 5MB
                  </span>

                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors">
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{formAvatarUrl ? "Change Photo" : "Upload Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                    </label>

                    {formAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => setFormAvatarUrl(null)}
                        className="text-xs text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Name & Work Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Dr. Julian Croft"
                    className="w-full rounded-xl px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="julian.c@primewave.com"
                    className="w-full rounded-xl px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Username & Login Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Login Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="e.g. julian"
                    className="w-full rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Account Password *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="e.g. password123"
                      className="w-full rounded-xl pl-3.5 pr-8 py-2.5 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
                    />
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Department & Role Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Department *
                  </label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Executive">Executive</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Role Tier *
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as RegisteredAccount["role"])}
                    className="w-full rounded-xl px-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Administrator">Administrator (Full Admin Access)</option>
                    <option value="Facility Lead">Facility Lead (Privileged Booking)</option>
                    <option value="Team Member">Team Member (Standard Booking)</option>
                  </select>
                </div>
              </div>

              {/* Account Status */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Account Status *
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as RegisteredAccount["status"])}
                  className="w-full rounded-xl px-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ACTIVE">Active (Allowed to sign in & book)</option>
                  <option value="INACTIVE">Suspended (Login blocked)</option>
                </select>
              </div>

              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs hover:shadow-md hover:shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <span>{editingAccount ? "Save Changes" : "Create Account"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Enterprise Delete Confirmation Modal */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xl relative animate-in zoom-in-95 duration-200 space-y-4">
            <button
              onClick={() => setAccountToDelete(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Delete Team Account
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Are you sure you want to permanently delete the account for{" "}
                <strong className="text-slate-900 font-bold">
                  {accountToDelete.name}
                </strong>{" "}
                <span className="font-mono text-slate-500">
                  (@{accountToDelete.username})
                </span>
                ?
              </p>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-[11px] text-rose-800 leading-relaxed">
              This action is permanent and cannot be undone. Active login sessions for this account will be invalidated immediately.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs hover:shadow-md hover:shadow-rose-600/20 transition-all cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
