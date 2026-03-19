"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SuperAdminSidebar from "@/components/superadmin/Sidebar";
import { Search, Bell, User, Loader2, LogOut } from "lucide-react";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const isLoginPage = pathname === '/superadmin/login';

  useEffect(() => {
    if (!loading && !isLoginPage && (!user || user.role !== 'superadmin')) {
      router.push('/superadmin/login');
    }
  }, [user, loading, router, isLoginPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/superadmin/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (isLoginPage) return <>{children}</>;

  if (loading || !user || user.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex transition-all duration-500">
      <SuperAdminSidebar />
      
      <main className="flex-grow ml-72 min-h-screen flex flex-col relative overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-black/50 backdrop-blur-xl border-b border-neutral-800/50 flex items-center justify-between px-10 sticky top-0 z-40 transition-all">
          <form onSubmit={handleSearch} className="flex items-center gap-4 flex-grow max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search restaurants or help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-neutral-600"
              />
            </div>
          </form>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all group">
              <Bell className="w-5 h-5 group-hover:shake" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-black" />
            </button>
            <div className="h-8 w-[1px] bg-neutral-800" />
            <div className="flex items-center gap-3 pl-2 group">
              <div className="text-right flex flex-col">
                <span className="text-sm font-black text-white group-hover:text-orange-500 transition-colors">{user.name || "Admin Root"}</span>
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Platform Owner</span>
              </div>
              <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-orange-400 rounded-xl flex items-center justify-center text-white border-2 border-neutral-800/50 shadow-xl group-hover:scale-105 transition-all">
                <User className="w-6 h-6" />
              </div>
              <button 
                onClick={() => logout()}
                className="ml-2 p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-10 flex-grow animate-in fade-in duration-700">
          {children}
        </div>

        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      </main>
    </div>
  );
}
