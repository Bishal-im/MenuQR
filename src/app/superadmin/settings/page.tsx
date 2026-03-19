"use client";

import { useState, useEffect } from "react";
import { getPlatformSettings, updatePlatformSettings } from "@/services/superAdminService";
import type { PlatformSettings } from "@/services/superAdminService";


import { 
  Settings as SettingsIcon, 
  Globe, 
  ShieldCheck, 
  Bell, 
  Lock, 
  Database, 
  Mail, 
  Check,
  Save,
  ChevronRight,
  Loader2
} from "lucide-react";

export default function PlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getPlatformSettings();
      setSettings(data);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updatePlatformSettings(settings);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Error saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof PlatformSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-4">Platform Settings</h1>
          <p className="text-neutral-500 text-lg font-medium">Configure global platform behavior and system defaults.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-3 bg-white text-black hover:bg-neutral-200 active:scale-95 px-8 py-4 rounded-[2rem] font-black text-sm shadow-2xl transition-all group disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Navigation */}
        <div className="md:col-span-1 space-y-2">
          {[
            { label: "General", icon: Globe, active: true },
            { label: "Security", icon: ShieldCheck },
            { label: "Notifications", icon: Bell },
            { label: "Database", icon: Database },
            { label: "SMTP / Email", icon: Mail },
          ].map((item, i) => (
            <button
              key={i}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${
                item.active 
                  ? "bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/10" 
                  : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-black tracking-tight">{item.label}</span>
              </div>
              {item.active && <div className="w-2 h-2 bg-primary rounded-full" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-8">
          <div className="glass p-10 rounded-[3rem] border border-neutral-800/50 space-y-10">
            {/* Platform Branding */}
            <div>
              <h3 className="text-lg font-black text-white mb-8 border-b border-neutral-800 pb-4">General Platform</h3>
              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest pl-2">SaaS Name</label>
                  <input 
                    type="text" 
                    value={settings.platformName}
                    onChange={(e) => updateSetting('platformName', e.target.value)}
                    className="bg-neutral-950 border border-neutral-900 rounded-2xl px-6 py-4 text-base font-bold text-white outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest pl-2">Platform Fee (%)</label>
                    <input 
                      type="number" 
                      value={settings.platformFee}
                      onChange={(e) => updateSetting('platformFee', parseFloat(e.target.value))}
                      className="bg-neutral-950 border border-neutral-900 rounded-2xl px-6 py-4 text-base font-bold text-white outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest pl-2">System Currency</label>
                    <input 
                      type="text" 
                      value={settings.currency}
                      onChange={(e) => updateSetting('currency', e.target.value)}
                      className="bg-neutral-950 border border-neutral-900 rounded-2xl px-6 py-4 text-base font-bold text-white outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Feature Toggles */}
            <div className="pt-4">
              <h3 className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-8 border-b border-neutral-800 pb-4">Global Feature Toggles</h3>
              <div className="space-y-6">
                {[
                  { label: "New Signups", status: settings.allowNewSignups, desc: "Allow new restaurants to register", key: 'allowNewSignups' },
                  { label: "Beta Branding", status: true, desc: "Enable experimental custom themes", key: null },
                  { label: "Maintenance Mode", status: settings.maintenanceMode, desc: "Platform-wide service stop", key: 'maintenanceMode' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-neutral-950 rounded-[2rem] border border-neutral-900 group hover:border-neutral-800 transition-all">
                    <div>
                      <p className="text-sm font-black text-white tracking-tight">{item.label}</p>
                      <p className="text-[10px] text-neutral-500 font-medium">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => item.key && updateSetting(item.key as any, !item.status)}
                      className={`w-14 h-8 rounded-full relative transition-all duration-500 ${item.status ? 'bg-primary' : 'bg-neutral-800'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 ${item.status ? 'left-7 shadow-lg' : 'left-1'}`} />
                    </button>
                  </div>
                ))}

              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-10 border-2 border-red-500/10 rounded-[3rem] bg-red-500/5 group hover:bg-red-500/10 transition-all">
            <h3 className="text-lg font-black text-red-500 mb-2 flex items-center gap-2">
               <Lock className="w-5 h-5" /> Danger Zone
            </h3>
            <p className="text-xs text-neutral-500 font-medium mb-8">System-level destructive actions. Access is restricted to Platform Owner only.</p>
            <div className="flex flex-col gap-4">
              <button className="flex items-center justify-between px-6 py-4 bg-red-500 text-white rounded-2xl font-black text-xs hover:bg-red-600 transition-all">
                Wipe Staging Data <ChevronRight className="w-4 h-4" />
              </button>
              <button className="flex items-center justify-between px-6 py-4 border border-red-500/20 text-red-500 rounded-2xl font-black text-xs hover:bg-red-500 hover:text-white transition-all">
                Shutdown Platform Services <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
