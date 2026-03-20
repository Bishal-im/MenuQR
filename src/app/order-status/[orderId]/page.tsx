"use client";

import { getOrder, cancelOrder, callWaiterAlert, clearWaiterAccepted } from "@/services/customerService";
import { ChevronLeft, Clock, ChefHat, Check, Utensils, HelpCircle, Phone, ArrowUpRight, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CancelConfirmationModal from "@/components/common/CancelConfirmationModal";

type OrderStatus = "pending" | "preparing" | "ready" | "served" | "cancelled" | "accepted" | "completed";

export default function OrderStatusPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [waiterNotified, setWaiterNotified] = useState(false);
  const [waiterAccepted, setWaiterAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (typeof orderId !== 'string') return;
      try {
        const data = await getOrder(orderId as string);
        setOrderData(data);
        setStatus(data.status as OrderStatus);
        setWaiterNotified(!!data.callWaiter);
        setWaiterAccepted(!!data.waiterAccepted);
      } catch (e) {
        console.error("Failed to fetch order", e);
        setError("Failed to fetch order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Poll for status updates every 5 seconds
    const interval = setInterval(fetchOrder, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!orderId || typeof orderId !== 'string') return;
    
    setCancelling(true);
    const res = await cancelOrder(orderId);
    if (res.success) {
      setStatus("cancelled");
      setIsCancelModalOpen(false);
    } else {
      alert(res.error || "Failed to cancel order");
    }
    setCancelling(false);
  };

  const handleCallWaiter = async () => {
    if (!orderId || typeof orderId !== 'string') return;
    
    setIsCallingWaiter(true);
    const res = await callWaiterAlert(orderId);
    if (res.success) {
      setWaiterNotified(true);
      setTimeout(() => setWaiterNotified(false), 5000);
    } else {
      alert("Failed to call waiter. Please try again.");
    }
    setIsCallingWaiter(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const steps = [
    { id: "pending", label: "Confirmed", icon: Check, description: status === 'cancelled' ? "Order was cancelled" : "Your order is in the queue" },
    { id: "accepted", label: "Accepted", icon: Check, description: "Restaurant has accepted your order" },
    { id: "preparing", label: "Preparing", icon: ChefHat, description: "Chef is cooking your meal" },
    { id: "ready", label: "Ready", icon: Utensils, description: "Picking up from kitchen" },
    { id: "completed", label: "Served", icon: Clock, description: "Enjoy your meal!" },
    { id: "served", label: "Served", icon: Clock, description: "Enjoy your meal!" },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === status);
  const currentStep = currentStepIndex !== -1 ? steps[currentStepIndex] : null;

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <header className="p-6 pt-12 flex items-center justify-between">
        <Link href="/menu" className="p-2 bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div className="text-center">
          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Order Tracking</p>
          <h1 className="text-sm font-black">#{orderId?.toString().split('_')[1] || "5K9X2J"}</h1>
        </div>
        <button className="p-2 bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors">
          <HelpCircle className="w-6 h-6 text-neutral-400" />
        </button>
      </header>

      <main className="px-6 space-y-12 mt-12">
        {/* Status Hero */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-orange-500/20 mb-6">
            <div className={`w-16 h-16 ${status === 'cancelled' ? 'bg-red-500' : 'bg-orange-500'} rounded-full flex items-center justify-center shadow-2xl ${status === 'cancelled' ? 'shadow-red-500/40' : 'shadow-orange-500/40'} relative`}>
              {status === "pending" && <Check className="w-8 h-8 text-white animate-in zoom-in" />}
              {status === "accepted" && <Check className="w-8 h-8 text-white animate-in zoom-in" />}
              {status === "preparing" && <ChefHat className="w-8 h-8 text-white animate-bounce" />}
              {status === "ready" && <Utensils className="w-8 h-8 text-white animate-pulse" />}
              {(status === "served" || status === "completed") && <Clock className="w-8 h-8 text-white" />}
              {status === "cancelled" && <XCircle className="w-8 h-8 text-white" />}
              
              {status !== 'cancelled' && (
                <div className="absolute -inset-2 border-2 border-orange-500/30 rounded-full animate-ping opacity-20" />
              )}
            </div>
          </div>
          <h2 className="text-3xl font-black">{status === 'cancelled' ? 'Cancelled' : (currentStep?.label || 'Processing...')}</h2>
          <p className="text-neutral-500 font-medium">{status === 'cancelled' ? 'This order has been cancelled and will not be prepared.' : (currentStep?.description || 'We are updating your order status.')}</p>
        </div>

        {status !== 'cancelled' && (
          <div className="relative pl-8 space-y-12 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-800">
            {steps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const StepIcon = step.icon;

              return (
                <div key={step.id} className="relative group">
                  <div className={`absolute -left-8 top-1.5 w-8 h-8 rounded-full z-10 flex items-center justify-center transition-all duration-500 border-4 border-black ${
                    isCompleted ? "bg-orange-500" : isCurrent ? "bg-orange-500 animate-pulse" : "bg-neutral-900"
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4 text-white" /> : <div className={`w-2 h-2 rounded-full ${isCurrent ? "bg-white" : "bg-neutral-700"}`} />}
                  </div>
                  <div className={`transition-all duration-300 ${isCurrent || isCompleted ? "opacity-100" : "opacity-30"}`}>
                    <h3 className={`text-sm font-black ${isCurrent ? "text-orange-500" : "text-white"}`}>{step.label}</h3>
                    <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-tighter mt-0.5">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* Waiter Acceptance Alert */}
      {waiterAccepted && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-500/10 blur-[80px] pointer-events-none" />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-6 border border-orange-500/20">
                <div className="w-10 h-10 text-orange-500 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-black text-white mb-2 leading-tight">Waiter is Coming!</h2>
              <p className="text-neutral-400 text-sm font-medium mb-8">
                Your request has been accepted. A waiter will be at your table shortly.
              </p>

              <button
                onClick={async () => {
                  if (typeof orderId === 'string') {
                    await clearWaiterAccepted(orderId);
                  }
                  setWaiterAccepted(false);
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black py-4 rounded-2xl shadow-xl shadow-orange-500/20 active:scale-95 transition-all uppercase tracking-widest text-xs"
              >
                Okay, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}

        <div className="grid grid-cols-2 gap-4 pt-12">
          {status === 'pending' ? (
            <button 
              disabled={cancelling}
              onClick={() => setIsCancelModalOpen(true)}
              className="col-span-2 flex items-center justify-center gap-2 p-5 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-xs font-black text-red-500 shadow-lg hover:bg-red-500/20 transition-all uppercase tracking-widest"
            >
              <XCircle className="w-4 h-4" />
              Cancel Order
            </button>
          ) : status === 'cancelled' ? (
            <Link 
              href="/menu"
              className="col-span-2 flex items-center justify-center gap-2 p-5 bg-orange-500 border border-orange-600 rounded-[2rem] text-xs font-black text-black shadow-lg hover:bg-orange-600 transition-all uppercase tracking-widest"
            >
              Back to Menu
            </Link>
          ) : (
            <>
              <button 
                onClick={handleCallWaiter}
                disabled={isCallingWaiter || waiterNotified}
                className={`flex items-center justify-center gap-2 p-5 glass rounded-[2rem] border border-neutral-800/50 text-xs font-black shadow-lg transition-all ${waiterNotified ? "text-green-500 border-green-500/30" : ""}`}
              >
                {isCallingWaiter ? (
                  <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                ) : waiterNotified ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Phone className="w-4 h-4 text-orange-500" />
                )}
                {waiterNotified ? "Called!" : "Call Waiter"}
              </button>
              <Link 
                href={`/menu?tableId=${orderData?.tableId}&restaurantId=${orderData?.restaurantId}`}
                className="flex items-center justify-center gap-2 p-5 glass rounded-[2rem] border border-neutral-800/50 text-xs font-black shadow-lg hover:bg-neutral-900 transition-all active:scale-95"
              >
                <ArrowUpRight className="w-4 h-4 text-orange-500" />
                Order More
              </Link>
            </>
          )}
        </div>
      </main>

      {/* Floating Bill Preview */}
      <footer className="fixed bottom-8 left-6 right-6 z-40">
        <div className="glass p-5 rounded-[2.5rem] border border-neutral-800/50 shadow-2xl flex items-center justify-between">
          <div className="flex -space-x-3 overflow-hidden">
            {orderData?.items?.slice(0, 3).map((item: any, i: number) => (
              <img 
                key={i} 
                src={item.image} 
                className="inline-block h-10 w-10 rounded-full ring-4 ring-neutral-900 object-cover" 
                alt="" 
              />
            ))}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Amount to Pay</p>
            <p className="text-xl font-black text-white">₹{orderData?.totalAmount}</p>
          </div>
        </div>
      </footer>

      <CancelConfirmationModal 
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelOrder}
        isLoading={cancelling}
      />
    </div>
  );
}
