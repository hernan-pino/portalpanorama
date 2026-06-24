// El ID de medición de GA4. Si no está seteado, analytics queda apagado
// (el componente no renderiza nada). Se enciende solo poniendo NEXT_PUBLIC_GA_ID
// en el entorno (Vercel → Env Vars, Production).
export const gaMeasurementId = process.env.NEXT_PUBLIC_GA_ID
