"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Client-side route guard. Redirects unauthenticated users to /login (with a
 * `next` param) and, when `requireAdmin` is set, sends non-admins home.
 * Real enforcement will move server-side once a real auth provider exists.
 */
export function RequireAuth({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { session, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (requireAdmin && !isAdmin) {
      router.replace("/");
    }
  }, [loading, session, isAdmin, requireAdmin, router, pathname]);

  if (loading || !session || (requireAdmin && !isAdmin)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return <>{children}</>;
}
