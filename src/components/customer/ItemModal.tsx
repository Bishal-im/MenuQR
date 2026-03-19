"use client";

import { MenuItem as MenuItemType } from "@/services/customerService";
import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, ShoppingBag, Leaf, Flame } from "lucide-react";
import { useEffect, useState } from "react";

interface ItemModalProps {
  item: MenuItemType | null;
  onClose: () => void;
}

export default function ItemModal({ item, onClose }: ItemModalProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (item) setQuantity(1);
  }, [item]);

  if (!item) return null;

  const handleAddToCart = () => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity,
      image: item.image,
      isVeg: item.isVeg,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-lg bg-neutral-900 rounded-t-[2.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-72 sm:h-80 w-full">
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover"
          />
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="absolute bottom-6 left-6 flex gap-2">
            {item.isVeg ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/90 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-tighter shadow-lg">
                <Leaf className="w-3 h-3" /> Veg
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/90 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-tighter shadow-lg">
                <Flame className="w-3 h-3" /> Non-Veg
              </span>
            )}
            {item.isPopular && (
              <span className="px-3 py-1 bg-primary/90 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-tighter shadow-lg">
                🔥 Popular
              </span>
            )}
          </div>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-black text-white">{item.name}</h2>
            <p className="text-2xl font-black text-primary">₹{item.price}</p>
          </div>
          
          <p className="text-neutral-400 leading-relaxed mb-8">
            {item.description}
          </p>

          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center bg-neutral-800 rounded-2xl p-1 border border-neutral-700">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="p-3 hover:bg-neutral-700 rounded-xl transition-colors"
                aria-label="Decrease"
              >
                <Minus className="w-5 h-5 text-white" />
              </button>
              <span className="w-12 text-center text-lg font-bold text-white">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="p-3 hover:bg-neutral-700 rounded-xl transition-colors"
                aria-label="Increase"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              className="flex-grow flex items-center justify-center gap-3 bg-primary hover:opacity-90 active:scale-95 text-white py-4 px-6 rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary/20"
            >
              <ShoppingBag className="w-6 h-6" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
