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
  Users,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const { isOpen, close } = useSidebar();

  useEffect(() => {
    async function fetchBadge() {
       const { getAdminDashboardStats } = await import("@/services/adminService");
       const stats = await getAdminDashboardStats();
       if (stats) setPendingCount(stats.pendingCount ?? 0);
    }
    fetchBadge();
    const interval = setInterval(fetchBadge, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Close sidebar on mobile when navigating
    close();
  }, [pathname]);

  const menuWithBadges = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: ShoppingBag, label: "Orders", href: "/admin/orders", badge: pendingCount > 0 ? pendingCount : undefined },
    { icon: MenuIcon, label: "Menu Management", href: "/admin/menu" },
    { icon: Hash, label: "Tables & QR", href: "/admin/tables" },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
    { icon: Users, label: "Staff", href: "/admin/staff" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  const handleLogout = async () => {
    try {
      await logout('admin');
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out lg:static lg:translate-x-0",
          collapsed ? "w-20" : "w-64",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <UtensilsCrossed className="h-5 w-5 text-black" />
            </div>
            {(!collapsed || isOpen) && (
              <span className="text-xl font-bold tracking-tight whitespace-nowrap">
                MenuQR
              </span>
            )}
          </div>
          <button 
            onClick={close}
            className="rounded-lg p-1 text-muted hover:bg-neutral-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 hidden lg:flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted hover:text-foreground shadow-sm"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>

        <div className="mt-8 flex flex-col gap-2 px-3">
          {menuWithBadges.map((item) => {
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
                {(!collapsed || isOpen) && (
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
            {(!collapsed || isOpen) && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
