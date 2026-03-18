"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login
    setTimeout(() => {
      setLoading(false);
      router.push("/admin/dashboard");
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-2xl border border-border"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <UtensilsCrossed className="h-8 w-8 text-black" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">MenuQR <span className="text-primary text-lg font-medium block opacity-70">Admin Panel</span></h2>
          <p className="mt-2 text-sm text-muted">Log in to manage your restaurant</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="admin@momohouse.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input type="checkbox" className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background" id="remember" />
              <label htmlFor="remember" className="ml-2 text-muted">Remember me</label>
            </div>
            <a href="#" className="font-medium text-primary hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-black transition-all hover:bg-amber-500 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <a href="#" className="font-medium text-primary hover:underline">Register your restaurant</a>
        </p>
      </motion.div>
    </div>
  );
}
