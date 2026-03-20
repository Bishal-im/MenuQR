"use client";

import { useState, useEffect } from "react";
import { Store, MapPin, Phone, Globe, Save, Lock, Bell, Shield, User, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getRestaurantSettings, updateRestaurantSettings } from "@/services/adminService";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/context/NotificationContext";

interface SettingsFormData {
  name: string;
  cuisine: string;
  address: string;
  phone: string;
  website: string;
  ownerName: string;
  email: string;
  isOpen: boolean;
  operatingHours: any;
  notificationPreferences: {
    newOrderAlerts: boolean;
    emailSummaries: boolean;
  };
  securityPreferences: {
    loginNotifications: boolean;
    doubleVerification: boolean;
  };
}

export default function SettingsPage() {
  const { sendTestSummary } = useNotifications();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState<SettingsFormData>({
    name: "",
    cuisine: "",
    address: "",
    phone: "",
    website: "",
    ownerName: "",
    email: "",
    isOpen: true,
    operatingHours: {} as any,
    notificationPreferences: {
      newOrderAlerts: true,
      emailSummaries: true
    },
    securityPreferences: {
      loginNotifications: true,
      doubleVerification: false
    }
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
          email: res.data.email || "",
          isOpen: res.data.isOpen ?? true,
          operatingHours: res.data.operatingHours || {},
          notificationPreferences: res.data.notificationPreferences || {
            newOrderAlerts: true,
            emailSummaries: true
          },
          securityPreferences: res.data.securityPreferences || {
            loginNotifications: true,
            doubleVerification: false
          }
        });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to load settings." });
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await updateRestaurantSettings(formData);
      if (res.success) {
        setMessage({ type: "success", text: "Settings updated successfully!" });
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

  const handleNotificationToggle = (key: string) => {
    setFormData(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: !prev.notificationPreferences[key as keyof typeof prev.notificationPreferences]
      }
    }));
  };

  const handleHourChange = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSecurityToggle = (field: string) => {
    setFormData(prev => ({
      ...prev,
      securityPreferences: {
        ...prev.securityPreferences,
        [field]: !prev.securityPreferences[field as keyof typeof prev.securityPreferences]
      }
    }));
  };

  const convertTo24Hour = (time12h: string) => {
    if (!time12h || time12h.includes('hello')) return "09:00"; // Fallback for invalid data
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString().padStart(2, '0');
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const convertTo12Hour = (time24h: string) => {
    if (!time24h) return "09:00 AM";
    let [hours, minutes] = time24h.split(':');
    let h = parseInt(hours, 10);
    const modifier = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${h.toString().padStart(2, '0')}:${minutes} ${modifier}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-neutral-500 font-medium">Loading settings...</p>
      </div>
    );
  }

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <aside className="flex flex-row overflow-x-auto gap-2 lg:flex-col lg:space-y-1 pb-2 lg:pb-0 no-scrollbar">
          <button 
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all whitespace-nowrap lg:w-full text-left",
              activeTab === "profile" ? "bg-primary/10 text-primary border border-primary/20" : "text-muted hover:bg-white/5"
            )}
          >
            <Store className="h-4 w-4" /> <span className="hidden sm:inline">Restaurant Profile</span><span className="sm:hidden">Profile</span>
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all whitespace-nowrap lg:w-full text-left",
              activeTab === "notifications" ? "bg-primary/10 text-primary border border-primary/20" : "text-muted hover:bg-white/5"
            )}
          >
            <Bell className="h-4 w-4" /> <span className="hidden sm:inline">Notifications</span><span className="sm:hidden">Alerts</span>
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all whitespace-nowrap lg:w-full text-left",
              activeTab === "security" ? "bg-primary/10 text-primary border border-primary/20" : "text-muted hover:bg-white/5"
            )}
          >
            <Shield className="h-4 w-4" /> <span className="hidden sm:inline">Security</span>
          </button>
          <button 
            onClick={() => setActiveTab("account")}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all whitespace-nowrap lg:w-full text-left",
              activeTab === "account" ? "bg-primary/10 text-primary border border-primary/20" : "text-muted hover:bg-white/5"
            )}
          >
            <User className="h-4 w-4" /> <span className="hidden sm:inline">Account</span>
          </button>
        </aside>

        <div className="lg:col-span-2 space-y-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
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

                    <div className="pt-4 flex justify-between items-center bg-background/50 -mx-6 -mb-6 p-6 rounded-b-2xl border-t border-border mt-4">
                       <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${formData.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                          <span className="text-sm font-medium font-bold">{formData.isOpen ? 'Open for Orders' : 'Closed'}</span>
                          <button 
                            type="button" 
                            onClick={() => setFormData(prev => ({ ...prev, isOpen: !prev.isOpen }))}
                            className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline ml-2"
                          >
                            Toggle Status
                          </button>
                       </div>
                       <button 
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-black transition hover:bg-amber-500 shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"
                       >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save Profile
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
                 </div>
                 
                 <div className="space-y-4">
                    {days.map((day) => {
                      const hours = formData.operatingHours[day] || { open: '09:00 AM', close: '10:00 PM', isClosed: false };
                      return (
                        <div key={day} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-3 border-b border-border/50 last:border-0 lowercase">
                           <div className="flex items-center gap-3 sm:w-28">
                              <span className="text-sm font-bold capitalize w-20">{day}</span>
                              <div 
                                onClick={() => handleHourChange(day, 'isClosed', !hours.isClosed)}
                                className={cn(
                                  "w-10 h-5 rounded-full relative cursor-pointer transition-colors",
                                  hours.isClosed ? "bg-red-500/20" : "bg-emerald-500/20"
                                )}
                              >
                                 <div className={cn(
                                   "absolute top-1 w-3 h-3 rounded-full transition-all",
                                   hours.isClosed ? "left-6 bg-red-500" : "left-1 bg-emerald-500"
                                 )} />
                               </div>
                            </div>

                            {!hours.isClosed ? (
                              <div className="flex items-center gap-2">
                                 <input 
                                   type="time" 
                                   value={convertTo24Hour(hours.open)}
                                   onChange={(e) => handleHourChange(day, 'open', convertTo12Hour(e.target.value))}
                                   className="w-32 bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-center font-bold text-emerald-500 [color-scheme:dark]"
                                 />
                                 <span className="text-muted">–</span>
                                 <input 
                                   type="time" 
                                   value={convertTo24Hour(hours.close)}
                                   onChange={(e) => handleHourChange(day, 'close', convertTo12Hour(e.target.value))}
                                   className="w-32 bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-center font-bold text-emerald-500 [color-scheme:dark]"
                                 />
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-red-500 uppercase tracking-widest italic pr-4">Closed for the day</span>
                            )}
                        </div>
                      );
                    })}
                 </div>

                 <div className="pt-6 flex justify-end border-t border-border mt-6">
                    <button 
                      onClick={() => handleSubmit()}
                      disabled={saving}
                      className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-black transition hover:bg-amber-500 shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"
                    >
                       {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                       Update Hours
                    </button>
                 </div>
              </section>
            </div>
          )}

          {activeTab === "notifications" && (
            <section className="rounded-2xl border border-border bg-card p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <h3 className="text-lg font-bold mb-2">Notification Preferences</h3>
               <p className="text-sm text-muted mb-8">Manage how you receive alerts and updates</p>
               
               <div className="space-y-6">
                  {[
                    { id: "newOrderAlerts", title: "New Order Alerts", desc: "Receive sound and visual alerts for incoming orders", icon: Bell },
                    { id: "emailSummaries", title: "Email Summaries", desc: "Get a daily summary of your restaurant's performance", icon: Globe },
                  ].map((item) => {
                    const isActive = formData.notificationPreferences[item.id as keyof typeof formData.notificationPreferences];
                    return (
                      <div key={item.id} className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
                         <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center text-muted">
                               <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                               <p className="text-sm font-bold">{item.title}</p>
                               <p className="text-xs text-muted">{item.desc}</p>
                            </div>
                         </div>
                         <div 
                           onClick={() => handleNotificationToggle(item.id)}
                           className={cn(
                             "w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300",
                             isActive ? "bg-emerald-500/20" : "bg-neutral-800"
                           )}
                         >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 rounded-full transition-all duration-300 shadow-sm",
                              isActive ? "left-7 bg-emerald-500" : "left-1 bg-neutral-500"
                            )} />
                         </div>
                      </div>
                    );
                  })}
               </div>

               <div className="pt-8 flex justify-between items-center border-t border-border mt-8">
                  <button 
                    onClick={async () => {
                      setSaving(true);
                      const res = await sendTestSummary();
                      setSaving(false);
                      if (res.success) {
                        setMessage({ type: "success", text: "Test summary email sent!" });
                        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
                      } else {
                        setMessage({ type: "error", text: res.error || "Failed to send test email." });
                      }
                    }}
                    disabled={saving}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-2 disabled:opacity-50"
                  >
                    <Globe className="h-3 w-3" />
                    Send Test Summary Email
                  </button>
                  <button 
                    onClick={() => handleSubmit()}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-black transition hover:bg-amber-500 shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"
                  >
                     {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                     Update Notifications
                  </button>
               </div>
            </section>
          )}

          {activeTab === "security" && (
            <section className="rounded-2xl border border-border bg-card p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <h3 className="text-lg font-bold mb-2">Security Settings</h3>
               <p className="text-sm text-muted mb-8">Protect your account and restaurant data</p>
               
               <div className="space-y-6">
                  {/* Security Preferences */}
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { 
                        id: 'loginNotifications', 
                        title: 'Login Notifications', 
                        desc: 'Receive an email every time your account is accessed',
                        icon: Bell
                      },
                      { 
                        id: 'doubleVerification', 
                        title: 'Double Verification', 
                        desc: 'Request an extra confirmation code for sensitive changes',
                        icon: Shield
                      }
                    ].map((pref) => (
                      <div key={pref.id} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border group hover:border-primary/30 transition-all">
                        <div className="flex gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <pref.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{pref.title}</p>
                            <p className="text-[10px] text-muted uppercase tracking-tight">{pref.desc}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleSecurityToggle(pref.id)}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                            formData.securityPreferences[pref.id as keyof typeof formData.securityPreferences] ? "bg-primary" : "bg-neutral-800"
                          )}
                        >
                          <span 
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                              formData.securityPreferences[pref.id as keyof typeof formData.securityPreferences] ? "translate-x-6" : "translate-x-1"
                            )} 
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-4">
                     <Lock className="h-6 w-6 text-amber-500 shrink-0" />
                     <div>
                        <p className="text-sm font-bold text-amber-500 uppercase tracking-tighter">Passwordless Access</p>
                        <p className="text-[10px] text-neutral-400 mt-1 uppercase font-bold">Your account uses secure OTP-based login. No passwords required.</p>
                     </div>
                  </div>

                  <div className="space-y-4 pt-4">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-muted">Active Sessions</h4>
                     <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                              <Globe className="h-4 w-4" />
                           </div>
                           <div>
                              <p className="text-sm font-bold">Current Browser</p>
                              <p className="text-[10px] text-muted uppercase">Last active: Just now</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => {
                            window.location.href = '/admin/login'; // Simple mock functional revoke (force log out)
                          }}
                          className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:scale-105 active:scale-95 transition-all"
                        >
                          Revoke
                        </button>
                     </div>
                  </div>
               </div>

               <div className="pt-8 flex justify-end border-t border-border mt-8">
                  <button 
                    onClick={() => handleSubmit()}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-black transition hover:bg-amber-500 shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"
                  >
                     {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                     Update Security Settings
                  </button>
               </div>
            </section>
          )}

          {activeTab === "account" && (
            <section className="rounded-2xl border border-border bg-card p-0 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
               {/* Profile Header */}
               <div className="bg-primary/5 p-8 border-b border-border">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                     <div className="h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-3xl font-black shadow-inner shadow-primary/10">
                        {formData.ownerName ? formData.ownerName[0].toUpperCase() : <User className="h-10 w-10" />}
                     </div>
                     <div className="text-center md:text-left space-y-1">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                           <h3 className="text-xl font-black tracking-tight">{formData.ownerName || "Restaurant Owner"}</h3>
                           <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                              <CheckCircle2 className="h-3 w-3" />
                              Verified
                           </div>
                        </div>
                        <p className="text-sm text-muted font-medium">Administrator • {formData.email}</p>
                     </div>
                  </div>
               </div>

               <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-0.5">Primary Information</h4>
                        <div className="space-y-4">
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold uppercase tracking-wider text-muted ml-1">Account Owner</label>
                              <div className="relative group">
                                 <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
                                 <input 
                                    type="text"
                                    value={formData.ownerName}
                                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                    className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary transition-all hover:border-primary/30"
                                    placeholder="Owner Name"
                                 />
                              </div>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold uppercase tracking-wider text-muted ml-1">Email Address</label>
                              <div className="w-full rounded-xl border border-border bg-background/50 p-3 text-sm font-bold text-neutral-500 flex items-center gap-2 cursor-not-allowed">
                                 <Lock className="h-4 w-4" /> {formData.email || "Linked"}
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-0.5">Account Status</h4>
                        <div className="grid grid-cols-1 gap-4">
                           <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between">
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Status</p>
                                 <p className="text-sm font-bold text-emerald-500">Active</p>
                              </div>
                              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                           </div>
                           <div className="p-4 rounded-xl border border-border bg-background">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Account Type</p>
                              <p className="text-sm font-bold">Standard Owner</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="pt-8 border-t border-border">
                     <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-center md:text-left">
                           <p className="text-sm font-black text-red-500 uppercase tracking-tight">Deactivate Restaurant</p>
                           <p className="text-xs text-muted mt-1 font-medium">Temporarily disable your restaurant from the public listing.</p>
                        </div>
                        <button className="px-6 py-2 rounded-xl border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10">
                           Deactivate
                        </button>
                     </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                     <button 
                       onClick={() => handleSubmit()}
                       disabled={saving}
                       className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-black text-black transition hover:bg-amber-500 shadow-xl shadow-primary/20 disabled:opacity-50 active:scale-95 group"
                     >
                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />}
                        Save Account Settings
                     </button>
                  </div>
               </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
