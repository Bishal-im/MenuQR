"use client";

import { WaiterOrder, OrderStatus } from "@/services/waiterService";
import { 
  Clock, 
  MapPin, 
  ChevronRight, 
  Check, 
  ChefHat, 
  Utensils, 
  XCircle,
  AlertCircle
} from "lucide-react";

interface OrderCardProps {
  order: WaiterOrder;
  onStatusUpdate: (id: string, status: OrderStatus) => void;
}

export default function OrderCard({ order, onStatusUpdate }: OrderCardProps) {
  const isNew = order.status === 'pending';
  const isPreparing = order.status === 'preparing';
  const isReady = order.status === 'ready';
  const isHistory = order.status === 'completed' || order.status === 'cancelled';

  const timeAgo = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    return mins > 0 ? `${mins}m ago` : "Just now";
  };

  const getStatusColor = () => {
    switch (order.status) {
      case 'pending': return 'bg-orange-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      case 'completed': return 'bg-neutral-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-neutral-800';
    }
  };

  return (
    <div className={`p-6 rounded-[2rem] border transition-all duration-500 relative overflow-hidden group ${
      isNew 
        ? "bg-orange-500/5 border-orange-500/50 shadow-2xl shadow-orange-500/10 animate-in fade-in" 
        : isHistory 
          ? "bg-neutral-900 border-neutral-800/50 opacity-80"
          : "bg-neutral-900 border-neutral-800 hover:border-neutral-700 shadow-xl"
    }`}>
      {/* Table Badge */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white border-2 border-neutral-800 transition-all ${isNew ? 'bg-orange-500 border-orange-400 scale-105' : 'bg-neutral-950'}`}>
            {order.tableId}
          </div>
          <div>
            <h3 className="text-lg font-black text-white leading-none mb-1">Table {order.tableId}</h3>
            <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest flex items-center gap-1">
              <Clock className="w-3 h-3" /> {timeAgo(order.createdAt)}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${getStatusColor()} bg-opacity-10 border border-opacity-20 ${getStatusColor().replace('bg-', 'border-')}`}>
           <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor()}`} />
           <span className={`text-[10px] font-black uppercase tracking-widest ${getStatusColor().replace('bg-', 'text-')}`}>
             {order.status}
           </span>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4 mb-8">
        <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest border-b border-neutral-800 pb-2">Order Items</p>
        <div className="grid grid-cols-1 gap-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <span className="text-neutral-300 font-medium">
                <span className="text-white font-black">{item.quantity}x</span> {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center mb-10 pt-4 border-t border-neutral-800/50">
        <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Total Amount</p>
        <p className="text-xl font-black text-white leading-none">₹{order.totalAmount}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 relative z-10">
        {isNew && (
          <>
            <button 
              onClick={() => onStatusUpdate(order.id, 'preparing')}
              className="flex-grow flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-orange-500/20 transition-all"
            >
              <Check className="w-5 h-5" /> Accept Order
            </button>
            <button className="p-4 bg-neutral-800 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all">
              <XCircle className="w-6 h-6" />
            </button>
          </>
        )}
        {isPreparing && (
          <button 
            onClick={() => onStatusUpdate(order.id, 'ready')}
            className="flex-grow flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 transition-all"
          >
            <Check className="w-5 h-5" /> Mark Done
          </button>
        )}
        {isReady && (
          <button 
            onClick={() => onStatusUpdate(order.id, 'completed')}
            className="flex-grow flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 active:scale-95 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-green-500/20 transition-all"
          >
            <Check className="w-5 h-5" /> Mark Served
          </button>
        )}
      </div>

      {/* Visual Indicator for Delayed Item */}
      {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000) > 20 && (
        <div className="absolute top-4 right-20 animate-pulse">
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
      )}
    </div>
  );
}
