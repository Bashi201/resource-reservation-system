"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Reservation } from "@prisma/client";
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
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  department: string;
  role: "Administrator" | "Facility Lead" | "Team Member";
  status: "ACTIVE" | "INACTIVE";
  joinedDate: string;
}

const INITIAL_TEAM: TeamMember[] = [
  {
    id: "usr-1",
    name: "Bhashitha W.",
    email: "bhashitha@primewave.com",
    department: "Engineering",
    role: "Administrator",
    status: "ACTIVE",
    joinedDate: "Jan 15, 2026",
  },
  {
    id: "usr-2",
    name: "Samantha Wright",
    email: "samantha@primewave.com",
    department: "Executive",
    role: "Facility Lead",
    status: "ACTIVE",
    joinedDate: "Feb 01, 2026",
  },
  {
    id: "usr-3",
    name: "Natasha Roman",
    email: "natasha.r@primewave.com",
    department: "Engineering",
    role: "Team Member",
    status: "ACTIVE",
    joinedDate: "Feb 10, 2026",
  },
  {
    id: "usr-4",
    name: "David Miller",
    email: "david.m@primewave.com",
    department: "Product & Design",
    role: "Team Member",
    status: "ACTIVE",
    joinedDate: "Feb 18, 2026",
  },
  {
    id: "usr-5",
    name: "Elena Rostova",
    email: "elena.r@primewave.com",
    department: "Operations",
    role: "Facility Lead",
    status: "ACTIVE",
    joinedDate: "Mar 05, 2026",
  },
  {
    id: "usr-6",
    name: "Marcus Vance",
    email: "marcus.v@primewave.com",
    department: "Marketing",
    role: "Team Member",
    status: "ACTIVE",
    joinedDate: "Mar 12, 2026",
  },
];

export default function UsersPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("pw_team_members");
        if (saved) return JSON.parse(saved);
      } catch {
        // Ignore
      }
    }
    return INITIAL_TEAM;
  });

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedRole, setSelectedRole] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formDept, setFormDept] = useState("Engineering");
  const [formRole, setFormRole] = useState<TeamMember["role"]>("Team Member");
  const [formStatus, setFormStatus] = useState<TeamMember["status"]>("ACTIVE");
  const [formError, setFormError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const saveTeamState = (newTeam: TeamMember[]) => {
    setTeamMembers(newTeam);
    try {
      localStorage.setItem("pw_team_members", JSON.stringify(newTeam));
    } catch {
      // Ignore
    }
  };

  const openCreateModal = () => {
    setEditingMember(null);
    setFormName("");
    setFormEmail("");
    setFormDept("Engineering");
    setFormRole("Team Member");
    setFormStatus("ACTIVE");
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormEmail(member.email);
    setFormDept(member.department);
    setFormRole(member.role);
    setFormStatus(member.status);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formEmail.trim()) {
      setFormError("Full name and email are required.");
      return;
    }

    if (editingMember) {
      const updated = teamMembers.map((m) =>
        m.id === editingMember.id
          ? {
              ...m,
              name: formName.trim(),
              email: formEmail.trim(),
              department: formDept,
              role: formRole,
              status: formStatus,
            }
          : m
      );
      saveTeamState(updated);
      setActionSuccess(`Team member "${formName.trim()}" updated successfully.`);
    } else {
      const newMember: TeamMember = {
        id: `usr-${Date.now()}`,
        name: formName.trim(),
        email: formEmail.trim(),
        department: formDept,
        role: formRole,
        status: formStatus,
        joinedDate: "Today",
      };
      saveTeamState([newMember, ...teamMembers]);
      setActionSuccess(`Team member "${formName.trim()}" onboarded successfully.`);
    }

    setTimeout(() => setActionSuccess(null), 4000);
    setIsModalOpen(false);
  };

  const handleToggleStatus = (member: TeamMember) => {
    const updated = teamMembers.map((m) =>
      m.id === member.id
        ? {
            ...m,
            status: (m.status === "ACTIVE" ? "INACTIVE" : "ACTIVE") as TeamMember["status"],
          }
        : m
    );
    saveTeamState(updated);
    setActionSuccess(
      `Status for "${member.name}" set to ${
        member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
      }.`
    );
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Map reservations count to user by email
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

  const filteredMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      const matchesDept = selectedDept === "ALL" || m.department === selectedDept;
      const matchesRole = selectedRole === "ALL" || m.role === selectedRole;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q);

      return matchesDept && matchesRole && matchesSearch;
    });
  }, [teamMembers, selectedDept, selectedRole, searchQuery]);

  const activeMembersCount = teamMembers.filter((m) => m.status === "ACTIVE").length;
  const departmentsList = Array.from(new Set(teamMembers.map((m) => m.department)));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-600" />
            <span>Team & Access Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage company personnel, authorization tiers, and facility booking privileges.
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
              Total Team Members
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">
              {teamMembers.length}
            </span>
            <span className="text-xs text-slate-500 block mt-1">
              {activeMembersCount} active accounts authorized
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
              Have active confirmed reservations
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Departments
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
              Engineering, Design, Exec, Ops & Marketing
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
              placeholder="Search by name, email..."
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
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading directory...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No members found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No team members matched your current filter criteria.
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
                {filteredMembers.map((member) => {
                  const activeBookings = bookingCountByEmail[member.email.toLowerCase()] || 0;
                  const initials = member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <span className="block font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {member.name}
                            </span>
                            <span className="block text-[11px] text-slate-400">
                              {member.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span>{member.department}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            member.role === "Administrator"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : member.role === "Facility Lead"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-slate-50 text-slate-600 border border-slate-200"
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{member.role}</span>
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
                        {member.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(member)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer text-xs"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(member)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              member.status === "ACTIVE"
                                ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {member.status === "ACTIVE" ? (
                              <ShieldOff className="w-3.5 h-3.5" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            )}
                            <span>{member.status === "ACTIVE" ? "Suspend" : "Activate"}</span>
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
          <div className="bg-white w-full max-w-md rounded-2xl p-6 sm:p-8 border border-slate-200 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {editingMember ? "Edit Team Member" : "Onboard New Team Member"}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Configure personnel authorization and facility booking access.
            </p>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
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
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="elena.r@primewave.com"
                  className="w-full rounded-xl px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Department *
                  </label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none"
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
                    onChange={(e) => setFormRole(e.target.value as TeamMember["role"])}
                    className="w-full rounded-xl px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Facility Lead">Facility Lead</option>
                    <option value="Team Member">Team Member</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Account Status *
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as TeamMember["status"])}
                  className="w-full rounded-xl px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ACTIVE">Active (Can Book Slots)</option>
                  <option value="INACTIVE">Suspended (Read Only)</option>
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs hover:shadow-md hover:shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <span>{editingMember ? "Save Changes" : "Create Member"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
