"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Reservation, Resource, ReservationStatus } from "@prisma/client";
import { format } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";
import { BookingModal } from "@/components/BookingModal";
import {
  Calendar,
  Search,
  Plus,
  Trash2,
  Edit,
  Clock,
  User,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

interface ReservationWithResource extends Reservation {
  resource: Resource;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationWithResource[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal Window state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [resourceFilter, setResourceFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Modal State
  const [editingRes, setEditingRes] = useState<ReservationWithResource | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBookerName, setEditBookerName] = useState("");
  const [editBookerEmail, setEditBookerEmail] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Cancel Confirmation Modal State
  const [cancellingRes, setCancellingRes] = useState<ReservationWithResource | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Success Notification
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [resBookings, resResources] = await Promise.all([
        fetch("/api/reservations"),
        fetch("/api/resources"),
      ]);

      if (resBookings.ok) {
        const data = await resBookings.json();
        setReservations(data);
      }
      if (resResources.ok) {
        const resData = await resResources.json();
        setResources(resData);
      }
    } catch (e) {
      console.error("Error fetching reservations:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openEditModal = (r: ReservationWithResource) => {
    setEditingRes(r);
    setEditTitle(r.title);
    setEditBookerName(r.bookerName);
    setEditBookerEmail(r.bookerEmail);

    const start = new Date(r.startTime);
    const end = new Date(r.endTime);

    setEditDate(format(start, "yyyy-MM-dd"));
    setEditStartTime(format(start, "HH:mm"));
    setEditEndTime(format(end, "HH:mm"));
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRes) return;

    setSavingEdit(true);
    setEditError(null);

    const startDateTime = new Date(`${editDate}T${editStartTime}:00`);
    const endDateTime = new Date(`${editDate}T${editEndTime}:00`);

    if (startDateTime >= endDateTime) {
      setEditError("End time must be later than start time.");
      setSavingEdit(false);
      return;
    }

    try {
      const res = await fetch(`/api/reservations/${editingRes.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          bookerName: editBookerName.trim(),
          bookerEmail: editBookerEmail.trim(),
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEditError(data.error || "Failed to update reservation.");
        return;
      }

      setActionSuccess(`Reservation "${data.title}" updated successfully.`);
      setTimeout(() => setActionSuccess(null), 4000);
      setEditingRes(null);
      fetchData();
    } catch (err) {
      console.error("Edit error:", err);
      setEditError("Network error occurred.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancellingRes) return;
    setCancelling(true);

    try {
      const res = await fetch(`/api/reservations/${cancellingRes.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to cancel reservation.");
        return;
      }

      setActionSuccess(data.message || "Reservation cancelled successfully.");
      setTimeout(() => setActionSuccess(null), 4000);
      setCancellingRes(null);
      fetchData();
    } catch (err) {
      console.error("Cancel error:", err);
      alert("Failed to cancel reservation.");
    } finally {
      setCancelling(false);
    }
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      const matchesResource = resourceFilter === "ALL" || r.resourceId === resourceFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        r.title.toLowerCase().includes(query) ||
        r.bookerName.toLowerCase().includes(query) ||
        r.bookerEmail.toLowerCase().includes(query) ||
        r.resource.name.toLowerCase().includes(query);

      return matchesStatus && matchesResource && matchesSearch;
    });
  }, [reservations, statusFilter, resourceFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-indigo-600" />
            <span>Reservation Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review confirmed bookings, inspect historical logs, and manage allocations.
          </p>
        </div>

        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs hover:shadow-md hover:shadow-indigo-600/20 transition-all transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Booking</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-50 border border-slate-200/80">
          {[
            { id: "ALL", label: "All Statuses" },
            { id: "CONFIRMED", label: "Confirmed" },
            { id: "CANCELLED", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Resource Selector & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="w-full sm:w-auto rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-white border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Facilities & Assets</option>
            {resources.map((res) => (
              <option key={res.id} value={res.id}>
                {res.name}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookings..."
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

      {/* Table / Cards List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading reservation schedule...</p>
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No reservations found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No matching booking records found. Try modifying your filter criteria or create a new reservation.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Status</th>
                  <th className="py-3.5 px-4">Reservation Title</th>
                  <th className="py-3.5 px-4">Facility / Resource</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Booker Contact</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredReservations.map((res) => {
                  const start = new Date(res.startTime);
                  const end = new Date(res.endTime);
                  const isConfirmed = res.status === ReservationStatus.CONFIRMED;

                  return (
                    <tr
                      key={res.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <StatusBadge status={res.status} type="reservation" />
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {res.title}
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-800">{res.resource.name}</span>
                        <span className="block text-[11px] text-slate-400">
                          {res.resource.type} • Cap: {res.resource.capacity}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{format(start, "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 mt-0.5">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          <span>
                            {format(start, "h:mm a")} – {format(end, "h:mm a")}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{res.bookerName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{res.bookerEmail}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        {isConfirmed ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(res)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer text-xs"
                              title="Edit reservation"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setCancellingRes(res)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                              title="Cancel reservation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Slot Released</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 sm:p-8 border border-slate-200 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditingRes(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-1">Modify Reservation</h2>
            <p className="text-xs text-slate-500 mb-6">
              Update timing or contact details for &quot;{editingRes.resource.name}&quot;.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Booker Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editBookerName}
                    onChange={(e) => setEditBookerName(e.target.value)}
                    className="w-full rounded-xl px-3.5 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Booker Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={editBookerEmail}
                    onChange={(e) => setEditBookerEmail(e.target.value)}
                    className="w-full rounded-xl px-3.5 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full rounded-xl px-2.5 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Start *
                  </label>
                  <input
                    type="time"
                    required
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full rounded-xl px-2.5 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    End *
                  </label>
                  <input
                    type="time"
                    required
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full rounded-xl px-2.5 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {editError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRes(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs hover:shadow-md hover:shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 sm:p-8 border border-slate-200 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-4 border border-rose-200">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Cancel Reservation?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to cancel the booking for &quot;
              <strong className="text-slate-900">{cancellingRes.title}</strong>&quot; on{" "}
              <strong className="text-slate-900">{cancellingRes.resource.name}</strong>?
            </p>
            <p className="text-[11px] text-slate-500 mt-2">
              The time slot will be instantly released, allowing other team members to book it. An audit record will be preserved.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancellingRes(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancelling}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-xs hover:shadow-md hover:shadow-rose-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {cancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal Window */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          setActionSuccess("Reservation confirmed successfully!");
          setTimeout(() => setActionSuccess(null), 4000);
          fetchData();
        }}
      />
    </div>
  );
}
