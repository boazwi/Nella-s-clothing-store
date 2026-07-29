import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/serverAdmin";
import { revokeSessions } from "@/lib/supabase/revokeSessions";

export const runtime = "nodejs"; // needs raw body access for signature verification

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const ref = invoice.parent?.subscription_details?.subscription;
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}

/**
 * Handles Stripe's subscription lifecycle. This is the source of truth for
 * entitlement: it upserts `subscriptions`, appends an audit row to
 * `payments`, and mirrors status onto app_metadata (UX only — the real
 * enforcement is the live DB read in app/api/try-on/route.ts).
 */
export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!webhookSecret || !stripeSecretKey) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  // Must be the raw body — Stripe's signature is computed over the exact bytes.
  const rawBody = await req.text();

  const stripe = new Stripe(stripeSecretKey);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();

  async function recordPayment(input: {
    subscriptionRowId: string | null;
    userId: string;
    stripeInvoiceId: string | null;
    amountCents: number | null;
    currency: string | null;
    status: "succeeded" | "failed";
  }) {
    // Idempotent on stripe_event_id: Stripe can redeliver the same event.
    await admin.from("payments").insert({
      subscription_id: input.subscriptionRowId,
      user_id: input.userId,
      stripe_event_id: event.id,
      stripe_invoice_id: input.stripeInvoiceId,
      stripe_event_type: event.type,
      amount_cents: input.amountCents,
      currency: input.currency,
      status: input.status,
    });
    // Ignoring the unique-violation error case here is intentional: a
    // redelivered event should not produce a duplicate audit row, and any
    // other insert failure isn't worth failing the whole webhook over since
    // the subscriptions table (checked below) is what actually gates access.
  }

  async function upsertSubscriptionRow(
    userId: string,
    stripeCustomerId: string,
    sub: Stripe.Subscription,
  ) {
    const { data, error } = await admin
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: sub.id,
          status: sub.status,
          current_period_end: sub.items.data[0]?.current_period_end
            ? new Date(sub.items.data[0].current_period_end * 1000).toISOString()
            : null,
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "stripe_subscription_id" },
      )
      .select("id")
      .single();
    if (error) throw error;
    return data.id as string;
  }

  async function syncEntitlement(userId: string, status: Stripe.Subscription.Status) {
    const isPaid = ACTIVE_STATUSES.has(status);
    await admin.auth.admin.updateUserById(userId, {
      app_metadata: { paid: isPaid, subscription_status: status },
    });
    if (!isPaid) {
      await revokeSessions(userId);
    }
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break; // defensive; this Payment Link is subscription-only

      const userId = session.client_reference_id;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      if (!userId || !subscriptionId || !customerId) break;

      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const rowId = await upsertSubscriptionRow(userId, customerId, sub);
      await syncEntitlement(userId, sub.status);
      await recordPayment({
        subscriptionRowId: rowId,
        userId,
        stripeInvoiceId: null,
        amountCents: session.amount_total,
        currency: session.currency,
        status: "succeeded",
      });
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = subscriptionIdFromInvoice(invoice);
      if (!subscriptionId) break;

      const { data: existing } = await admin
        .from("subscriptions")
        .select("id, user_id")
        .eq("stripe_subscription_id", subscriptionId)
        .maybeSingle();
      if (!existing) break;

      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      await upsertSubscriptionRow(existing.user_id, sub.customer as string, sub);
      await syncEntitlement(existing.user_id, sub.status);
      await recordPayment({
        subscriptionRowId: existing.id,
        userId: existing.user_id,
        stripeInvoiceId: invoice.id ?? null,
        amountCents: invoice.amount_paid,
        currency: invoice.currency,
        status: "succeeded",
      });
      break;
    }

    case "invoice.payment_failed": {
      // Record the failure only — do not revoke access here. Stripe's own
      // subscription status (surfaced via customer.subscription.updated) is
      // the authoritative signal for revocation, since a single failed
      // invoice can be a transient decline that Smart Retries recover while
      // the subscription still reads "active".
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = subscriptionIdFromInvoice(invoice);
      if (!subscriptionId) break;

      const { data: existing } = await admin
        .from("subscriptions")
        .select("id, user_id")
        .eq("stripe_subscription_id", subscriptionId)
        .maybeSingle();
      if (!existing) break;

      await recordPayment({
        subscriptionRowId: existing.id,
        userId: existing.user_id,
        stripeInvoiceId: invoice.id ?? null,
        amountCents: invoice.amount_due,
        currency: invoice.currency,
        status: "failed",
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const { data: existing } = await admin
        .from("subscriptions")
        .select("id, user_id")
        .eq("stripe_subscription_id", sub.id)
        .maybeSingle();
      if (!existing) break;

      await upsertSubscriptionRow(existing.user_id, sub.customer as string, sub);
      await syncEntitlement(existing.user_id, sub.status);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const { data: existing } = await admin
        .from("subscriptions")
        .select("id, user_id")
        .eq("stripe_subscription_id", sub.id)
        .maybeSingle();
      if (!existing) break;

      await admin
        .from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      await syncEntitlement(existing.user_id, "canceled");
      break;
    }

    default:
      break;
  }

  // Always ack quickly with 200 — Stripe retries on non-2xx, which we only
  // want for genuine transient failures, not for events we deliberately skip.
  return NextResponse.json({ received: true });
}
