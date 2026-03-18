"use client";

import { usePathname } from "next/navigation";
import { 
  Bell, 
  ChefHat, 
  CheckCircle2, 
  ClipboardList, 
  User, 
  LogOut,
  UtensilsCrossed 
} from "lucide-react";

export default function WaiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Top Header */}
      <header className="h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight uppercase leading-none">The Grand Dhaba</h1>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">Waiter Panel</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <p className="text-xs font-black text-white">Anil Kumar</p>
            <p className="text-[10px] text-green-500 font-bold uppercase">Online</p>
          </div>
          <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center border border-neutral-700">
            <User className="w-5 h-5 text-neutral-400" />
          </div>
          <button className="p-2 text-neutral-500 hover:text-red-500 transition-colors">
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
          { icon: Bell, label: "New", count: 2, color: "orange" },
          { icon: ChefHat, label: "Active", count: 5, color: "blue" },
          { icon: CheckCircle2, label: "Ready", count: 1, color: "green" },
          { icon: ClipboardList, label: "History", color: "neutral" },
        ].map((tab, i) => (
          <button 
            key={i} 
            className={`flex flex-col items-center justify-center gap-1 group relative ${i === 0 ? "text-orange-500" : "text-neutral-500"}`}
          >
            <tab.icon className="w-6 h-6 transition-transform group-active:scale-95" />
            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            {tab.count !== undefined && (
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
