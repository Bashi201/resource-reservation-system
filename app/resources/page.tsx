"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Resource, ResourceType, ResourceStatus } from "@prisma/client";
import { ResourceCard } from "@/components/ResourceCard";
import { BookingModal } from "@/components/BookingModal";
import {
  Layers,
  Search,
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  DoorOpen,
  Monitor,
  Car,
} from "lucide-react";

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Resource Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // Booking Modal Window State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingResourceId, setBookingResourceId] = useState<string | undefined>(undefined);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<ResourceType>(ResourceType.ROOM);
  const [formCapacity, setFormCapacity] = useState<number>(6);
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<ResourceStatus>(ResourceStatus.AVAILABLE);

  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    try {
      const res = await fetch("/api/resources");
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (e) {
      console.error("Error fetching resources:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const openCreateModal = () => {
    setEditingResource(null);
    setFormName("");
    setFormType(ResourceType.ROOM);
    setFormCapacity(6);
    setFormDescription("");
    setFormStatus(ResourceStatus.AVAILABLE);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (res: Resource) => {
    setEditingResource(res);
    setFormName(res.name);
    setFormType(res.type);
    setFormCapacity(res.capacity);
    setFormDescription(res.description || "");
    setFormStatus(res.status);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);

    const payload = {
      name: formName.trim(),
      type: formType,
      capacity: Number(formCapacity),
      description: formDescription.trim(),
      status: formStatus,
    };

    try {
      let res;
      if (editingResource) {
        res = await fetch(`/api/resources/${editingResource.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const result = await res.json();

      if (!res.ok) {
        setModalError(result.error || "Failed to save resource.");
        return;
      }

      setActionSuccess(
        editingResource
          ? `Resource "${result.name}" updated successfully!`
          : `Resource "${result.name}" registered successfully!`
      );
      setTimeout(() => setActionSuccess(null), 4000);

      setIsModalOpen(false);
      fetchResources();
    } catch (e) {
      console.error("Save error:", e);
      setModalError("A network error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesType =
        selectedType === "ALL" || resource.type === selectedType;
      const matchesQuery =
        searchQuery === "" ||
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.description &&
          resource.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesQuery;
    });
  }, [resources, selectedType, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-indigo-600" />
            <span>Shared Resource Catalog</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse conference rooms, audio-visual equipment, and fleet vehicles.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs hover:shadow-md hover:shadow-indigo-600/20 transition-all transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Resource</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-50 border border-slate-200/80 overflow-x-auto">
          {[
            { id: "ALL", label: "All Assets", icon: Layers },
            { id: "ROOM", label: "Meeting Rooms", icon: DoorOpen },
            { id: "EQUIPMENT", label: "Equipment", icon: Monitor },
            { id: "VEHICLE", label: "Vehicles", icon: Car },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="catalog-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or feature..."
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

      {/* Resources Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading catalog...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No resources found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No items matched your current filter criteria. Try adjusting your search query or reset the filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onEdit={openEditModal}
              onBook={(r) => {
                setBookingResourceId(r.id);
                setIsBookingModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 sm:p-8 border border-slate-200 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {editingResource ? "Edit Resource Details" : "Register New Shared Resource"}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Fill in the specifications for this company asset.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Resource Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Innovation Boardroom Alpha"
                  className="w-full rounded-xl px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ResourceType)}
                    className="w-full rounded-xl px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value={ResourceType.ROOM}>Meeting Room</option>
                    <option value={ResourceType.EQUIPMENT}>Equipment</option>
                    <option value={ResourceType.VEHICLE}>Vehicle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Capacity / Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    required
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full rounded-xl px-3.5 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Operational Status *
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as ResourceStatus)}
                  className="w-full rounded-xl px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value={ResourceStatus.AVAILABLE}>Available (Bookable)</option>
                  <option value={ResourceStatus.MAINTENANCE}>Maintenance (Offline)</option>
                  <option value={ResourceStatus.INACTIVE}>Inactive (Decommissioned)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Description / Amenities
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Key features, video conference tech, seating layout..."
                  className="w-full rounded-xl px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              {modalError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{modalError}</span>
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
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs hover:shadow-md hover:shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingResource ? "Save Changes" : "Create Resource"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal Window */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialResourceId={bookingResourceId}
        onSuccess={() => {
          setActionSuccess("Reservation confirmed successfully!");
          setTimeout(() => setActionSuccess(null), 4000);
          fetchResources();
        }}
      />
    </div>
  );
}
