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
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
            className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-xs shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all group"
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
                <TrendingUp className="w-6 h-6 text-primary" /> Revenue Growth
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
                  className={`w-full rounded-t-xl transition-all duration-700 relative overflow-hidden ${i === 5 ? 'bg-primary' : 'bg-neutral-800 group-hover/bar:bg-neutral-700'}`}
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
            <Users className="w-6 h-6 text-primary" /> User Density
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
                    className={`h-full transition-all duration-1000 ${item.color === 'orange' ? 'bg-primary' : 'bg-neutral-700'}`}
                    style={{ width: `${item.percent}%` }}
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
