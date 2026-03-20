"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

interface NotificationContextType {
  pendingCount: number;
  hasUnread: boolean;
  latestOrderTime: string | null;
  markAsViewed: () => void;
  refresh: () => Promise<void>;
  sendTestSummary: () => Promise<{ success: boolean; error?: string }>;
}

const NotificationContext = createContext<NotificationContextType>({
  pendingCount: 0,
  hasUnread: false,
  latestOrderTime: null,
  markAsViewed: () => {},
  refresh: async () => {},
  sendTestSummary: async () => ({ success: false, error: "Not initialized" })
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [latestOrderTime, setLatestOrderTime] = useState<string | null>(null);
  const [lastViewedTime, setLastViewedTime] = useState<string | null>(null);
  const [newOrderAlertsEnabled, setNewOrderAlertsEnabled] = useState(true);
  const previousLatestOrderTimeRef = useRef<string | null>(null);
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
        setNewOrderAlertsEnabled(stats.notificationPreferences?.newOrderAlerts !== false);
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

  const playAlertSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }, []);

  const sendTestSummary = useCallback(async () => {
    try {
      const { sendDailySummary } = await import("@/services/adminService");
      return await sendDailySummary();
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

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

  // Sound logic
  useEffect(() => {
    if (newOrderAlertsEnabled && latestOrderTime && latestOrderTime !== previousLatestOrderTimeRef.current) {
      // If it's the first load, don't play sound
      if (previousLatestOrderTimeRef.current !== null) {
        playAlertSound();
      }
      previousLatestOrderTimeRef.current = latestOrderTime;
    }
  }, [latestOrderTime, newOrderAlertsEnabled, playAlertSound]);

  const hasUnread = Boolean(
    newOrderAlertsEnabled &&
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
      refresh,
      sendTestSummary
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
