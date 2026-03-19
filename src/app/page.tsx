"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect all root traffic to the admin login portal
    router.replace("/admin/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-neutral-500 font-medium animate-pulse">Redirecting to Admin Portal...</p>
    </div>
  );
}
