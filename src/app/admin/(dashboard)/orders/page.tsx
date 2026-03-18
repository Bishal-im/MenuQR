"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Printer,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

const ordersData = [
  { id: "#ORD-024", table: "T-03", items: [{ name: "Chicken Momo", qty: 2 }, { name: "Thali", qty: 1 }], total: 1250, time: "2 mins ago", status: "Preparing" },
  { id: "#ORD-023", table: "T-09", items: [{ name: "Dal Bhat", qty: 4 }], total: 2400, time: "5 mins ago", status: "Pending" },
  { id: "#ORD-022", table: "T-05", items: [{ name: "Thukpa", qty: 2 }, { name: "Sekwa", qty: 1 }], total: 1800, time: "12 mins ago", status: "Ready" },
  { id: "#ORD-021", table: "T-02", items: [{ name: "Buff Momo", qty: 2 }, { name: "Chai", qty: 2 }], total: 950, time: "25 mins ago", status: "Completed" },
  { id: "#ORD-020", table: "T-04", items: [{ name: "Sekwa", qty: 1 }, { name: "Lassi", qty: 1 }], total: 650, time: "45 mins ago", status: "Completed" },
];

const statusFilters = ["All", "Pending", "Preparing", "Ready", "Completed"];

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<typeof ordersData[0] | null>(null);

  const filteredOrders = activeFilter === "All" 
    ? ordersData 
    : ordersData.filter(o => o.status === activeFilter);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Pending": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Preparing": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Ready": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Completed": return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
      default: return "bg-zinc-500/10 text-zinc-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
          <p className="text-sm text-muted">Manage all active and past orders</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search table or ID..." 
              className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-64"
            />
          </div>
          <button className="flex h-10 items-center justify-center rounded-xl border border-border bg-card px-3 text-muted hover:text-foreground">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              activeFilter === filter 
                ? "bg-primary text-black" 
                : "bg-card border border-border text-muted hover:border-muted"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-background/30 px-6">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted font-sans">Table</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Items</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Total</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted text-right">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredOrders.map((order, i) => (
                <tr 
                  key={i} 
                  className="group hover:bg-white/5 transition cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-primary">{order.id}</p>
                    <p className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> {order.time}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-background border border-border px-2 py-1 text-xs font-bold">
                      {order.table}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-[200px]">
                    <p className="text-sm font-medium truncate">
                      {order.items.map(it => `${it.qty}x ${it.name}`).join(", ")}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold">Rs. {order.total}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase",
                      getStatusStyle(order.status)
                    )}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="rounded-lg p-1.5 text-muted hover:bg-white/10 hover:text-foreground">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Sidebar (Mobile/Overlay) */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-card border-l border-border shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold">Order Details</h3>
                  <button onClick={() => setSelectedOrder(null)} className="rounded-lg p-2 hover:bg-white/10 text-muted">
                    <MoreHorizontal className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-background border border-border p-4 mb-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Order ID</p>
                    <p className="font-bold text-primary">{selectedOrder.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Table</p>
                    <p className="font-bold">{selectedOrder.table}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                   <h4 className="text-sm font-bold uppercase tracking-widest text-muted">Items</h4>
                   {selectedOrder.items.map((item, idx) => (
                     <div key={idx} className="flex justify-between items-center py-2 border-b border-border/50">
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">{item.qty}</span>
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold">Rs. {item.qty * 300}</span>
                     </div>
                   ))}
                   <div className="pt-2 flex justify-between items-center font-bold text-lg">
                      <span>Total</span>
                      <span>Rs. {selectedOrder.total}</span>
                   </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Update Status</h4>
                  <div className="grid grid-cols-2 gap-3">
                     <button className="flex flex-col items-center justify-center h-20 rounded-2xl border border-border bg-background p-4 hover:border-primary hover:text-primary transition group">
                        <Clock className="h-5 w-5 mb-2 group-hover:animate-pulse" />
                        <span className="text-xs font-bold">Prepare</span>
                     </button>
                     <button className="flex flex-col items-center justify-center h-20 rounded-2xl border border-border bg-background p-4 hover:border-emerald-500 hover:text-emerald-500 transition group">
                        <CheckCircle2 className="h-5 w-5 mb-2 group-hover:scale-110 transition" />
                        <span className="text-xs font-bold">Ready</span>
                     </button>
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-primary font-bold text-black mt-4 hover:bg-amber-500 transition">
                     <Printer className="h-4 w-4" /> Print Invoice
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
