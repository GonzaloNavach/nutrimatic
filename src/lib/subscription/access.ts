import type { SupabaseClient } from "@supabase/supabase-js";
import {
  hasSubscriptionAccess,
  type Subscription,
  type SubscriptionStatus,
} from "@/lib/subscription/types";

export async function getSubscriptionForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[subscription] getSubscriptionForUser", error.message);
    return null;
  }
  return data as Subscription | null;
}

export async function userHasAccess(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const sub = await getSubscriptionForUser(supabase, userId);
  return hasSubscriptionAccess(sub?.status as SubscriptionStatus | undefined);
}
