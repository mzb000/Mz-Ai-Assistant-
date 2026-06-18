"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/chat");
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-2 border-neon-500/30 border-t-neon-500 rounded-full animate-spin" />
    </div>
  );
}
