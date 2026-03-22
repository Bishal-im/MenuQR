"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Store, User, MapPin, Phone, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { completeSetup } from "@/services/adminService";

export default function AdminSetupPage() {
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    address: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.name || !formData.ownerName || !formData.address || !formData.phone) {
      setError("Please fill out all required fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await completeSetup(formData);
      if (res.success) {
        setSuccess("Setup complete! Redirecting...");
        await refreshUser();
        router.push("/admin/dashboard");
      } else {
        setError(res.error || "Failed to save details.");
      }
    } catch (err: any) {
      setError("An error occurred during setup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/90/5 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-lg z-10">
        <div className="bg-neutral-900/40 backdrop-blur-3xl border border-neutral-800/50 p-10 rounded-[3rem] shadow-2xl relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/20">
            <Store className="w-12 h-12 text-black" />
          </div>

          <div className="text-center mt-8 mb-10">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tighter">
              Complete Setup
            </h1>
            <p className="text-neutral-500 text-sm font-medium">
              Please provide the remaining details for your restaurant.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Restaurant Name"
                className="w-full bg-black/40 border border-neutral-800 focus:border-primary text-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Legal Owner Name"
                className="w-full bg-black/40 border border-neutral-800 focus:border-primary text-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium"
                value={formData.ownerName}
                onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                required
              />
            </div>

            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Full Address"
                className="w-full bg-black/40 border border-neutral-800 focus:border-primary text-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
              />
            </div>

            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Contact Phone Number"
                className="w-full bg-black/40 border border-neutral-800 focus:border-primary text-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-green-500 text-xs font-bold bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                <CheckCircle2 className="w-4 h-4" />
                {success}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white mt-4 text-black hover:bg-neutral-200 disabled:opacity-50 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
