"use client";

import { Bell, Search, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout('admin');
    router.push("/admin/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 px-8 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-medium text-muted">
          Dashboard <span className="mx-2 text-border">/</span> <span className="text-foreground">Overview</span>
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search orders..."
            className="h-9 w-64 rounded-lg border border-border bg-background px-10 text-xs transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button className="relative rounded-lg p-2 hover:bg-white/5 transition text-muted hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary border-2 border-card"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-border pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-foreground">{user?.name || "Member"}</p>
            <p className="text-[10px] text-muted uppercase tracking-tighter">{user?.restaurantName || "Restaurant"}</p>
          </div>
          <div className="group relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary border border-border shadow-sm overflow-hidden cursor-pointer hover:border-primary/50 transition-colors">
               <User className="h-5 w-5 text-muted" />
            </div>
            
            {/* Simple dropdown on hover (can be improved with a real dropdown component) */}
            <div className="absolute right-0 top-full pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2 w-48 shadow-2xl">
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
