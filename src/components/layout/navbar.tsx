"use client";

import { Bell, Search, User, LogOut, Menu, ChevronRight, ShoppingBag } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import Link from "next/link";

export function Navbar() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toggle } = useSidebar();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic Breadcrumb mapping
  const getBreadcrumb = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return { parent: "Dashboard", child: "Overview" };
    
    // Convert /admin/orders to { parent: "Dashboard", child: "Orders" }
    const labelMap: Record<string, string> = {
      dashboard: "Overview",
      orders: "Orders",
      menu: "Menu Management",
      tables: "Tables & QR",
      analytics: "Analytics",
      staff: "Staff",
      settings: "Settings",
    };

    const lastSegment = segments[segments.length - 1];
    return {
      parent: "Dashboard",
      child: labelMap[lastSegment] || lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
    };
  };

  const breadcrumb = getBreadcrumb();

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout('admin');
    router.push("/admin/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 px-4 md:px-8 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggle}
          className="rounded-lg p-2 hover:bg-white/5 transition text-muted hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-medium text-muted hidden sm:flex items-center gap-2">
          <span className="hover:text-foreground cursor-default transition-colors">{breadcrumb.parent}</span>
          <ChevronRight className="h-3.5 w-3.5 text-border" />
          <span className="text-foreground font-semibold">{breadcrumb.child}</span>
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search orders..."
            className="h-9 w-64 rounded-lg border border-border bg-background px-10 text-xs transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={cn(
              "relative rounded-lg p-2 transition-all duration-200",
              isNotificationsOpen ? "bg-primary/10 text-primary" : "text-muted hover:bg-white/5 hover:text-foreground"
            )}
          >
            <Bell className="h-5 w-5" />
            {pendingCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-black border-2 border-background animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl border border-border bg-card shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in zoom-in duration-200">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                {pendingCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                    {pendingCount} New
                  </span>
                )}
              </div>
              
              <div className="max-h-64 overflow-y-auto py-2">
                {pendingCount > 0 ? (
                  <div 
                    className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-l-2 border-primary"
                    onClick={() => {
                      router.push('/admin/orders');
                      setIsNotificationsOpen(false);
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">New Pending Orders</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          You have {pendingCount} new order{pendingCount > 1 ? 's' : ''} waiting to be accepted.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <div className="h-10 w-10 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">No new notifications</p>
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-border">
                <button 
                  onClick={() => {
                    router.push('/admin/orders');
                    setIsNotificationsOpen(false);
                  }}
                  className="w-full py-2 text-[11px] font-bold text-center text-muted hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
                >
                  VIEW ALL ORDERS
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-3 border-l border-border pl-4 md:pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-foreground line-clamp-1">{user?.name || "Member"}</p>
            <p className="text-[10px] text-muted uppercase tracking-tighter line-clamp-1">{user?.restaurantName || "Restaurant"}</p>
          </div>
          <div className="group relative">
            <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg bg-secondary border border-border shadow-sm overflow-hidden cursor-pointer hover:border-primary/50 transition-colors">
               <User className="h-4 w-4 md:h-5 md:w-5 text-muted" />
            </div>
            
            <div className="absolute right-0 top-full pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2 w-48 shadow-2xl">
                <div className="px-3 py-2 border-b border-neutral-800 mb-1 lg:hidden">
                  <p className="text-xs font-bold text-foreground truncate">{user?.name}</p>
                  <p className="text-[10px] text-muted truncate">{user?.restaurantName}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
