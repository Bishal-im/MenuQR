"use client";

import { useState } from "react";
import { Plus, QrCode, Download, Trash2, Users, ExternalLink, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";

const tablesData = [
  { id: 1, number: "T1", capacity: 2, status: "Active", lastOrder: "15 mins ago" },
  { id: 2, number: "T2", capacity: 4, status: "Active", lastOrder: "5 mins ago" },
  { id: 3, number: "T3", capacity: 4, status: "Empty", lastOrder: "2 hours ago" },
  { id: 4, number: "T4", capacity: 6, status: "Active", lastOrder: "Now" },
  { id: 5, number: "T5", capacity: 2, status: "Empty", lastOrder: "1 hour ago" },
  { id: 6, number: "T6", capacity: 4, status: "Active", lastOrder: "30 mins ago" },
];

export default function TablesPage() {
  const [showQRModal, setShowQRModal] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; number: string }>({
    isOpen: false,
    id: null,
    number: ""
  });

  const handleDelete = () => {
    // Mock deletion
    console.log("Deleting table:", deleteModal.number);
    setDeleteModal({ ...deleteModal, isOpen: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tables & QR Codes</h2>
          <p className="text-sm text-muted">Generate and manage QR codes for your restaurant tables</p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-black hover:bg-amber-500 transition shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Add New Table
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tablesData.map((table, i) => (
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
               <p className="text-xs text-muted/60">Last order: {table.lastOrder}</p>
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

      {/* QR Modal Placeholder */}
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
                       {/* Mock QR Code UI */}
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
      />
    </div>
  );
}
