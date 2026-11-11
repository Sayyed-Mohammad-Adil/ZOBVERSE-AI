"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BrandLoader } from "@/components/ui/BrandLoader";

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

    if (!token) {
      // Also ensure cookie is cleared
      document.cookie = "oj_session=; path=/; max-age=0; SameSite=Lax";
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    } else {
      // Ensure cookie is in sync with localStorage token
      const cookieExists = document.cookie
        .split(";")
        .some((c) => c.trim().startsWith("oj_session="));

      if (!cookieExists) {
        document.cookie = `oj_session=${token}; path=/; max-age=604800; SameSite=Lax`;
      }

      setAuthorized(true);
      setChecking(false);
    }
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
