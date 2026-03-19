"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Menu as MenuIcon, 
  Hash, 
  BarChart3, 
  Settings, 
  LogOut,
  UtensilsCrossed,
  ChevronLeft,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: ShoppingBag, label: "Orders", href: "/admin/orders", badge: 3 },
  { icon: MenuIcon, label: "Menu Management", href: "/admin/menu" },
  { icon: Hash, label: "Tables & QR", href: "/admin/tables" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Users, label: "Staff", href: "/admin/staff" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout('admin');
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside 
      className={cn(
        "relative flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <UtensilsCrossed className="h-5 w-5 text-black" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold tracking-tight whitespace-nowrap">
              MenuQR
            </span>
          )}
        </div>
      </div>

      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted hover:text-foreground shadow-sm"
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
      </button>

      <div className="mt-8 flex flex-col gap-2 px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-white/5 group",
                isActive ? "bg-primary/10 text-primary" : "text-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted group-hover:text-foreground")} />
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-black">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto border-t border-border p-3">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-muted transition hover:bg-red-500/10 hover:text-red-500"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
