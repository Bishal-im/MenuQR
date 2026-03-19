"use client";

import { useState } from "react";
import { X, Loader2, Store, User, Mail, Phone, MapPin, Globe } from "lucide-react";
import { createRestaurant, Restaurant } from "@/services/superAdminService";

interface RestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RestaurantModal({ isOpen, onClose, onSuccess }: RestaurantModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Restaurant, "id" | "createdAt">>({
    name: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createRestaurant(formData);
      if (res.success) {
        onSuccess();
        onClose();
        setFormData({
          name: "",
          ownerName: "",
          email: "",
          phone: "",
          address: "",
          status: "active",
        });
      }
    } catch (error) {
      console.error("Failed to create restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Store className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Add New Restaurant</h2>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">Register a new partner</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-white transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Restaurant Info */}
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Restaurant Details</label>
              <div className="relative group">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Restaurant Name"
                  required
                  className="w-full bg-black/50 border border-neutral-800 focus:border-orange-500 text-white rounded-xl py-3 pl-12 pr-4 outline-none transition-all text-sm font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Full Address"
                  required
                  className="w-full bg-black/50 border border-neutral-800 focus:border-orange-500 text-white rounded-xl py-3 pl-12 pr-4 outline-none transition-all text-sm font-medium"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>

            {/* Owner Info */}
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Owner Information (Whitelist)</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Legal Owner Name"
                  required
                  className="w-full bg-black/50 border border-neutral-800 focus:border-orange-500 text-white rounded-xl py-3 pl-12 pr-4 outline-none transition-all text-sm font-medium"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                />
              </div>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  type="email" 
                  placeholder="Authorized Login Email"
                  required
                  className="w-full bg-black/50 border border-neutral-800 focus:border-orange-500 text-white rounded-xl py-3 pl-12 pr-4 outline-none transition-all text-sm font-medium"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Contact Phone Number"
                  required
                  className="w-full bg-black/50 border border-neutral-800 focus:border-orange-500 text-white rounded-xl py-3 pl-12 pr-4 outline-none transition-all text-sm font-medium"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-800 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 border border-neutral-800 text-neutral-400 font-black text-xs uppercase tracking-widest hover:text-white hover:bg-neutral-800 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-neutral-200 rounded-xl transition-all flex items-center gap-2 shadow-xl active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
