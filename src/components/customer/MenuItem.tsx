"use client";

import Image from "next/image";
import { MenuItem as MenuItemType } from "@/services/customerService";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, Info } from "lucide-react";

interface MenuItemProps {
  item: MenuItemType;
  onShowDetails: (item: MenuItemType) => void;
}

export default function MenuItem({ item, onShowDetails }: MenuItemProps) {
  const { cart, addToCart, updateQuantity } = useCart();
  const cartItem = cart.find((i) => i.id === item.id);

  return (
    <div className="flex gap-4 p-4 glass rounded-2xl hover:bg-neutral-900/50 transition-all duration-300">
      <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden group">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <button 
          onClick={() => onShowDetails(item)}
          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Info className="text-white w-6 h-6" />
        </button>
      </div>

      <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${item.isVeg ? 'text-green-500' : 'text-red-500'}`}>
              {item.isVeg ? '● Veg' : '▲ Non-Veg'}
            </span>
            <h3 className="text-base font-bold text-white line-clamp-1">{item.name}</h3>
          </div>
          <p className="text-primary font-bold">₹{item.price}</p>
        </div>
        
        <p className="text-xs text-neutral-400 line-clamp-2 mt-1 mb-3 flex-grow">
          {item.description}
        </p>

        <div className="flex justify-end">
          {cartItem ? (
            <div className="flex items-center gap-3 bg-primary/10 rounded-full px-2 py-1 border border-primary/20">
              <button
                onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
                className="p-1 hover:bg-primary/20 rounded-full transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4 text-primary" />
              </button>
              <span className="text-sm font-bold w-4 text-center">{cartItem.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
                className="p-1 hover:bg-primary/20 rounded-full transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4 text-primary" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
                image: item.image,
                isVeg: item.isVeg
              })}
              disabled={!item.isAvailable}
              className="px-4 py-1.5 bg-primary hover:opacity-90 disabled:bg-neutral-700 text-white rounded-full text-sm font-bold transition-all transform active:scale-95 shadow-lg shadow-primary/20"
            >
              {item.isAvailable ? 'Add' : 'Out of Stock'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
