export const config = {
  flowPlanId: process.env.FLOW_PLAN_ID ?? 'plan_premium_cl',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
} as const
