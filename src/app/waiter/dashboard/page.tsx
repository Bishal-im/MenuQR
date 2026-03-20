"use client";

import { useEffect, useState, useRef } from "react";
import { getOrders, updateStatus, resolveWaiterCall, resolveAllServiceCalls, WaiterOrder, OrderStatus } from "@/services/waiterService";
import OrderCard from "@/components/waiter/OrderCard";
import WaiterCallModal from "@/components/waiter/WaiterCallModal";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Bell, 
  ChefHat, 
  Clock, 
  Search, 
  Filter, 
  RefreshCcw,
  Check,
  Zap,
  Volume2,
  Loader2,
  Trash2
} from "lucide-react";

import { Suspense } from "react";

function WaiterDashboardContent() {
  const [orders, setOrders] = useState<WaiterOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all' | 'history'>((searchParams.get('tab') as any) || 'pending');
  const [searchQuery, setSearchQuery] = useState("");
  const [prevOrders, setPrevOrders] = useState<WaiterOrder[]>([]);
  const [currentModalCall, setCurrentModalCall] = useState<WaiterOrder | null>(null);
  const [isAlertMenuOpen, setIsAlertMenuOpen] = useState(false);
  
  const shownCallsRef = useRef<Set<string>>(new Set());
  const prevOrdersRef = useRef<WaiterOrder[]>([]);

  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  const setActiveTabHandler = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`?${params.toString()}`);
    setActiveTab(tab as OrderStatus | 'all' | 'history');
  };

  const fetchOrders = async () => {
    const data = await getOrders();
    
    // Check for new waiter calls using refs to avoid closure issues
    const newCalls = data.filter((order: WaiterOrder) => {
      const prevOrder = prevOrdersRef.current.find((p: WaiterOrder) => p.id === order.id);
      const isNewCall = order.callWaiter && (!prevOrder || !prevOrder.callWaiter);
      const notShownYet = !shownCallsRef.current.has(order.id);
      return isNewCall && notShownYet;
    });

    if (newCalls.length > 0) {
      playAlertSound();
      setCurrentModalCall(newCalls[0]);
      // Mark all incoming new calls as shown
      newCalls.forEach(c => shownCallsRef.current.add(c.id));
    }

    setOrders(data);
    setPrevOrders(data);
    prevOrdersRef.current = data;
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    
    // Polling for new orders/cancellations every 3 seconds
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (id: string, status: OrderStatus) => {
    const success = await updateStatus(id, status);
    if (success) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    }
  };

  const handleResolveCall = async (id: string) => {
    const success = await resolveWaiterCall(id);
    if (success) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, callWaiter: false } : o));
      setPrevOrders(prev => prev.map(o => o.id === id ? { ...o, callWaiter: false } : o));
      prevOrdersRef.current = prevOrdersRef.current.map((o: WaiterOrder) => o.id === id ? { ...o, callWaiter: false } : o);
      // Remove from shown set so it can be re-triggered if called again
      shownCallsRef.current.delete(id);
      if (currentModalCall?.id === id) setCurrentModalCall(null);
    }
  };

  const handleResolveAll = async () => {
    const success = await resolveAllServiceCalls();
    if (success) {
      setOrders(prev => prev.map(o => ({ ...o, callWaiter: false })));
      setPrevOrders(prev => prev.map(o => ({ ...o, callWaiter: false })));
      prevOrdersRef.current = prevOrdersRef.current.map((o: WaiterOrder) => ({ ...o, callWaiter: false }));
      shownCallsRef.current.clear();
      setCurrentModalCall(null);
      setIsAlertMenuOpen(false);
    }
  };

  const activeCalls = orders.filter(o => o.callWaiter);

  const timeAgo = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    return mins > 0 ? `${mins}m ago` : "Just now";
  };

  const filteredOrders = orders.filter(o => {
    let matchesTab = false;
    if (activeTab === 'all') {
      matchesTab = ['pending', 'preparing', 'ready'].includes(o.status);
    } else if (activeTab === 'history') {
      matchesTab = ['completed', 'cancelled'].includes(o.status);
    } else if (activeTab === 'pending') {
      const isRecentCancellation = o.status === 'cancelled' && (Date.now() - new Date(o.updatedAt).getTime()) < 60000;
      matchesTab = o.status === 'pending' || isRecentCancellation;
    } else {
      matchesTab = o.status === activeTab;
    }
    
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Table # or Order ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary"
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
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTabHandler(tab.value as any)}
              className={`flex-grow md:flex-initial px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.value 
                  ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105" 
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {tab.label}
              {tab.value !== 'all' && tab.value !== 'history' && getTabCount(tab.value as OrderStatus) > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-black/30 rounded text-[8px]">{getTabCount(tab.value as OrderStatus)}</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAlertMenuOpen(!isAlertMenuOpen)}
            className={`p-2.5 rounded-xl border transition-all relative ${activeCalls.length > 0 ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-white'}`}
          >
            <Bell className={`w-5 h-5 ${activeCalls.length > 0 ? 'animate-pulse' : ''}`} />
            {activeCalls.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-black">
                {activeCalls.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => { setLoading(true); fetchOrders(); }}
            className="p-2.5 bg-primary/5 text-primary hover:bg-primary/10 rounded-xl border border-primary/10 transition-all flex items-center gap-2 group"
          >
            <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-[10px] font-black uppercase">Refresh</span>
          </button>
        </div>
      </div>

      <WaiterCallModal 
        order={currentModalCall}
        onAcknowledge={(id) => {
          handleResolveCall(id);
          setCurrentModalCall(null);
        }}
        onDismiss={() => setCurrentModalCall(null)}
      />

      {/* Service Call Bar (now toggled by Alert Icon) */}
      {isAlertMenuOpen && activeCalls.length > 0 && (
        <div className="bg-red-950/40 border-b border-red-500/20 px-6 py-3 flex items-center justify-between animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">Active Service Calls</span>
            </div>
            <div className="flex items-center gap-3">
              {activeCalls.map((order) => (
                <div key={order.id} className="bg-red-500 rounded-lg px-3 py-1.5 flex items-center gap-3 shadow-lg shadow-red-500/20">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white uppercase whitespace-nowrap leading-none">Table {order.tableId}</span>
                    <span className="text-[8px] font-bold text-white/70 uppercase tracking-tighter mt-0.5">{timeAgo(order.updatedAt)}</span>
                  </div>
                  <div className="w-[1px] h-4 bg-white/20" />
                  <button 
                    onClick={() => handleResolveCall(order.id)} 
                    className="flex items-center gap-1.5 bg-white text-red-500 px-2 py-1 rounded-md text-[9px] font-black uppercase hover:bg-neutral-100 active:scale-95 transition-all shadow-sm"
                  >
                    <Check className="w-2.5 h-2.5" />
                    Accept
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={handleResolveAll}
            className="ml-4 px-4 py-2 border-b-2 border-transparent hover:border-red-500 text-red-500 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Orders View */}
      <div className="flex-grow p-6 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
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
                onResolveCall={handleResolveCall}
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

export default function WaiterDashboard() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center bg-neutral-950">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    }>
      <WaiterDashboardContent />
    </Suspense>
  );
}
