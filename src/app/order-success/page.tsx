"use client";

import { CheckCircle2, ShoppingBag, ArrowRight, Share2, Star } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSummary(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-6 py-12 text-center">
      {/* Success Animation Area */}
      <div className="relative mb-12 flex items-center justify-center">
        <div className="absolute w-40 h-40 bg-primary/20 rounded-full animate-ping" />
        <div className="absolute w-32 h-32 bg-primary/10 rounded-full animate-pulse" />
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center z-10 shadow-2xl shadow-primary/50">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
      </div>

      <div className="space-y-3 mb-12">
        <h1 className="text-4xl font-black tracking-tight animate-in zoom-in-50 duration-500">
          Delicious Choice!
        </h1>
        <p className="text-neutral-400 text-lg font-medium max-w-xs mx-auto animate-in slide-in-from-bottom-2 duration-700">
          Your order has been received and is being sent to the kitchen.
        </p>
      </div>

      {showSummary && (
        <div className="w-full max-w-sm glass p-8 rounded-[2rem] border border-neutral-800/50 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-neutral-800/50">
            <div className="text-left">
              <p className="text-[10px] uppercase font-black text-neutral-500 tracking-widest mb-1">Order ID</p>
              <p className="text-sm font-black text-white">#{orderId?.split('_')[1] || "5K9X2J"}</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-2xl">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-left">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
              <p className="text-sm text-neutral-300 font-medium">Order Confirmed</p>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center">
                <div className="w-2 h-2 bg-neutral-600 rounded-full" />
              </div>
              <p className="text-sm text-neutral-500 font-medium">Chef is starting prep</p>
            </div>
          </div>

          <Link 
            href={`/order-status/${orderId}`}
            className="w-full flex items-center justify-center gap-2 bg-white text-black py-4 rounded-2xl font-black text-sm hover:bg-neutral-200 transition-all active:scale-95 group"
          >
            Track Real-time Status
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-auto">
        <button className="flex items-center justify-center gap-2 p-4 glass rounded-2xl border border-neutral-800/50 text-xs font-bold hover:bg-neutral-900 transition-all active:scale-95">
          <Share2 className="w-4 h-4 text-primary" />
          Share Bill
        </button>
        <button className="flex items-center justify-center gap-2 p-4 glass rounded-2xl border border-neutral-800/50 text-xs font-bold hover:bg-neutral-900 transition-all active:scale-95">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          Rate Food
        </button>
      </div>

      <Link href="/menu" className="mt-8 text-neutral-500 text-xs font-black uppercase tracking-widest hover:text-primary transition-colors pb-8">
        Order More Items
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
