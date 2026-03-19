"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPlatformSettings, updatePlatformSettings, PlatformSettings } from "@/services/superAdminService";
import { 
  Palette, 
  Layout, 
  Type, 
  Image as ImageIcon, 
  Save, 
  RefreshCcw, 
  Eye, 
  Check, 
  Smartphone, 
  Monitor,
  Sparkles,
  Zap,
  Loader2
} from "lucide-react";

export default function BrandingManagement() {
  const router = useRouter();
  const [primaryColor, setPrimaryColor] = useState("#f97316"); // default orange
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getPlatformSettings();
      setPrimaryColor(settings.primaryColor);
      setLoading(false);
    };
    fetchSettings();
  }, []);



  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePlatformSettings({
        primaryColor,
      });
      // Immediately apply the CSS variables to the page
      document.documentElement.style.setProperty("--primary", primaryColor);
      router.refresh();
      alert("Branding settings saved successfully!");
    } catch (error) {
      console.error("Failed to save branding:", error);
      alert("Error saving branding settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    const settings = await getPlatformSettings();
    setPrimaryColor(settings.primaryColor);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className="space-y-10 max-w-7xl mx-auto pb-20"
      style={{ 
        '--primary': primaryColor,
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-3">Branding & UI</h1>
          <p className="text-neutral-500 font-medium">Configure global design system and tenant-level UI themes.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleReset}
            className="flex items-center justify-center gap-2 bg-neutral-900 border border-neutral-800 text-white px-6 py-3.5 rounded-2xl font-black text-xs hover:bg-neutral-800 transition-all"
          >
            <RefreshCcw className="w-4 h-4" /> Reset
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-xs shadow-xl shadow-primary/20 hover:opacity-90 transition-all group disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-8">
          {/* Color Palettes */}
          <div className="glass p-8 rounded-[2.5rem] border border-neutral-800/50">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" /> Primary Design System
            </h3>
            <div className="grid grid-cols-5 gap-4 mb-8">
              {[
                { name: "Orange", hex: "#f97316" },
                { name: "Blue", hex: "#3b82f6" },
                { name: "Green", hex: "#22c55e" },
                { name: "Purple", hex: "#a855f7" },
                { name: "Pink", hex: "#ec4899" },
              ].map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setPrimaryColor(color.hex)}
                  className={`w-full aspect-square rounded-2xl border-2 transition-all flex items-center justify-center ${
                    primaryColor === color.hex ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  {primaryColor === color.hex && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest pl-1">Custom Hex Code</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-black text-white outline-none focus:border-primary transition-all flex-grow"
                />
                <div className="w-12 h-12 rounded-xl border border-neutral-800" style={{ backgroundColor: primaryColor }} />
              </div>
            </div>
          </div>

        </div>

        {/* Live Preview */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass rounded-[3.5rem] border border-neutral-800/50 p-10 h-full min-h-[600px] flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-12">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" /> Live Interface Preview
              </h3>
              <div className="flex p-1.5 bg-neutral-900 rounded-2xl border border-neutral-800">
                <button 
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-2.5 rounded-xl transition-all ${previewDevice === 'mobile' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-neutral-500 hover:text-white'}`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-2.5 rounded-xl transition-all ${previewDevice === 'desktop' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-neutral-500 hover:text-white'}`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Device Mockup */}
            <div className={`relative transition-all duration-700 bg-neutral-950 border-[10px] border-neutral-900 rounded-[3rem] shadow-2xl overflow-hidden ${
              previewDevice === 'mobile' ? 'w-[320px] h-[550px]' : 'w-full h-[550px]'
            }`}>
              {/* Fake Content */}
              <div className="p-6 space-y-8 animate-in fade-in duration-1000">
                <div className="flex justify-between items-center">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: primaryColor }} />
                  <div className="flex gap-2">
                    <div className="w-4 h-4 rounded-full bg-neutral-800" />
                    <div className="w-4 h-4 rounded-full bg-neutral-800" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="h-6 w-3/4 bg-neutral-800 rounded-full" />
                  <div className="h-4 w-full bg-neutral-900 rounded-full" />
                  <div className="h-4 w-5/6 bg-neutral-900 rounded-full" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="aspect-square bg-neutral-900 rounded-3xl border border-neutral-800 flex flex-col p-4 justify-end">
                      <div className="h-2 w-1/2 bg-neutral-800 rounded-full mb-2" />
                      <div className="h-3 w-3/4 rounded-full" style={{ backgroundColor: `${primaryColor}20` }} />
                    </div>
                  ))}
                </div>

                <button 
                  className="w-full py-4 rounded-2xl text-xs font-black text-white shadow-xl shadow-primary/10 transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  CONTINUE ORDER
                </button>
              </div>
              
              {/* Glassmorphism overlays */}
              <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full blur-[80px] opacity-20 pointer-events-none" style={{ backgroundColor: primaryColor }} />
              <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full blur-[80px] opacity-20 pointer-events-none" style={{ backgroundColor: primaryColor }} />
            </div>
            
            <p className="mt-12 text-[10px] text-neutral-500 font-bold uppercase tracking-widest text-center max-w-xs">
              Preview represents the layout and color scheme applied to tenant customer panels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
