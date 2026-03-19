"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  IndianRupee,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from "lucide-react";
import { getAdminDashboardStats } from "@/services/adminService";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const stats = await getAdminDashboardStats();
      if (stats) {
        setData(stats);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-neutral-500 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  const statsCards = [
    { label: "Revenue Today", value: `Rs. ${data?.revenueToday?.toLocaleString() || 0}`, trend: data?.revenueTrend || "+0%", trendUp: data?.revenueTrendUp, icon: IndianRupee },
    { label: "Orders Today", value: data?.ordersToday?.toString() || "0", trend: data?.ordersTrend || "+0%", trendUp: data?.ordersTrendUp, icon: ShoppingBag },
    { label: "Avg. Order Value", value: `Rs. ${data?.avgOrderValue?.toLocaleString() || 0}`, trend: "Today", trendUp: true, icon: IndianRupee },
    { label: "Active Tables", value: data?.tablesActive || "0 / 0", trend: "Live", trendUp: true, icon: Users },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Good morning, {data?.userName || 'Admin'}! 👋</h2>
          <p className="text-muted mt-1 text-sm">{currentDate} • Restaurant is <span className={data?.restaurantStatus === 'Open' ? 'text-emerald-500 font-medium' : 'text-red-500 font-medium'}>{data?.restaurantStatus || 'Open'}</span></p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition">Download Report</button>
          <Link 
            href="/admin/menu?action=add"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-black hover:bg-amber-500 transition shadow-lg shadow-primary/20"
          >
            + New Item
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, i) => (
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
          <div className="flex items-center justify-between p-6 border-b border-neutral-800">
            <h3 className="font-bold">Live Orders</h3>
            <Link href="/admin/orders" className="text-xs text-primary font-medium hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/30">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">ID</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Table</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Items</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {(data?.liveOrders || []).map((order: any, i: number) => (
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
            {(data?.popularItems || [
              { name: "Steamed Chicken Momo", count: 0, percent: 0 },
              { name: "Dal Bhat Thali", count: 0, percent: 0 },
              { name: "Buff Sekuwa", count: 0, percent: 0 },
              { name: "Thukpa Special", count: 0, percent: 0 },
            ]).map((dish: any, i: number) => (
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
