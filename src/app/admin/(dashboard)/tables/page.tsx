"use client";

import { useState, useEffect } from "react";
import { Plus, QrCode, Download, Trash2, Users, ExternalLink, MoreVertical, X, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import { getTables, addTable, deleteTable, getStaff, assignWaiterToTable, StaffMember } from "@/services/adminService";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/context/AuthContext";

export default function TablesPage() {
  const { user } = useAuth();
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ number: "", capacity: 4 });
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [error, setError] = useState("");
  const [isAssigning, setIsAssigning] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState<any | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; number: string }>({
    isOpen: false,
    id: null,
    number: ""
  });

  const fetchData = async () => {
    setLoading(true);
    const [tableData, staffData] = await Promise.all([
      getTables(),
      getStaff()
    ]);
    setTables(tableData);
    setStaff(staffData);
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

  const handleAssignWaiter = async (tableId: string, waiterId: string) => {
    setIsSubmitting(true);
    const res = await assignWaiterToTable(tableId, waiterId === "none" ? null : waiterId);
    if (res.success) {
      setIsAssigning(null);
      await fetchData();
    } else {
      alert("Failed to assign waiter: " + res.error);
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

  // Generate QR URL
  const getQRUrl = (tableNumber: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || "https://menu-qr-topaz.vercel.app");
    return `${baseUrl}/menu?restaurantId=${user?.restaurantId}&tableId=${tableNumber}`;
  };

  const handleDownloadQR = (tableNumber: string) => {
    const svg = document.getElementById(`qr-code-${tableNumber}`) as any;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      
      const svgSize = 1024; // High res
      canvas.width = svgSize;
      canvas.height = svgSize;

      img.onload = () => {
        if (ctx) {
          // Fill background with white
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, svgSize, svgSize);
          
          const pngFile = canvas.toDataURL("image/png", 1.0);
          const downloadLink = document.createElement("a");
          downloadLink.download = `Table-${tableNumber}-QR.png`;
          downloadLink.href = `${pngFile}`;
          downloadLink.click();
        }
      };
      
      // Use URL.createObjectURL for better reliability
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      img.src = url;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden QR Codes for background downloading */}
      <div className="hidden">
        {tables.map(table => (
          <svg 
            key={`hidden-qr-${table.id}`}
            id={`qr-code-${table.number}`}
            width="1024" 
            height="1024" 
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="1024" height="1024" fill="white" />
            <g transform="translate(212, 112)">
              <QRCodeSVG 
                value={getQRUrl(table.number)}
                size={600}
                level="H"
                includeMargin={false}
              />
            </g>
            <text 
              x="512" 
              y="850" 
              fontFamily="sans-serif"
              fontSize="40" 
              fontWeight="bold" 
              fill="#71717a" 
              textAnchor="middle"
              style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
            >
              Table {table.number} • MenuQR
            </text>
          </svg>
        ))}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tables & QR Codes</h2>
          <p className="text-sm text-muted">Generate and manage QR codes for your restaurant tables</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 md:py-2 text-sm font-bold text-black hover:bg-amber-500 transition shadow-lg shadow-primary/20"
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

            <div className="mt-4 pt-4 border-t border-border/50">
               <label className="text-[10px] font-black uppercase tracking-wider text-muted mb-2 block">Assigned Waiter</label>
               <div className="flex items-center gap-2">
                 <div className="flex-grow">
                   {isAssigning === table.id ? (
                     <select 
                       className="w-full bg-secondary border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-primary"
                       onChange={(e) => handleAssignWaiter(table.id, e.target.value)}
                       defaultValue={table.assignedWaiter?.id || "none"}
                       disabled={isSubmitting}
                     >
                        <option value="none">Unassigned</option>
                        {staff.map(member => (
                          <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                     </select>
                   ) : (
                     <div className="flex items-center gap-2 group/waiter">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                           <Users className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {table.assignedWaiter?.name || "Not Assigned"}
                        </span>
                     </div>
                   )}
                 </div>
                 <button 
                   onClick={() => setIsAssigning(isAssigning === table.id ? null : table.id)}
                   className="p-1.5 rounded-lg hover:bg-secondary text-muted transition"
                 >
                   <MoreVertical className="w-4 h-4" />
                 </button>
               </div>
             </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
               <button 
                 onClick={() => setShowQRModal(table)}
                 className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-2 text-xs font-bold transition hover:border-primary hover:text-primary group/btn"
               >
                  <QrCode className="h-3.5 w-3.5 group-hover/btn:scale-110 transition" /> View QR
               </button>
               <button 
                 onClick={() => handleDownloadQR(table.number)}
                 className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-2 text-xs font-bold transition hover:bg-white/5 active:scale-95 transition-all"
               >
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
             className="relative w-full max-w-sm rounded-[2.5rem] bg-card p-8 border border-border shadow-2xl text-center overflow-hidden"
           >
              {/* Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 blur-[60px] pointer-events-none" />
              
              <div className="flex flex-col items-center relative z-10">
                 <div className="mb-6 rounded-3xl bg-white p-6 shadow-2xl shadow-black/20 relative overflow-hidden group">
                    <QRCodeSVG 
                      id={`qr-modal-${showQRModal.number}`}
                      value={getQRUrl(showQRModal.number)}
                      size={200}
                      level="H"
                      includeMargin={false}
                      imageSettings={{
                        src: "/favicon.ico",
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                      }}
                    />
                    <div className="mt-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-t border-zinc-100 pt-3">
                       Table {showQRModal.number} • MenuQR
                    </div>
                 </div>
                 <h3 className="text-2xl font-black text-white italic tracking-tighter">Table {showQRModal.number}</h3>
                 <p className="mt-2 text-[10px] text-muted font-black uppercase tracking-widest mb-8">SCAN TO VIEW MENU & ORDER</p>
                 
                 <div className="flex w-full gap-3">
                    <button 
                      onClick={() => handleDownloadQR(showQRModal.number)}
                      className="flex-1 rounded-2xl bg-primary py-4 text-xs font-black text-black uppercase tracking-widest transition hover:bg-amber-500 shadow-xl shadow-primary/20"
                    >
                       Download PNG
                    </button>
                    <button 
                      onClick={() => {
                        const url = getQRUrl(showQRModal.number);
                        window.open(url, '_blank');
                      }}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border transition hover:bg-white/5"
                    >
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
