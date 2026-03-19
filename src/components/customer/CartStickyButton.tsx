"use client";

import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CartStickyButton() {
  const { totalItems, totalAmount } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 px-6 z-40 pointer-events-none">
      <Link 
        href="/cart"
        className="flex items-center justify-between w-full max-w-md mx-auto bg-primary text-white p-4 rounded-2xl shadow-2xl shadow-primary/40 transform transition-all active:scale-95 pointer-events-auto group animate-in slide-in-from-bottom-10"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag className="w-6 h-6 group-hover:bounce" />
            <span className="absolute -top-1 -right-1 bg-white text-primary text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs opacity-90 font-medium">View Cart</span>
            <span className="text-sm font-black">{totalItems} Item{totalItems > 1 ? 's' : ''}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-lg font-black">₹{totalAmount}</span>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-xl">→</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
