"use client";

import { motion } from "framer-motion";
import { 
  IndianRupee, 
  ShoppingBag, 
  ArrowUpRight, 
  PieChart as PieIcon,
  BarChart as BarIcon,
  Clock,
  Flame,
  Wallet
} from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Analytics</h2>
          <p className="text-sm text-muted">Insights for Momo House - Thamel Branch</p>
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
              <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">+18%</span>
           </div>
           <p className="text-sm text-muted">Total Sales</p>
           <h3 className="text-2xl font-bold mt-1">Rs. 84,250</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="flex items-center text-xs font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-full">+5%</span>
           </div>
           <p className="text-sm text-muted">Orders Count</p>
           <h3 className="text-2xl font-bold mt-1">1,420</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
                <Flame className="h-5 w-5" />
              </div>
              <span className="flex items-center text-xs font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full">-2%</span>
           </div>
           <p className="text-sm text-muted">Peak Hour Peak</p>
           <h3 className="text-2xl font-bold mt-1">1:00 PM</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Trend Placeholder */}
        <div className="rounded-2xl border border-border bg-card p-8">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold flex items-center gap-2">
                <BarIcon className="h-4 w-4 text-primary" /> Revenue Trend
              </h3>
              <p className="text-xs text-emerald-500 font-bold">Rs. 18,420 today</p>
           </div>
           <div className="flex items-end justify-between h-48 gap-2">
              {[40, 60, 45, 75, 55, 90, 80].map((h, i) => (
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
                    <p className="text-2xl font-bold">45%</p>
                    <p className="text-[10px] text-muted font-bold uppercase">eSewa</p>
                 </div>
              </div>
              <div className="flex-1 space-y-4">
                 {[
                   { label: "eSewa", val: "45%", color: "bg-primary" },
                   { label: "Khalti", val: "30%", color: "bg-purple-500" },
                   { label: "IME Pay", val: "15%", color: "bg-blue-500" },
                   { label: "Cash", val: "10%", color: "bg-zinc-500" },
                 ].map((p, i) => (
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
      
      {/* Popular Hours Heatmap snippet */}
      <div className="rounded-2xl border border-border bg-card p-8">
         <h3 className="font-bold flex items-center gap-2 mb-6">
           <Clock className="h-4 w-4 text-primary" /> Hourly Orders
         </h3>
         <div className="flex items-end justify-between h-32 gap-1 overflow-x-auto pb-4 custom-scrollbar">
            {Array.from({ length: 12 }).map((_, i) => {
              const h = [20, 35, 40, 50, 75, 95, 85, 60, 45, 30, 25, 15][i];
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
