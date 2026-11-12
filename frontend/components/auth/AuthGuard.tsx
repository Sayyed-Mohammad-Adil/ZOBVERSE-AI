"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BrandLoader } from "@/components/ui/BrandLoader";
import { clearAuthSession, setAuthSession } from "@/lib/api";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    let active = true;

    queueMicrotask(() => {
      if (!active) return;

      if (!token) {
        clearAuthSession();
        router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }

      setAuthSession(token);
      setAuthorized(true);
      setChecking(false);
    });

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (checking || !authorized) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center">
        <BrandLoader size="lg" label="Verifying agent credentials..." />
      </div>
    );
  }

  return <>{children}</>;
}
