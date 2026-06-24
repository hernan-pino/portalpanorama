'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { ReportStatus } from '@domain/report/ReportStatus'
import { SuggestionStatus } from '@domain/suggestion/SuggestionStatus'

type ActionResult = { error: string } | { success: true }

async function isAdmin(): Promise<boolean> {
  const session = await auth()
  return Boolean(session?.user) && (session!.user as { role?: string }).role === 'ADMIN'
}

export async function setReportStatusAction(id: unknown, status: unknown): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: 'No autorizado.' }
  const parsed = z
    .object({ id: z.string().min(1), status: z.nativeEnum(ReportStatus) })
    .safeParse({ id, status })
  if (!parsed.success) return { error: 'Datos inválidos.' }
  await container.getSetReportStatusUseCase().execute(parsed.data.id, parsed.data.status)
  revalidatePath('/admin/reportes')
  return { success: true }
}

export async function setSuggestionStatusAction(id: unknown, status: unknown): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: 'No autorizado.' }
  const parsed = z
    .object({ id: z.string().min(1), status: z.nativeEnum(SuggestionStatus) })
    .safeParse({ id, status })
  if (!parsed.success) return { error: 'Datos inválidos.' }
  await container.getSetSuggestionStatusUseCase().execute(parsed.data.id, parsed.data.status)
  revalidatePath('/admin/reportes')
  return { success: true }
}

export async function deleteSuggestionAction(id: unknown): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: 'No autorizado.' }
  const parsed = z.string().min(1).safeParse(id)
  if (!parsed.success) return { error: 'Datos inválidos.' }
  await container.getDeleteSuggestionUseCase().execute(parsed.data)
  revalidatePath('/admin/reportes')
  return { success: true }
}
