/**
 * The single integration seam for the paywall (mirrors src/services/auth).
 * Kept minimal: the client only ever needs a URL to send the shopper to
 * Stripe's hosted checkout. Verifying/recording payments happens server-side
 * (the Stripe webhook), never through a client-callable method here.
 */
export interface PaymentsService {
  /**
   * Builds the Stripe Payment Link URL for a given user, appending
   * client_reference_id and prefilled_email so the webhook can correlate the
   * resulting subscription back to this Supabase user.
   */
  buildCheckoutUrl(userId: string, email: string): string;
}
