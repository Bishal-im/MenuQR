"use client";

import { useState } from "react";
import { Store, MapPin, Phone, Globe, Save, Lock, Bell, Shield, User } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted">Manage your restaurant profile and application preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <aside className="space-y-1">
          <button className="flex w-full items-center gap-3 rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
            <Store className="h-4 w-4" /> Restaurant Profile
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-muted hover:bg-white/5 transition">
            <Bell className="h-4 w-4" /> Notifications
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-muted hover:bg-white/5 transition">
            <Shield className="h-4 w-4" /> Security
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-muted hover:bg-white/5 transition">
            <User className="h-4 w-4" /> Account
          </button>
        </aside>

        <div className="md:col-span-2 space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
             <h3 className="text-lg font-bold mb-6">General Information</h3>
             <form className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted ml-1">Restaurant Name</label>
                      <input type="text" defaultValue="Momo House" className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none focus:border-primary" />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted ml-1">Cuisine Type</label>
                      <input type="text" defaultValue="Nepali, Newari" className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none focus:border-primary" />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-xs font-bold uppercase tracking-wider text-muted ml-1">Address</label>
                   <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                      <input type="text" defaultValue="Thamel, Kathmandu, Nepal" className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary" />
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted ml-1">Phone Number</label>
                      <div className="relative">
                         <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                         <input type="text" defaultValue="+977 9801234567" className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary" />
                      </div>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted ml-1">Website</label>
                      <div className="relative">
                         <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                         <input type="text" defaultValue="www.momohouse.com.np" className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary" />
                      </div>
                   </div>
                </div>

                <div className="pt-4 flex justify-end">
                   <button className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-black transition hover:bg-amber-500 shadow-lg shadow-primary/20">
                      <Save className="h-4 w-4" /> Save Changes
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
