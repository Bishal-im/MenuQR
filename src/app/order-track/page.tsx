"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getOrdersByTable, cancelOrder, callWaiterAlert } from "@/services/customerService";
import { 
  ChevronLeft, 
  Clock, 
  ChefHat, 
  Check, 
  Utensils, 
  Phone, 
  XCircle, 
  Loader2, 
  ShoppingBag,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import CancelConfirmationModal from "@/components/common/CancelConfirmationModal";

type OrderStatus = "pending" | "preparing" | "ready" | "served" | "cancelled" | "accepted" | "completed";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableId = searchParams.get("tableId");
  const restaurantId = searchParams.get("restaurantId");

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [waiterNotified, setWaiterNotified] = useState(false);

  const fetchOrders = async () => {
    if (!tableId || !restaurantId) return;
    try {
      const data = await getOrdersByTable(tableId, restaurantId);
      setOrders(data);
      // Expand the latest order by default if it's new
      if (data.length > 0 && Object.keys(expandedOrders).length === 0) {
        setExpandedOrders({ [data[data.length - 1].id]: true });
      }
    } catch (e) {
      console.error("Failed to fetch orders", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [tableId, restaurantId]);

  const toggleExpand = (id: string) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCancelClick = (orderId: string) => {
    setCancellingOrderId(orderId);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrderId) return;
    const res = await cancelOrder(cancellingOrderId);
    if (res.success) {
      setOrders(prev => prev.filter(o => o.id !== cancellingOrderId));
      setIsCancelModalOpen(false);
    } else {
      alert(res.error || "Failed to cancel order");
    }
    setCancellingOrderId(null);
  };

  const handleCallWaiter = async () => {
    if (orders.length === 0) return;
    setIsCallingWaiter(true);
    const res = await callWaiterAlert(orders[0].id);
    if (res.success) {
      setWaiterNotified(true);
      setTimeout(() => setWaiterNotified(false), 5000);
    }
    setIsCallingWaiter(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tableId || !restaurantId || orders.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-neutral-500" />
        </div>
        <h1 className="text-2xl font-black mb-2">No Active Orders</h1>
        <p className="text-neutral-500 mb-8 max-w-xs">You haven't placed any orders yet or your table has been cleared.</p>
        <Link 
          href={`/menu?tableId=${tableId}&restaurantId=${restaurantId}`}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
          Go to Menu
        </Link>
      </div>
    );
  }

  const grandTotal = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4 text-orange-500" />;
      case "accepted": return <Check className="w-4 h-4 text-blue-500" />;
      case "preparing": return <ChefHat className="w-4 h-4 text-purple-500" />;
      case "ready": return <Utensils className="w-4 h-4 text-green-500" />;
      case "served": 
      case "completed": return <Check className="w-4 h-4 text-green-500" />;
      case "cancelled": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-neutral-500" />;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "Pending";
      case "accepted": return "Accepted";
      case "preparing": return "Preparing";
      case "ready": return "Ready";
      case "served": 
      case "completed": return "Served";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <header className="fixed top-0 left-0 right-0 p-6 pt-12 bg-black/80 backdrop-blur-md z-50 border-b border-neutral-900 flex items-center justify-between">
        <Link href={`/menu?tableId=${tableId}&restaurantId=${restaurantId}`} className="p-2 bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div className="text-center">
          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Track My Orders</p>
          <h1 className="text-sm font-black">Table {tableId}</h1>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="px-6 pt-32 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Active Batches
          </h2>
          <span className="bg-neutral-900 text-neutral-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
          </span>
        </div>

        {orders.map((order) => (
          <div 
            key={order.id} 
            className={`bg-neutral-900/50 border rounded-3xl overflow-hidden transition-all duration-300 ${
              expandedOrders[order.id] ? "border-primary/30 ring-1 ring-primary/20" : "border-neutral-800"
            }`}
          >
            {/* Order Header */}
            <div 
              onClick={() => toggleExpand(order.id)}
              className="p-5 flex items-center justify-between cursor-pointer active:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex flex-col items-center justify-center border border-primary/20">
                  <span className="text-[10px] font-black text-primary/60 uppercase tracking-tighter leading-none">Order</span>
                  <span className="text-lg font-black text-primary leading-none">{order.orderNumber}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black">₹{order.totalAmount}</span>
                    <span className="text-[8px] text-neutral-500">•</span>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-tight">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {getStatusIcon(order.status)}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      order.status === 'pending' ? 'text-orange-500' : 
                      order.status === 'ready' ? 'text-green-500' : 'text-primary'
                    }`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
              </div>
              {expandedOrders[order.id] ? <ChevronUp className="w-5 h-5 text-neutral-600" /> : <ChevronDown className="w-5 h-5 text-neutral-600" />}
            </div>

            {/* Order Details (Expandable) */}
            {expandedOrders[order.id] && (
              <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300">
                <div className="h-[1px] bg-neutral-800 mb-4" />
                <div className="space-y-3">
                  {order.items.map((itemValue: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-800 overflow-hidden border border-neutral-700">
                          {itemValue.image ? (
                            <img src={itemValue.image} alt={itemValue.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Utensils className="w-4 h-4 text-neutral-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-200">{itemValue.name}</p>
                          <p className="text-[10px] text-neutral-500">Qty: {itemValue.quantity} × ₹{itemValue.price}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-neutral-400">₹{itemValue.quantity * itemValue.price}</span>
                    </div>
                  ))}
                </div>

                {order.status === 'pending' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelClick(order.id);
                    }}
                    className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black text-red-500 hover:bg-red-500/20 transition-all uppercase tracking-widest"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel Order {order.orderNumber}
                  </button>
                )}
                
                {order.status === 'ready' && (
                  <div className="mt-6 flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <p className="text-[10px] font-medium text-green-500 italic">Your order is ready! A waiter will bring it shortly.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </main>

      {/* Grand Total Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 pb-10 bg-gradient-to-t from-black via-black to-transparent z-40">
        <div className="bg-neutral-900/90 backdrop-blur-xl p-5 rounded-[2.5rem] border border-neutral-800 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none mb-1">Total Bill Amount</p>
              <p className="text-3xl font-black text-white leading-none">₹{grandTotal}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.2em]">Table {tableId} Active Session</p>
              </div>
            </div>
            
            <button 
              onClick={handleCallWaiter}
              disabled={isCallingWaiter || waiterNotified}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all active:scale-95 ${
                waiterNotified ? "bg-green-500/10 border border-green-500/30 text-green-500" : "bg-neutral-800 border border-neutral-700 text-neutral-400"
              }`}
            >
              {isCallingWaiter ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : waiterNotified ? (
                <Check className="w-5 h-5 mb-1" />
              ) : (
                <Phone className="w-5 h-5 mb-1" />
              )}
              <span className="text-[8px] font-black uppercase tracking-widest">
                {waiterNotified ? "Coming" : "Waiter"}
              </span>
            </button>
          </div>
          
          <Link 
            href={`/menu?tableId=${tableId}&restaurantId=${restaurantId}`}
            className="mt-4 w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            Order More Items
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </footer>

      <CancelConfirmationModal 
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        isLoading={false}
      />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
