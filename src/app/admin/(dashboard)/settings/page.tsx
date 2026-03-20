"use client";

import { useState, useEffect } from "react";
import { Store, MapPin, Phone, Globe, Save, Lock, Bell, Shield, User, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getRestaurantSettings, updateRestaurantSettings } from "@/services/adminService";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    name: "",
    cuisine: "",
    address: "",
    phone: "",
    website: "",
    ownerName: "",
    isOpen: true
  });

  useEffect(() => {
    async function loadSettings() {
      const res = await getRestaurantSettings();
      if (res.success && res.data) {
        setFormData({
          name: res.data.name || "",
          cuisine: res.data.cuisine || "",
          address: res.data.address || "",
          phone: res.data.phone || "",
          website: res.data.website || "",
          ownerName: res.data.ownerName || "",
          isOpen: res.data.isOpen ?? true
        });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to load settings." });
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await updateRestaurantSettings(formData);
      if (res.success) {
        setMessage({ type: "success", text: "Settings updated successfully!" });
        // Clear message after 3 seconds
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: res.error || "Failed to update settings." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-neutral-500 font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-sm text-muted">Manage your restaurant profile and application preferences</p>
        </div>
        
        <AnimatePresence>
          {message.text && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <aside className="space-y-1">
          <button className="flex w-full items-center gap-3 rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
            <Store className="h-4 w-4" /> Restaurant Profile
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-muted hover:bg-white/5 transition opacity-50 cursor-not-allowed">
            <Bell className="h-4 w-4" /> Notifications
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-muted hover:bg-white/5 transition opacity-50 cursor-not-allowed">
            <Shield className="h-4 w-4" /> Security
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-muted hover:bg-white/5 transition opacity-50 cursor-not-allowed">
            <User className="h-4 w-4" /> Account
          </button>
        </aside>

        <div className="md:col-span-2 space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
             <h3 className="text-lg font-bold mb-6">General Information</h3>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted ml-1">Restaurant Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none focus:border-primary transition-colors text-white" 
                        placeholder="Restaurant Name"
                        required
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted ml-1">Cuisine Type</label>
                      <input 
                        type="text" 
                        name="cuisine"
                        value={formData.cuisine}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none focus:border-primary transition-colors text-white" 
                        placeholder="e.g. Nepali, Newari, Continental"
                      />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-xs font-bold uppercase tracking-wider text-muted ml-1">Address</label>
                   <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                      <input 
                        type="text" 
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary transition-colors text-white" 
                        placeholder="Full Address"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted ml-1">Phone Number</label>
                      <div className="relative">
                         <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                         <input 
                            type="text" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary transition-colors text-white" 
                            placeholder="Phone Number"
                          />
                      </div>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted ml-1">Website</label>
                      <div className="relative">
                         <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                         <input 
                            type="text" 
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary transition-colors text-white" 
                            placeholder="www.yourrestaurant.com"
                          />
                      </div>
                   </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${formData.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      <span className="text-sm font-medium">{formData.isOpen ? 'Open for Orders' : 'Closed'}</span>
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, isOpen: !prev.isOpen }))}
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline ml-2"
                      >
                        Toggle Status
                      </button>
                   </div>
                   <button 
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-black transition hover:bg-amber-500 shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"
                   >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Changes
                   </button>
                </div>
             </form>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
             <div className="flex items-center justify-between mb-6">
                 <div>
                    <h3 className="text-lg font-bold">Operating Hours</h3>
                    <p className="text-xs text-muted mt-0.5">Define when your restaurant is open for orders</p>
                 </div>
                 <button className="text-xs font-bold text-primary hover:underline">Reset to Default</button>
             </div>
             
             <div className="space-y-3">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <div key={day} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                     <span className="text-sm font-medium">{day}</span>
                     <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">09:00 AM</span>
                        <span className="text-muted">–</span>
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">10:00 PM</span>
                     </div>
                  </div>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
