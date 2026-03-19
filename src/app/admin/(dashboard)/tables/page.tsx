"use client";

import { useState, useEffect } from "react";
import { Plus, QrCode, Download, Trash2, Users, ExternalLink, MoreVertical, X, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import { getTables, addTable, deleteTable } from "@/services/adminService";

export default function TablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ number: "", capacity: 4 });
  const [error, setError] = useState("");
  const [showQRModal, setShowQRModal] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; number: string }>({
    isOpen: false,
    id: null,
    number: ""
  });

  const fetchData = async () => {
    setLoading(true);
    const data = await getTables();
    setTables(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    const res = await addTable(formData.number, formData.capacity);
    if (res.success) {
      setIsModalOpen(false);
      setFormData({ number: "", capacity: 4 });
      await fetchData();
    } else {
      setError(res.error || "Failed to add table.");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setIsSubmitting(true);
    const res = await deleteTable(deleteModal.id);
    if (res.success) {
      setDeleteModal({ ...deleteModal, isOpen: false });
      await fetchData();
    } else {
      alert("Failed to delete table: " + res.error);
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted font-medium">Loading tables...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tables & QR Codes</h2>
          <p className="text-sm text-muted">Generate and manage QR codes for your restaurant tables</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-black hover:bg-amber-500 transition shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" /> Add New Table
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table, i) => (
          <motion.div 
            key={table.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative rounded-2xl border border-border bg-card p-6 hover:border-primary/20 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary border border-border font-bold text-lg">
                {table.number}
              </div>
              <div className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                table.status === "Active" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-zinc-500 bg-background border-border"
              )}>
                {table.status}
              </div>
            </div>

            <div className="mt-4 space-y-1">
               <div className="flex items-center gap-2 text-sm text-muted">
                  <Users className="h-3.5 w-3.5" />
                  <span>Capacity: {table.capacity} persons</span>
               </div>
               <p className="text-xs text-muted/60">Order Status: {table.lastOrder}</p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
               <button 
                 onClick={() => setShowQRModal(table.number)}
                 className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-2 text-xs font-bold transition hover:border-primary hover:text-primary group/btn"
               >
                  <QrCode className="h-3.5 w-3.5 group-hover/btn:scale-110 transition" /> View QR
               </button>
               <button className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-2 text-xs font-bold transition hover:bg-white/5">
                  <Download className="h-3.5 w-3.5" /> Save
               </button>
            </div>

            <button 
              onClick={() => setDeleteModal({ isOpen: true, id: table.id, number: table.number })}
              className="absolute right-4 bottom-[7.5rem] p-1 text-muted opacity-0 group-hover:opacity-100 transition hover:text-red-500"
            >
               <Trash2 className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Add Table Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Add New Table</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="p-2 rounded-full hover:bg-secondary transition disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddTable} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted">Table Number</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. T1"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none transition"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted">Capacity (Persons)</label>
                <input 
                  type="number" 
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none transition"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
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
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Table"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowQRModal(null)} />
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="relative w-full max-w-sm rounded-3xl bg-card p-8 border border-border shadow-2xl text-center"
           >
              <div className="flex flex-col items-center">
                 <div className="mb-6 rounded-2xl bg-white p-4 shadow-xl">
                    <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 relative">
                       <QrCode className="h-32 w-32 text-zinc-300" />
                       <p className="absolute bottom-2 text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Table {showQRModal} • MenuQR</p>
                    </div>
                 </div>
                 <h3 className="text-xl font-bold">Table {showQRModal} QR Code</h3>
                 <p className="mt-2 text-sm text-muted mb-8 italic">SCAN TO VIEW MENU & ORDER</p>
                 
                 <div className="flex w-full gap-3">
                    <button className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-black transition hover:bg-amber-500">
                       Download PNG
                    </button>
                    <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary border border-border transition hover:bg-white/5">
                       <ExternalLink className="h-5 w-5" />
                    </button>
                 </div>
              </div>
           </motion.div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        itemName={`Table ${deleteModal.number}`}
        description="Are you sure you want to delete this table? The associated QR code will become invalid."
        isLoading={isSubmitting}
      />
    </div>
  );
}
