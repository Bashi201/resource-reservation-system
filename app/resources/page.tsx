"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  UploadCloud,
  Trash2,
  RotateCw,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function ResourcesPage() {
  const { isAdmin } = useAuth();
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
  const [formImageUrl, setFormImageUrl] = useState("");

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!isAdmin) return;
    setEditingResource(null);
    setFormName("");
    setFormType(ResourceType.ROOM);
    setFormCapacity(6);
    setFormDescription("");
    setFormStatus(ResourceStatus.AVAILABLE);
    setFormImageUrl("");
    setImageUploadError(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (res: Resource) => {
    if (!isAdmin) return;
    setEditingResource(res);
    setFormName(res.name);
    setFormType(res.type);
    setFormCapacity(res.capacity);
    setFormDescription(res.description || "");
    setFormStatus(res.status);
    setFormImageUrl(res.imageUrl || "");
    setImageUploadError(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageUploadError("Please upload a valid image file (PNG, JPG, WebP, GIF, SVG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError("Image size exceeds the 5MB limit.");
      return;
    }

    setImageUploadError(null);
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setImageUploadError(data.error || "Failed to upload image.");
        return;
      }

      setFormImageUrl(data.url);
    } catch (err) {
      console.error("Upload error:", err);
      setImageUploadError("An error occurred while uploading. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setModalError("Unauthorized: Only administrators can create or edit resources.");
      return;
    }
    setSaving(true);
    setModalError(null);

    const payload = {
      name: formName.trim(),
      type: formType,
      capacity: Number(formCapacity),
      description: formDescription.trim(),
      status: formStatus,
      imageUrl: formImageUrl.trim() || null,
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
            Browse conference rooms, audio-visual equipment, and fleet vehicles with real-time status.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs hover:shadow-md hover:shadow-indigo-600/20 transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Resource</span>
          </button>
        )}
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

      {/* Resources Catalog Grid (Modern Space-Efficient 2-Column Grid) */}
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onEdit={isAdmin ? openEditModal : undefined}
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
          <div className="bg-white w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-slate-200 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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

              {/* Dedicated User Image Upload Section */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Resource Photo
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Optional (Max 5MB)
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                {formImageUrl ? (
                  /* Uploaded Image Preview & Controls */
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-16 h-14 rounded-xl overflow-hidden bg-slate-200 border border-slate-300/80 shrink-0">
                        <img
                          src={formImageUrl}
                          alt="Resource"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          Photo uploaded successfully
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {formImageUrl}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200 transition-colors cursor-pointer"
                        title="Replace photo"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${uploadingImage ? "animate-spin" : ""}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormImageUrl("")}
                        disabled={uploadingImage}
                        className="p-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                        title="Remove photo (revert to category placeholder)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Dropzone for Uploading */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-indigo-500 bg-indigo-50/50"
                        : "border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50"
                    }`}
                  >
                    {uploadingImage ? (
                      <div className="flex flex-col items-center justify-center py-2 gap-2">
                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                        <span className="text-xs font-medium text-slate-600">
                          Uploading image...
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-indigo-600 mb-0.5">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          Click to upload or drag & drop image
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Supports PNG, JPG, WebP up to 5MB. If skipped, category blueprint placeholder will be used.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {imageUploadError && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{imageUploadError}</span>
                  </div>
                )}
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
                  className="w-full rounded-xl px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all resize-none shadow-2xs"
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
                  disabled={saving || uploadingImage}
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
