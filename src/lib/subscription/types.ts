export type SubscriptionStatus =
  | "inactive"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: SubscriptionStatus;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

/** Estados que permiten usar la app. */
export const ACCESS_STATUSES: ReadonlySet<SubscriptionStatus> = new Set([
  "active",
  "trialing",
]);

export function hasSubscriptionAccess(
  status: SubscriptionStatus | null | undefined
): boolean {
  if (!status) return false;
  return ACCESS_STATUSES.has(status);
}
