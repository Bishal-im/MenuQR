"use client";

import { useEffect, useState } from "react";
import { getStats, PlatformStats } from "@/services/superAdminService";
import { 
  Store, 
  CreditCard, 
  Users, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Plus, 
  ExternalLink 
} from "lucide-react";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getStats();
      setStats(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const CARDS = [
    { label: "Total Restaurants", value: stats?.totalRestaurants, icon: Store, growth: "+8.2%", color: "orange" },
    { label: "Active Subs", value: stats?.activeSubscriptions, icon: CreditCard, growth: "+12.1%", color: "green" },
    { label: "Monthly Revenue", value: `₹${stats?.monthlyRevenue}`, icon: Zap, growth: "+15.3%", color: "blue" },
    { label: "Total Orders", value: stats?.totalOrders, icon: TrendingUp, growth: "+22.5%", color: "purple" },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-3">Platform Overview</h1>
          <p className="text-neutral-500 font-medium">Welcome back, Super Admin. Here's what's happening today.</p>
        </div>
        <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-orange-500/20 transition-all group">
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          Onboard Restaurant
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CARDS.map((card, i) => (
          <div key={i} className="glass p-8 rounded-[2rem] border border-neutral-800/50 hover:border-orange-500/30 transition-all group relative overflow-hidden h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-4 rounded-2xl bg-neutral-900 border border-neutral-800 group-hover:bg-orange-500/10 transition-colors`}>
                <card.icon className="w-6 h-6 text-orange-500" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-black ${card.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {card.growth.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {card.growth}
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-black uppercase tracking-widest mb-2">{card.label}</p>
              <h3 className="text-3xl font-black text-white leading-none">{card.value}</h3>
            </div>
            {/* Sub decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        {/* Recent Signups */}
        <div className="lg:col-span-2 glass rounded-[2.5rem] border border-neutral-800/50 p-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-black text-white tracking-tight">Recent Signups</h2>
            <button className="text-xs font-black text-orange-500 uppercase tracking-widest hover:text-orange-400 transition-colors flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-3xl hover:bg-neutral-900/50 border border-transparent hover:border-neutral-800/50 transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-neutral-950 rounded-2xl flex items-center justify-center font-black text-lg text-white border border-neutral-800">
                    {i === 0 ? "GD" : i === 1 ? "PP" : "KC"}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight group-hover:text-orange-500 transition-colors">
                      {i === 0 ? "The Grand Dhaba" : i === 1 ? "Pizza Palace" : "King Cuisine"}
                    </h4>
                    <p className="text-xs text-neutral-500 font-medium mt-0.5">Joined 2 days ago • Mumbai, IN</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-black text-white">PRO Plan</p>
                    <p className="text-[10px] text-green-500 font-black uppercase tracking-tighter">Active</p>
                  </div>
                  <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-neutral-400 group-hover:text-orange-500 transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="glass rounded-[2.5rem] border border-neutral-800/50 p-8 flex flex-col justify-between overflow-hidden relative">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight mb-8">System Health</h2>
            <div className="space-y-8">
              {[
                { label: "API Response", value: "45ms", status: "good" },
                { label: "Database Load", value: "12%", status: "good" },
                { label: "Redis Cache", value: "99.9%", status: "good" },
                { label: "Storage Used", value: "4.2 GB", status: "warning" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">{item.label}</span>
                    <span className="text-base font-black text-white">{item.value}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${item.status === 'good' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]'}`} />
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 bg-orange-500 p-6 rounded-3xl relative z-10">
            <p className="text-sm font-black text-white leading-tight">Server Region: Asia South (Mumbai)</p>
            <p className="text-[10px] text-orange-200 mt-1 uppercase font-bold tracking-widest">Active Since 2024</p>
          </div>
          <div className="absolute bottom-[-10%] right-[-10%] w-32 h-32 bg-orange-500 rounded-full blur-[80px] opacity-20" />
        </div>
      </div>
    </div>
  );
}
