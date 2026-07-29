"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Client-side route guard. Redirects unauthenticated users to /login (with a
 * `next` param), sends non-admins home when `requireAdmin` is set, and sends
 * unsubscribed users to /payment-required when `requirePaid` is set. This is
 * a UX gate only — the actual security boundary for try-on is the live
 * entitlement check in app/api/try-on/route.ts.
 */
export function RequireAuth({
  children,
  requireAdmin = false,
  requirePaid = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requirePaid?: boolean;
}) {
  const { session, isAdmin, isPaid, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (requireAdmin && !isAdmin) {
      router.replace("/");
    } else if (requirePaid && !isPaid) {
      router.replace("/payment-required");
    }
  }, [loading, session, isAdmin, isPaid, requireAdmin, requirePaid, router, pathname]);

  if (loading || !session || (requireAdmin && !isAdmin) || (requirePaid && !isPaid)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return <>{children}</>;
}
