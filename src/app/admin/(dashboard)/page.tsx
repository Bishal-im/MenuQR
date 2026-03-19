"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  IndianRupee, 
  ShoppingBag, 
  ArrowUpRight, 
  PieChart as PieIcon,
  BarChart as BarIcon,
  Clock,
  Flame,
  Wallet,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDashboardAnalytics } from "@/services/adminService";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const data = await getDashboardAnalytics();
      setStats(data);
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted font-medium">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Analytics</h2>
          <p className="text-sm text-muted">Insights for your Restaurant</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-xl">
          <button className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-black">Today</button>
          <button className="px-3 py-1.5 text-xs font-bold rounded-lg text-muted hover:text-foreground">This Week</button>
          <button className="px-3 py-1.5 text-xs font-bold rounded-lg text-muted hover:text-foreground">This Month</button>
        </div>
      </header>

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 border border-emerald-500/20">
                <IndianRupee className="h-5 w-5" />
              </div>
              <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">+12%</span>
           </div>
           <p className="text-sm text-muted">Total Sales</p>
           <h3 className="text-2xl font-bold mt-1">Rs. {stats?.totalSales?.toLocaleString() || 0}</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="flex items-center text-xs font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-full">+5%</span>
           </div>
           <p className="text-sm text-muted">Orders Count</p>
           <h3 className="text-2xl font-bold mt-1">{stats?.orderCount || 0}</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
                <Flame className="h-5 w-5" />
              </div>
              <span className="flex items-center text-xs font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full">Peak</span>
           </div>
           <p className="text-sm text-muted">Peak Business Hour</p>
           <h3 className="text-2xl font-bold mt-1">{stats?.peakHour || "N/A"}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Trend Placeholder */}
        <div className="rounded-2xl border border-border bg-card p-8">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold flex items-center gap-2">
                <BarIcon className="h-4 w-4 text-primary" /> Revenue Trend
              </h3>
              <p className="text-xs text-emerald-500 font-bold">Real-time Data</p>
           </div>
           <div className="flex items-end justify-between h-48 gap-2">
              {(stats?.revenueTrend || [40, 60, 45, 75, 55, 90, 80]).map((h: number, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                   <div 
                    className={cn(
                      "w-full bg-primary/20 rounded-t-lg transition hover:bg-primary/40 cursor-pointer relative group",
                      i === 6 && "bg-primary"
                    )} 
                    style={{ height: `${h}%` }}
                   >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition text-[10px] font-bold bg-white text-black p-1 rounded">
                         {h}%
                      </div>
                   </div>
                   <span className="text-[10px] text-muted font-bold uppercase">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Payment Split */}
        <div className="rounded-2xl border border-border bg-card p-8">
           <h3 className="font-bold flex items-center gap-2 mb-8">
             <Wallet className="h-4 w-4 text-primary" /> Payment Method Split
           </h3>
           <div className="flex items-center gap-8">
              <div className="relative h-40 w-40 flex items-center justify-center">
                 <div className="absolute inset-0 rounded-full border-[12px] border-secondary" />
                 <div className="absolute inset-0 rounded-full border-[12px] border-primary border-t-transparent border-r-transparent" />
                 <div className="text-center">
                    <p className="text-2xl font-bold">{stats?.paymentSplit?.find((p: any) => p.label === 'eSewa')?.val || "0%"}</p>
                    <p className="text-[10px] text-muted font-bold uppercase">eSewa</p>
                 </div>
              </div>
              <div className="flex-1 space-y-4">
                 {(stats?.paymentSplit || [
                   { label: "eSewa", val: "0%", color: "bg-primary" },
                   { label: "Khalti", val: "0%", color: "bg-purple-500" },
                   { label: "IME Pay", val: "0%", color: "bg-blue-500" },
                   { label: "Cash", val: "0%", color: "bg-zinc-500" },
                 ]).map((p: any, i: number) => (
                   <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className={cn("h-3 w-3 rounded-sm", p.color)} />
                         <span className="text-xs font-medium">{p.label}</span>
                      </div>
                      <span className="text-xs font-bold">{p.val}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
      
      {/* Hourly Orders Placeholder */}
      <div className="rounded-2xl border border-border bg-card p-8">
         <h3 className="font-bold flex items-center gap-2 mb-6">
           <Clock className="h-4 w-4 text-primary" /> Hourly Orders
         </h3>
         <div className="flex items-end justify-between h-32 gap-1 overflow-x-auto pb-4 custom-scrollbar">
            {[20, 35, 40, 50, 75, 95, 85, 60, 45, 30, 25, 15].map((h, i) => {
              return (
                <div key={i} className="flex-1 min-w-[20px] bg-secondary rounded-t-md hover:bg-primary/20 transition cursor-pointer relative group" style={{ height: `${h}%` }}>
                   <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[10px] font-bold">
                    {h}
                   </div>
                </div>
              );
            })}
         </div>
         <div className="flex justify-between px-2 mt-2 text-[10px] font-bold text-muted uppercase tracking-wider">
            <span>9am</span>
            <span>1pm</span>
            <span>4pm</span>
            <span>8pm</span>
         </div>
      </div>
    </div>
  );
}
