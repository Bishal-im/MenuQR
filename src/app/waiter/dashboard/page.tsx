"use client";

import { useEffect, useState } from "react";
import { waiterService, WaiterOrder, OrderStatus } from "@/services/waiterService";
import OrderCard from "@/components/waiter/OrderCard";
import { 
  Bell, 
  ChefHat, 
  Clock, 
  Search, 
  Filter, 
  RefreshCcw,
  Zap,
  Volume2
} from "lucide-react";

export default function WaiterDashboard() {
  const [orders, setOrders] = useState<WaiterOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async () => {
    const data = await waiterService.getOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to new orders simulation
    const unsubscribe = waiterService.subscribeToNewOrders((newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
      // In a real app, play sound here
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (id: string, status: OrderStatus) => {
    const success = await waiterService.updateStatus(id, status);
    if (success) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesTab = activeTab === 'all' || o.status === activeTab;
    const matchesSearch = o.tableId.includes(searchQuery) || o.id.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const getTabCount = (status: OrderStatus) => orders.filter(o => o.status === status).length;

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden bg-neutral-950">
      {/* Operational Header */}
      <div className="p-6 bg-neutral-900/50 border-b border-neutral-800 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-orange-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Table # or Order ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <button className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 hover:text-white transition-all">
            <Filter className="w-5 h-5 transition-transform active:rotate-180" />
          </button>
        </div>

        <div className="flex gap-2 w-full md:w-auto p-1 bg-black/50 rounded-2xl border border-neutral-800 overflow-x-auto no-scrollbar">
          {[
            { label: "New", value: 'pending', color: 'orange' },
            { label: "Prep", value: 'preparing', color: 'blue' },
            { label: "Ready", value: 'ready', color: 'green' },
            { label: "All", value: 'all', color: 'neutral' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={`flex-grow md:flex-initial px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.value 
                  ? "bg-orange-500 text-white shadow-xl shadow-orange-500/20 scale-105" 
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {tab.label}
              {tab.value !== 'all' && getTabCount(tab.value as OrderStatus) > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-black/30 rounded text-[8px]">{getTabCount(tab.value as OrderStatus)}</span>
              )}
            </button>
          ))}
        </div>

        <button 
          onClick={() => { setLoading(true); fetchOrders(); }}
          className="p-2.5 bg-orange-500/5 text-orange-500 hover:bg-orange-500/10 rounded-xl border border-orange-500/10 transition-all flex items-center gap-2 group"
        >
          <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-[10px] font-black uppercase">Refresh</span>
        </button>
      </div>

      {/* Orders View */}
      <div className="flex-grow p-6 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-80 glass rounded-[2rem] border border-neutral-800/50 animate-pulse" />)}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onStatusUpdate={handleStatusUpdate} 
              />
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
            <Zap className="w-16 h-16 text-neutral-800 mb-6" />
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Everything Clear!</h3>
            <p className="text-sm font-medium text-neutral-500 mt-2">No {activeTab} orders at the moment.</p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <footer className="h-10 bg-neutral-900 border-t border-neutral-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Network Connected</span>
          </div>
          <div className="w-[1px] h-4 bg-neutral-800" />
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Alerts ON</span>
          </div>
        </div>
        <p className="text-[10px] text-neutral-600 font-black tracking-widest uppercase">Sync: Just Now</p>
      </footer>
    </div>
  );
}
