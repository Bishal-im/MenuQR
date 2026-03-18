"use client";

import { getOrder } from "@/services/customerService";
import { ChevronLeft, Clock, ChefHat, Check, Utensils, HelpCircle, Phone, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type OrderStatus = "pending" | "preparing" | "ready" | "served";

export default function OrderStatusPage() {
  const { orderId } = useParams();
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (typeof orderId !== 'string') return;
      try {
        const data = await getOrder(orderId);
        setOrderData(data);
        setStatus(data.status as OrderStatus);
      } catch (e) {
        console.error("Failed to fetch order", e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Mock real-time updates
    const timers = [
      setTimeout(() => setStatus("preparing"), 10000),
      setTimeout(() => setStatus("ready"), 25000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [orderId]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const steps = [
    { id: "pending", label: "Confirmed", icon: Check, description: "Your order is in the queue" },
    { id: "preparing", label: "Preparing", icon: ChefHat, description: "Chef is cooking your meal" },
    { id: "ready", label: "Ready", icon: Utensils, description: "Picking up from kitchen" },
    { id: "served", label: "Served", icon: Clock, description: "Enjoy your meal!" },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === status);

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
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/40 relative">
              {status === "pending" && <Check className="w-8 h-8 text-white animate-in zoom-in" />}
              {status === "preparing" && <ChefHat className="w-8 h-8 text-white animate-bounce" />}
              {status === "ready" && <Utensils className="w-8 h-8 text-white animate-pulse" />}
              {status === "served" && <Clock className="w-8 h-8 text-white" />}
              
              <div className="absolute -inset-2 border-2 border-orange-500/30 rounded-full animate-ping opacity-20" />
            </div>
          </div>
          <h2 className="text-3xl font-black">{steps[currentStepIndex].label}</h2>
          <p className="text-neutral-500 font-medium">{steps[currentStepIndex].description}</p>
        </div>

        {/* Progress Timeline */}
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

        {/* Quick Help */}
        <div className="grid grid-cols-2 gap-4 pt-12">
          <button className="flex items-center justify-center gap-2 p-5 glass rounded-[2rem] border border-neutral-800/50 text-xs font-black shadow-lg">
            <Phone className="w-4 h-4 text-orange-500" />
            Call Waiter
          </button>
          <button className="flex items-center justify-center gap-2 p-5 glass rounded-[2rem] border border-neutral-800/50 text-xs font-black shadow-lg">
            <ArrowUpRight className="w-4 h-4 text-orange-500" />
            Order More
          </button>
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
    </div>
  );
}
