function requireEnv(name: string, devFallback?: string): string {
  const value = process.env[name]
  if (value) return value
  if (process.env.NODE_ENV !== 'production' && devFallback !== undefined) return devFallback
  throw new Error(`Variable de entorno requerida no definida: ${name}`)
}

export const config = {
  flowPlanId: requireEnv('FLOW_PLAN_ID', 'plan_premium_cl'),
  baseUrl: requireEnv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000'),
} as const
