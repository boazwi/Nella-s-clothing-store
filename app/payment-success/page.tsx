"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/Spinner";

const POLL_ATTEMPTS = 5;
const POLL_DELAY_MS = 1500;

/**
 * Landing page after a successful Stripe checkout. The webhook that actually
 * grants access runs out-of-band and may not have landed yet, so this polls
 * a session/entitlement refresh a few times before continuing — if it's
 * still not reflected after the poll window, /try-on's own requirePaid gate
 * will correctly bounce back to /payment-required for a quick retry.
 */
export default function PaymentSuccessPage() {
  const { refreshSession, isPaid } = useAuth();
  const router = useRouter();
  const isPaidRef = useRef(isPaid);
  isPaidRef.current = isPaid;

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      for (let i = 0; i < POLL_ATTEMPTS && !cancelled; i++) {
        await refreshSession();
        if (isPaidRef.current) break;
        await new Promise((resolve) => setTimeout(resolve, POLL_DELAY_MS));
      }
      if (!cancelled) router.replace("/try-on");
    }

    poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <Spinner className="h-8 w-8" />
      <p className="text-sm text-muted">Confirming your payment…</p>
    </div>
  );
}
