"use client";

import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function Provider({ children }: { children: ReactNode }) {
  const { loadFromStorage } = useAuth();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return <>{children}</>;
}
