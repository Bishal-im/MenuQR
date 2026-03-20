"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Loader2 } from "lucide-react";
import { SidebarProvider } from "@/context/SidebarContext";
import { NotificationProvider } from "@/context/NotificationContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <NotificationProvider>
      <SidebarProvider>
        <div className="flex h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </NotificationProvider>
  );
}
