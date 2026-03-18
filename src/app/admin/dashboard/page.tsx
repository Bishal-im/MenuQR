"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  IndianRupee,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

const stats = [
  { label: "Revenue Today", value: "Rs. 18,420", trend: "+12%", trendUp: true, icon: IndianRupee },
  { label: "Orders Today", value: "47", trend: "+5 new", trendUp: true, icon: ShoppingBag },
  { label: "Avg. Order Value", value: "Rs. 392", trend: "-3%", trendUp: false, icon: TrendingUp },
  { label: "Active Tables", value: "8 / 14", trend: "6 empty", trendUp: true, icon: Users },
];

const recentOrders = [
  { id: "#024", table: "Table 3", items: "Momo ×2, Thali", status: "Preparing", statusColor: "text-amber-500 bg-amber-500/10" },
  { id: "#023", table: "Table 9", items: "Dal Bhat ×4", status: "Pending", statusColor: "text-blue-500 bg-blue-500/10" },
  { id: "#022", table: "Table 5", items: "Thukpa ×2, Sekwa", status: "Ready", statusColor: "text-emerald-500 bg-emerald-500/10" },
  { id: "#021", table: "Table 2", items: "Momo ×2, Chai", status: "Completed", statusColor: "text-zinc-500 bg-zinc-500/10" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Good morning, Binod! 👋</h2>
          <p className="text-muted mt-1 text-sm">Sunday, March 18 • Restaurant is <span className="text-emerald-500 font-medium">Open</span></p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary transition">Download Report</button>
          <button className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-black hover:bg-amber-500 transition shadow-lg shadow-primary/20">+ New Item</button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/20 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-background border border-border p-2.5">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {stat.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h3 className="font-bold">Live Orders</h3>
            <button className="text-xs text-primary font-medium hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-background/30">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">ID</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Table</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Items</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recentOrders.map((order, i) => (
                  <tr key={i} className="group hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-sm font-medium text-primary">{order.id}</td>
                    <td className="px-6 py-4 text-sm font-medium">{order.table}</td>
                    <td className="px-6 py-4 text-xs text-muted max-w-[150px] truncate">{order.items}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${order.statusColor}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Dishes */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold mb-6">Popular Items Today</h3>
          <div className="space-y-6">
            {[
              { name: "Steamed Chicken Momo", count: 34, percent: 85 },
              { name: "Dal Bhat Thali", count: 28, percent: 65 },
              { name: "Buff Sekuwa", count: 19, percent: 45 },
              { name: "Thukpa Special", count: 11, percent: 25 },
            ].map((dish, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{dish.name}</span>
                  <span className="text-muted">{dish.count} orders</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dish.percent}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
