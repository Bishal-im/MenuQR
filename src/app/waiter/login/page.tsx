"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  Utensils,
  RefreshCcw,
  ShieldCheck
} from "lucide-react";
import { requestOTP, verifyOTP } from "@/services/authService";

export default function WaiterLoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(0);
  
  const router = useRouter();
  const { user, loading: authLoading, logout, refreshUser } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      if (user.role === 'waiter') {
        router.push('/waiter/dashboard');
      } else {
        setError("This portal is for waiters only.");
        logout();
      }
    }
  }, [user, authLoading, router, logout]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await requestOTP(email);
      if (res.success) {
        setSuccess("Verification code sent to your email!");
        setStep("otp");
        setTimer(120);
      } else {
        setError(res.error || "Failed to send verification code.");
      }
    } catch (err: any) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await requestOTP(email);
      if (res.success) {
        setSuccess("New code sent successfully!");
        setTimer(120);
        setOtp("");
      } else {
        setError(res.error || "Failed to resend code.");
      }
    } catch (err) {
      setError("Failed to resend. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await verifyOTP(email, otp, 'waiter');
      if (res.success && res.user) {
        if (res.user.role !== 'waiter') {
          setError("Access denied: You are not registered as a waiter.");
          await logout();
          return;
        }
        setSuccess("Verified! Accessing waiter panel...");
        await refreshUser();
      } else {
        setError(res.error || "Invalid verification code.");
      }
    } catch (err: any) {
      setError("Verification failed. Please resend code.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/5 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-md z-10">
        <div className="bg-neutral-900/40 backdrop-blur-3xl border border-neutral-800/50 p-10 rounded-[3rem] shadow-2xl relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-orange-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-orange-500/20 -rotate-6">
            <Utensils className="w-12 h-12 text-black rotate-6" />
          </div>

          <div className="text-center mt-8 mb-10">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" /> Staff Protected Area
            </div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">
              Waiter Portal
            </h1>
            <p className="text-neutral-500 text-sm font-medium">
              {step === "email" 
                ? "Enter your staff email to manage orders." 
                : "A secure verification code has been sent to your inbox."}
            </p>
          </div>

          <form onSubmit={step === "email" ? handleEmailSubmit : handleOTPSubmit} className="space-y-4">
            {step === "email" ? (
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  type="email" 
                  placeholder="Staff Email"
                  className="w-full bg-black/40 border border-neutral-800 focus:border-orange-500 text-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            ) : (
              <>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-orange-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Verification Code"
                    className="w-full bg-black/40 border border-neutral-800 focus:border-orange-500 text-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium text-center tracking-[0.5em]"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
                
                <div className="flex items-center justify-between px-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">
                    Expires in: <span className={timer < 30 ? "text-red-500" : "text-orange-500"}>
                      {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                    </span>
                  </p>
                  <button 
                    type="button"
                    onClick={handleResendOTP}
                    disabled={timer > 0 || loading}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 disabled:opacity-30 transition-colors"
                  >
                    <RefreshCcw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                    Resend Code
                  </button>
                </div>
              </>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-green-500 text-xs font-bold bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                <CheckCircle2 className="w-4 h-4" />
                {success}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black hover:bg-neutral-200 disabled:opacity-50 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {step === "email" ? "Get Login Code" : "Login to Panel"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {step === "otp" && (
              <button 
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-neutral-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors py-2"
              >
                Change Email
              </button>
            )}
          </form>

          <div className="mt-10 text-center">
            <p className="text-neutral-600 text-[10px] font-black uppercase tracking-widest">
              Secured by MenuQR Auth System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
