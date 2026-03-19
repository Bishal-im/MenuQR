"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Store, 
  CreditCard, 
  Package, 
  Palette, 
  BarChart3, 
  Settings, 
  ChevronRight,
  LogOut,
  ShieldCheck
} from "lucide-react";

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/superadmin/dashboard" },
  { icon: Store, label: "Restaurants", href: "/superadmin/restaurants" },
  { icon: ShieldCheck, label: "Users", href: "/superadmin/users" },
  { icon: Palette, label: "Branding", href: "/superadmin/branding" },
  { icon: BarChart3, label: "Analytics", href: "/superadmin/analytics" },
  { icon: Settings, label: "Settings", href: "/superadmin/settings" },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout('superadmin');
      router.push("/superadmin/login"); // Redirect to superadmin login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="w-72 bg-neutral-900 border-r border-neutral-800 flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">SuperAdmin</h1>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Platform Controls</p>
          </div>
        </div>
      </div>

      <nav className="flex-grow px-4 pb-8 space-y-2 overflow-y-auto mt-4 custom-scrollbar">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? "bg-primary text-white shadow-xl shadow-primary/20" 
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-800">


        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-neutral-400 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-bold">Logout</span>
        </button>
      </div>
    </aside>
  );
}
