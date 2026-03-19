"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Bell, 
  ChefHat, 
  CheckCircle2, 
  ClipboardList, 
  User, 
  LogOut,
  UtensilsCrossed,
  Loader2
} from "lucide-react";

export default function WaiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Top Header */}
      <header className="h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
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
            onClick={() => logout()}
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
          { icon: Bell, label: "New", count: 0, color: "orange" },
          { icon: ChefHat, label: "Active", count: 0, color: "blue" },
          { icon: CheckCircle2, label: "Ready", count: 0, color: "green" },
          { icon: ClipboardList, label: "History", color: "neutral" },
        ].map((tab, i) => (
          <button 
            key={i} 
            className={`flex flex-col items-center justify-center gap-1 group relative ${i === 0 ? "text-orange-500" : "text-neutral-500"}`}
          >
            <tab.icon className="w-6 h-6 transition-transform group-active:scale-95" />
            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`absolute top-3 right-5 text-[10px] font-black px-1.5 py-0.5 rounded-full text-white ${tab.color === 'orange' ? 'bg-orange-500 shadow-lg shadow-orange-500/30' : 'bg-blue-500'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
