import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/serverAdmin";

/**
 * The only sanctioned path from the client to subscription data — returns
 * just enough for the "why was I logged out" UX on /payment-required, never
 * a direct client-side query against the locked-down subscriptions/payments
 * tables.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const admin = getSupabaseAdminClient();
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { data: sub } = await admin
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", userData.user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub) {
    return NextResponse.json({ status: null, currentPeriodEnd: null });
  }

  return NextResponse.json({
    status: sub.status,
    currentPeriodEnd: sub.current_period_end,
  });
}
