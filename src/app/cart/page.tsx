"use client";

import { useCart } from "@/context/CartContext";
import { createOrder } from "@/services/customerService";
import { ChevronLeft, Trash2, Plus, Minus, ArrowRight, Utensils, ReceiptText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, totalAmount, clearCart, tableId, restaurantId } = useCart();
  const router = useRouter();
  const [isPlacing, setIsPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    
    setIsPlacing(true);
    try {
      const orderData = {
        restaurantId: restaurantId || "default_rid",
        tableId: tableId || "T1",
        items: cart.map(item => ({
          menuItemId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: totalAmount
      };

      const response = await createOrder(orderData);
      if (response.success) {
        // Store orderId for persistent tracking per table/restaurant
        const storageKey = `menuqr_order_${restaurantId || "default_rid"}_${tableId || "T1"}`;
        localStorage.setItem(storageKey, response.orderId);
        
        clearCart();
        router.push(`/order-success?orderId=${response.orderId}&tableId=${tableId || "T1"}&restaurantId=${restaurantId || "default_rid"}`);
      }
    } catch (e) {
      console.error("Order failed", e);
    } finally {
      setIsPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Utensils className="w-10 h-10 text-neutral-700" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Your cart is empty</h2>
        <p className="text-neutral-500 mb-8 max-w-xs">Looks like you haven't added anything to your cart yet.</p>
        <Link 
          href="/menu" 
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <header className="fixed top-0 left-0 right-0 z-30 glass border-b border-neutral-800/50 p-6 flex items-center gap-4">
        <Link href="/menu" className="p-2 bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-black">Your Order</h1>
      </header>

      <main className="pt-28 px-6 space-y-8">
        {/* Table Info */}
        <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-2xl">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-black">
            {tableId || "T"}
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-primary tracking-wider">Ordering for Table</p>
            <p className="text-sm font-bold">Table {tableId || "12"} • The Grand Dhaba</p>
          </div>
        </div>

        {/* Cart Items */}
        <div className="space-y-4">
          <h2 className="text-lg font-black flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-neutral-500" />
            Order Summary
          </h2>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 glass rounded-2xl border border-neutral-800/30">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-primary font-bold mt-0.5">₹{item.price}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-neutral-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-500 font-medium">Subtotal: ₹{item.price * item.quantity}</p>
                    <div className="flex items-center gap-3 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-neutral-800 rounded transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-neutral-800 rounded transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total & Checkout */}
        <div className="space-y-4 pt-4 border-t border-neutral-800/50">
          <div className="flex justify-between items-center px-2">
            <span className="text-neutral-400 font-medium">Item Total</span>
            <span className="font-bold">₹{totalAmount}</span>
          </div>
          <div className="flex justify-between items-center px-2">
            <span className="text-neutral-400 font-medium">Taxes & Fees</span>
            <span className="text-green-500 font-bold">FREE</span>
          </div>
          <div className="flex justify-between items-center px-4 py-5 bg-neutral-900/50 rounded-2xl border border-neutral-800">
            <span className="text-lg font-black">To Pay</span>
            <span className="text-2xl font-black text-primary">₹{totalAmount}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
          <ShieldCheck className="w-5 h-5 text-green-500" />
          <p className="text-xs text-neutral-400 font-medium">Secure order with real-time tracking</p>
        </div>
      </main>

      {/* Place Order Button */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 z-40 bg-gradient-to-t from-black via-black to-transparent">
        <button
          onClick={handlePlaceOrder}
          disabled={isPlacing}
          className="w-full max-w-md mx-auto flex items-center justify-center gap-3 bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-primary/40 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 group"
        >
          {isPlacing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Place Order
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </footer>
    </div>
  );
}
