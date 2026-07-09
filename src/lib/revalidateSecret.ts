// Secreto compartido del endpoint POST /api/revalidate (invalidación del Data
// Cache desde los scripts de carga). Se setea en Vercel (Production, Sensitive)
// y en .env.local. Si falta, el endpoint responde 503 y el caché se refresca
// solo por el timer de 1 hora.
export const revalidateSecret = process.env.REVALIDATE_SECRET
