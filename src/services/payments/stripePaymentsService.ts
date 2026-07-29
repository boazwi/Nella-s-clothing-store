import type { PaymentsService } from "./types";

function buildCheckoutUrl(userId: string, email: string): string {
  const base = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL;
  if (!base) {
    throw new Error(
      "Stripe payment link is not configured. Set NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL.",
    );
  }
  const url = new URL(base);
  url.searchParams.set("client_reference_id", userId);
  url.searchParams.set("prefilled_email", email);
  return url.toString();
}

export const stripePaymentsService: PaymentsService = { buildCheckoutUrl };
