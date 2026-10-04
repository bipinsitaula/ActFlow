"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

/** Sends signed-out visitors to /login and signed-in ones away from it. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const path = usePathname();
  const router = useRouter();
  const onLogin = path === "/login";

  useEffect(() => {
    if (session === undefined) return;
    if (!session && !onLogin) router.replace("/login");
    if (session && onLogin) router.replace("/dashboard");
  }, [session, onLogin, router]);

  if (session === undefined || (!session && !onLogin) || (session && onLogin)) {
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" aria-busy aria-label="Loading" />;
  }
  return <>{children}</>;
}
