"use client";

import { 
  CreditCard, 
  Search, 
  Download, 
  ArrowDownLeft, 
  ArrowUpRight, 
  MoreHorizontal,
  Banknote,
  Calendar,
  Filter
} from "lucide-react";

export default function PaymentsManagement() {
  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-3">Transactions</h1>
          <p className="text-neutral-500 font-medium">Global payment tracking and settlement history across all restaurants.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center justify-center gap-2 bg-neutral-900 border border-neutral-800 text-white px-6 py-3.5 rounded-2xl font-black text-xs hover:bg-neutral-800 transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Mini Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Volume", value: "₹42.5L", icon: Banknote, growth: "+18%", color: "orange" },
          { label: "Settlements", value: "₹38.2L", icon: Calendar, color: "neutral" },
          { label: "Pending Disp.", value: "₹4.3L", icon: CreditCard, color: "neutral" },
        ].map((item, i) => (
          <div key={i} className="glass p-6 rounded-[2rem] border border-neutral-800/50 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              {item.growth && <span className="text-[10px] font-black text-green-500">{item.growth} ↑</span>}
            </div>
            <div>
              <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-1">{item.label}</p>
              <h4 className="text-2xl font-black text-white leading-none">{item.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass p-4 rounded-3xl border border-neutral-800/50">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search by Transaction ID or Restaurant..."
            className="w-full bg-black/50 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center gap-2 px-5 py-3 glass rounded-xl border border-neutral-800/50 text-xs font-black text-neutral-400 hover:text-white transition-all">
            <Filter className="w-3.5 h-3.5" /> All Status
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="glass rounded-[2rem] border border-neutral-800/50 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800/50 bg-neutral-900/50 uppercase">
              <th className="px-8 py-5 text-[10px] font-black text-neutral-500 tracking-widest">Transaction ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-neutral-500 tracking-widest">Restaurant</th>
              <th className="px-8 py-5 text-[10px] font-black text-neutral-500 tracking-widest">Amount</th>
              <th className="px-8 py-5 text-[10px] font-black text-neutral-500 tracking-widest">Type</th>
              <th className="px-8 py-5 text-[10px] font-black text-neutral-500 tracking-widest">Date</th>
              <th className="px-8 py-5 text-[10px] font-black text-neutral-500 tracking-widest">Status</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-neutral-900/30 transition-all group cursor-pointer">
                <td className="px-8 py-6">
                  <span className="text-xs font-black text-neutral-300">#TXN-9{i}827{i}4</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary">RD</div>
                    <span className="text-xs font-bold text-white">The Royal Diner</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-black text-white">₹{2499 + (i * 1000)}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500">
                    <ArrowUpRight className="w-3 h-3" /> Subscription
                  </div>
                </td>
                <td className="px-8 py-6 text-xs text-neutral-500 font-medium whitespace-nowrap">Mar 1{i}, 2025</td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full w-fit">
                    <div className="w-1 h-1 rounded-full bg-green-500" />
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter">Success</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <button className="p-2 text-neutral-600 hover:text-white transition-all">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
