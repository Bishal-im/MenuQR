"use client";

import { WaiterOrder } from "@/services/waiterService";
import { BellRing, X, Check, Bell } from "lucide-react";

interface WaiterCallModalProps {
  order: WaiterOrder | null;
  onAcknowledge: (id: string) => void;
  onDismiss: () => void;
}

export default function WaiterCallModal({ order, onAcknowledge, onDismiss }: WaiterCallModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/10 blur-[80px] pointer-events-none" />
        
        {/* Close Button (X) */}
        <button 
          onClick={onDismiss}
          className="absolute top-6 right-6 p-2 text-neutral-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <BellRing className="w-10 h-10 text-red-500 animate-bounce" />
          </div>

          {/* Text */}
          <h2 className="text-2xl font-black text-white mb-2 leading-tight">Service Requested!</h2>
          <p className="text-neutral-400 text-sm font-medium mb-1">Assistance needed at</p>
          <div className="inline-block border-b-2 border-red-500/50 pb-0.5 mb-8">
            <span className="text-xl font-black text-white italic tracking-tighter">"Table {order.tableId}"</span>
          </div>

          {/* Actions */}
          <div className="w-full space-y-3">
            <button
              onClick={() => onAcknowledge(order.id)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-500/20 active:scale-95 transition-all uppercase tracking-widest text-xs"
            >
              Acknowledge Now
            </button>
            <button
              onClick={onDismiss}
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 font-black py-4 rounded-2xl active:scale-95 transition-all uppercase tracking-widest text-xs"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
