"use client";

import { useEffect, useState } from "react";
import { getAnalytics } from "@/services/superAdminService";
import { 
  TrendingUp, 
  Users, 
  BarChart3, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download,
  Calendar,
  Layers,
  Search,
  Loader2
} from "lucide-react";

export default function PlatformAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAnalytics();
      setAnalyticsData(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleExport = () => {
    if (!analyticsData) return;
    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `platform-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-3">Insights Engine</h1>
          <p className="text-neutral-500 font-medium">Deep data analysis across all tenants and platform subscriptions.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center justify-center gap-2 bg-neutral-900 border border-neutral-800 text-white px-6 py-3.5 rounded-2xl font-black text-xs hover:bg-neutral-800 transition-all">
            <Calendar className="w-4 h-4" /> Last 30 Days
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 bg-orange-500 text-white px-8 py-3.5 rounded-2xl font-black text-xs shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all group"
          >
            <Download className="w-4 h-4" /> Export JSON
          </button>
        </div>

      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Performance */}
        <div className="lg:col-span-2 glass rounded-[3rem] border border-neutral-800/50 p-10 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-orange-500" /> Revenue Growth
              </h3>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">Platform monthly recurring revenue (MRR)</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-white">{analyticsData?.totalOrders || 0}</span>
              <p className="text-[10px] text-green-500 font-black flex items-center gap-1 justify-end mt-1">
                <ArrowUpRight className="w-3 h-3" /> TOTAL ORDERS
              </p>
            </div>

          </div>

          {/* Fake Chart Visualization */}
          <div className="flex items-end justify-between h-48 gap-4 px-4">
            {[40, 65, 45, 80, 55, 95, 75].map((h, i) => (
              <div key={i} className="flex-grow flex flex-col items-center group/bar">
                <div 
                  className={`w-full rounded-t-xl transition-all duration-700 relative overflow-hidden ${i === 5 ? 'bg-orange-500' : 'bg-neutral-800 group-hover/bar:bg-neutral-700'}`}
                  style={{ height: `${h}%` }}
                >
                  {i === 5 && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
                </div>
                <span className="text-[10px] text-neutral-600 font-black mt-4 uppercase">M{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Distribution */}
        <div className="glass rounded-[3rem] border border-neutral-800/50 p-10 flex flex-col group">
          <h3 className="text-xl font-black text-white tracking-tight mb-2 flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-500" /> User Density
          </h3>
          <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-10">Active orders per restaurant</p>
          
          <div className="space-y-10 flex-grow py-4">
            {[
              { label: "Restaurants", count: analyticsData?.totalRestaurants || 0, percent: 100, color: "orange" },
              { label: "Total Users", count: analyticsData?.totalUsers || 0, percent: 80, color: "neutral" },
              { label: "Total Orders", count: analyticsData?.totalOrders || 0, percent: 60, color: "neutral" },
            ].map((item, i) => (
              <div key={i} className="space-y-4">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="text-white uppercase tracking-tight">{item.label}</span>
                  <span className="text-neutral-500">{item.count} TOTAL</span>
                </div>

                <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                  <div 
                    className={`h-full transition-all duration-1000 ${item.color === 'orange' ? 'bg-orange-500' : 'bg-neutral-700'}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-orange-500/5 border border-orange-500/20 rounded-[2rem] text-center">
            <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-1">Top Region</p>
            <p className="text-sm font-bold text-white">Mumbai Central (MH)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {[
          { label: "Conversion Rate", value: "3.2%", icon: BarChart3, color: "blue" },
          { label: "Retention", value: "94%", icon: Layers, color: "green" },
          { label: "Churn Rate", value: "1.5%", icon: PieChart, color: "red" },
          { label: "Search Volume", value: "85K", icon: Search, color: "orange" },
        ].map((item, i) => (
          <div key={i} className="glass p-8 rounded-[2.5rem] border border-neutral-800/50 hover:border-orange-500/30 transition-all flex items-center gap-6">
            <div className={`p-4 rounded-2xl bg-neutral-900 border border-neutral-800 group-hover:bg-orange-500/10`}>
              <item.icon className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-widest mb-1">{item.label}</p>
              <h4 className="text-2xl font-black text-white leading-none">{item.value}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
