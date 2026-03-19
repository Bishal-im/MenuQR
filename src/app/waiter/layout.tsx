"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { 
  Bell, 
  ChefHat, 
  CheckCircle2, 
  ClipboardList, 
  User, 
  LogOut,
  UtensilsCrossed,
  Loader2,
  Zap
} from "lucide-react";

export default function WaiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'pending';

  const isLoginPage = pathname === '/waiter/login';

  useEffect(() => {
    if (!loading && !isLoginPage && (!user || user.role !== 'waiter')) {
      router.push('/waiter/login');
    }
  }, [user, loading, router, isLoginPage]);

  if (isLoginPage) return <>{children}</>;

  if (loading || !user || user.role !== 'waiter') {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Active Service Alerts (Call Waiter) */}
      <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-2 flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Active Service Calls</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-red-500/20">
            Table 5 <span className="opacity-50 mx-1">•</span> 2m ago
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors underline decoration-red-500/50 underline-offset-4">
            Clear All
          </button>
        </div>
      </div>

      {/* Top Header */}
      <header className="h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight uppercase leading-none">
              {user.restaurantName || "Restaurant Panel"}
            </h1>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">Waiter Panel</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-xs font-black text-white">{user.name}</p>
            <p className="text-[10px] text-green-500 font-bold uppercase">Online</p>
          </div>
          <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center border border-neutral-700 shadow-inner">
            <User className="w-5 h-5 text-neutral-400" />
          </div>
          <button 
            onClick={async () => {
              await logout('waiter');
              router.push("/waiter/login");
            }}
            className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden">
        {children}
      </main>

      {/* Mobile-style bottom nav for quick status filtering on tablets/phones */}
      <div className="h-20 bg-neutral-900 border-t border-neutral-800 grid grid-cols-4 px-4 sticky bottom-0 z-50">
        {[
          { icon: Zap, label: "Home", value: "pending", color: "orange" },
          { icon: ClipboardList, label: "History", value: "history", color: "neutral" },
        ].map((tab, i) => (
          <button 
            key={i} 
            onClick={() => router.push(`/waiter/dashboard?tab=${tab.value}`)}
            className={`flex flex-col items-center justify-center gap-1 group relative ${activeTab === tab.value ? "text-primary scale-110" : "text-neutral-500 hover:text-neutral-400"}`}
          >
            <tab.icon className="w-6 h-6 transition-transform group-active:scale-95" />
            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
