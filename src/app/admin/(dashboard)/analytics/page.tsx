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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-6">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 border border-emerald-500/20">
                <IndianRupee className="h-5 w-5" />
              </div>
              <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">+12%</span>
           </div>
           <p className="text-sm text-muted text-nowrap">Total Sales</p>
           <h3 className="text-2xl font-bold mt-1 truncate">Rs. {stats?.totalSales?.toLocaleString() || 0}</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="flex items-center text-xs font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-full">+5%</span>
           </div>
           <p className="text-sm text-muted text-nowrap">Orders Count</p>
           <h3 className="text-2xl font-bold mt-1">{stats?.orderCount || 0}</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 border border-purple-500/20">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="flex items-center text-xs font-bold text-purple-500 bg-purple-500/10 px-1.5 py-0.5 rounded-full">Avg</span>
           </div>
           <p className="text-sm text-muted text-nowrap">Avg. Order Value</p>
           <h3 className="text-2xl font-bold mt-1 truncate">Rs. {stats?.avgOrderValue?.toLocaleString() || 0}</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
                <Flame className="h-5 w-5" />
              </div>
              <span className="flex items-center text-xs font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full">Peak</span>
           </div>
           <p className="text-sm text-muted text-nowrap">Peak Hour</p>
           <h3 className="text-2xl font-bold mt-1">{stats?.peakHour || "N/A"}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-8">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold flex items-center gap-2">
                <BarIcon className="h-4 w-4 text-primary" /> Revenue Trend
              </h3>
              <p className="text-xs text-emerald-500 font-bold">Last 7 Days</p>
           </div>
           <div className="flex items-end justify-between h-56 gap-2">
              {(stats?.revenueTrend || []).map((day: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                   <div 
                    className={cn(
                      "w-full bg-primary/20 rounded-t-xl transition hover:bg-primary/40 cursor-pointer relative group",
                      i === 6 && "bg-primary"
                    )} 
                    style={{ height: `${day.percentage}%` }}
                   >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                         <div className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded shadow-xl border border-black/5">
                            Rs. {day.value.toLocaleString()}
                         </div>
                         <div className="w-2 h-2 bg-white rotate-45 mx-auto -mt-1" />
                      </div>
                   </div>
                   <span className="text-[10px] text-muted font-bold uppercase">{day.label}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Top Selling Items */}
        <div className="rounded-2xl border border-border bg-card p-8">
           <h3 className="font-bold flex items-center gap-2 mb-8">
             <Flame className="h-4 w-4 text-primary" /> Top Selling Dishes
           </h3>
           <div className="space-y-6">
              {(stats?.topItems || []).length > 0 ? (
                stats.topItems.map((item: any, i: number) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="font-bold text-primary">{item.count} sold</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.count / stats.topItems[0].count) * 100}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-muted text-sm italic">
                  Not enough data yet
                </div>
              )}
           </div>
        </div>
      </div>
      
      {/* Hourly Orders */}
      <div className="rounded-2xl border border-border bg-card p-8">
         <h3 className="font-bold flex items-center gap-2 mb-6">
           <Clock className="h-4 w-4 text-primary" /> Hourly Orders (Today's Distribution)
         </h3>
         <div className="flex items-end justify-between h-40 gap-1.5 pb-4 overflow-x-auto custom-scrollbar">
            {(stats?.hourlyOrders || []).map((item: any, i: number) => {
              return (
                <div key={i} 
                  className={cn(
                    "flex-1 min-w-[24px] bg-secondary rounded-t-lg hover:bg-primary/40 transition cursor-pointer relative group",
                    item.count > 0 && "bg-primary/20"
                  )} 
                  style={{ height: `${item.percentage}%` }}
                >
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                      <div className="bg-primary text-black text-[10px] font-bold px-2 py-1 rounded shadow-xl">
                        {item.count} Orders
                      </div>
                      <div className="w-2 h-2 bg-primary rotate-45 mx-auto -mt-1" />
                   </div>
                </div>
              );
            })}
         </div>
         <div className="flex justify-between px-2 mt-4 text-[10px] font-bold text-muted uppercase tracking-widest border-t border-border pt-4">
            <span>9am</span>
            <span>12pm</span>
            <span>3pm</span>
            <span>6pm</span>
            <span>8pm</span>
         </div>
      </div>
    </div>
   );
}
