"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Shield, User, Mail, Phone, Trash2, Edit2, Loader2, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStaff, addStaff, deleteStaff, StaffMember } from "@/services/adminService";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";

export default function StaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: "",
    name: ""
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await getStaff();
      setStaffList(data);
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      const res = await addStaff(formData.name, formData.email, formData.phone);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ name: "", email: "", phone: "" });
        await fetchStaff();
      } else {
        setError(res.error || "Failed to add staff member.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    const { id } = deleteModal;
    setIsSubmitting(true);
    try {
      const res = await deleteStaff(id);
      if (res.success) {
        setDeleteModal({ ...deleteModal, isOpen: false });
        await fetchStaff();
      } else {
        alert(res.error || "Failed to delete staff member.");
      }
    } catch (err) {
      alert("Failed to delete staff member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Staff Management</h2>
          <p className="text-sm text-muted">Manage your team and their access levels</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-black hover:bg-amber-500 transition shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" /> Add Staff Member
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted font-medium">Loading staff members...</p>
        </div>
      ) : staffList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <User className="h-6 w-6 text-muted" />
          </div>
          <h3 className="mt-4 text-lg font-bold">No Staff Members</h3>
          <p className="mt-2 text-sm text-muted">You haven't added any staff members yet.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold hover:bg-secondary transition"
          >
            <Plus className="h-4 w-4" /> Add Your First Waiter
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-background/30 px-6">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Role</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center border border-border">
                          <User className="h-4 w-4 text-muted" />
                        </div>
                        <span className="text-sm font-bold">{staff.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-muted capitalize">{staff.role}</td>
                    <td className="px-6 py-4">
                      <p className="text-xs flex items-center gap-2"><Mail className="h-3 w-3" /> {staff.email}</p>
                      {staff.phone && (
                        <p className="text-[10px] text-muted flex items-center gap-2 mt-1"><Phone className="h-3 w-3" /> {staff.phone}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                        staff.status === "Active" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"
                      )}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* <button className="p-2 text-muted hover:text-foreground hover:bg-white/10 rounded-lg">
                          <Edit2 className="h-4 w-4" />
                        </button> */}
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, id: staff.id, name: staff.name })}
                          className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDeleteStaff}
        itemName={deleteModal.name}
        description="Are you sure you want to delete this staff member? They will lose access to the waiter panel immediately."
        isLoading={isSubmitting}
      />

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Add New Waiter</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="p-2 rounded-full hover:bg-secondary transition disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none transition"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted">Email Address (for login)</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. john@example.com"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none transition"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="e.g. 9800000000"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none transition"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-xs font-bold text-red-500 border border-red-500/20">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-primary py-4 text-sm font-bold text-black hover:bg-amber-500 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding Waiter...
                  </>
                ) : (
                  "Add Staff Member"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
