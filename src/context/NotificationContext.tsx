"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

interface NotificationContextType {
  pendingCount: number;
  hasUnread: boolean;
  latestOrderTime: string | null;
  markAsViewed: () => void;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  pendingCount: 0,
  hasUnread: false,
  latestOrderTime: null,
  markAsViewed: () => {},
  refresh: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [latestOrderTime, setLatestOrderTime] = useState<string | null>(null);
  const [lastViewedTime, setLastViewedTime] = useState<string | null>(null);
  const pathname = usePathname();

  // Load lastViewedTime from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("lastViewedOrderTime");
    if (stored) {
      setLastViewedTime(stored);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { getAdminDashboardStats } = await import("@/services/adminService");
      const stats = await getAdminDashboardStats();
      if (stats) {
        setPendingCount(stats.pendingCount ?? 0);
        // Convert Date object to ISO string for comparison if needed
        const orderTime = stats.latestOrderTime ? new Date(stats.latestOrderTime).toISOString() : null;
        setLatestOrderTime(orderTime);
      }
    } catch (error) {
      console.error("[NOTIFICATION CONTEXT] Refresh Error:", error);
    }
  }, []);

  const markAsViewed = useCallback(() => {
    if (latestOrderTime) {
      localStorage.setItem("lastViewedOrderTime", latestOrderTime);
      setLastViewedTime(latestOrderTime);
    }
  }, [latestOrderTime]);

  // Initial fetch and interval
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [refresh]);

  // Automatically mark as viewed if we are on the orders page
  useEffect(() => {
    if (pathname === "/admin/orders" && latestOrderTime) {
      markAsViewed();
    }
  }, [pathname, latestOrderTime, markAsViewed]);

  const hasUnread = Boolean(
    pendingCount > 0 && 
    latestOrderTime && 
    (!lastViewedTime || new Date(latestOrderTime) > new Date(lastViewedTime))
  );

  return (
    <NotificationContext.Provider value={{ 
      pendingCount, 
      hasUnread, 
      latestOrderTime, 
      markAsViewed,
      refresh 
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
