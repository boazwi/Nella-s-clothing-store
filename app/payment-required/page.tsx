"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { paymentsService } from "@/services/payments";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

type SubscriptionInfo = { status: string | null; currentPeriodEnd: string | null };

const LAPSED_STATUSES = new Set(["past_due", "unpaid", "canceled", "incomplete_expired"]);

function messageFor(info: SubscriptionInfo | null): string {
  if (!info || !info.status) {
    return "Subscribe for $9.99/month to unlock the AI virtual try-on.";
  }
  if (LAPSED_STATUSES.has(info.status)) {
    return "Your last payment didn't go through. Resubscribe to keep using try-on.";
  }
  return "Subscribe for $9.99/month to unlock the AI virtual try-on.";
}

export default function PaymentRequiredPage() {
  const { session, loading } = useAuth();
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!session?.token) {
      setChecking(false);
      return;
    }
    fetch("/api/me/subscription", {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setInfo(data))
      .finally(() => setChecking(false));
  }, [session?.token]);

  if (loading || checking) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Card className="p-8 text-center">
        <h1 className="mb-2 font-serif text-2xl text-ink">Unlock virtual try-on</h1>
        <p className="mb-6 text-sm text-muted">{messageFor(info)}</p>
        {session ? (
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              window.location.href = paymentsService.buildCheckoutUrl(
                session.user.id,
                session.user.email,
              );
            }}
          >
            Subscribe — $9.99/month
          </Button>
        ) : (
          <Button size="lg" className="w-full" onClick={() => (window.location.href = "/login")}>
            Log in to subscribe
          </Button>
        )}
      </Card>
    </div>
  );
}
