const DRAFT_VERSION = "v1"

/** Au-delà, le brouillon n'est plus proposé. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Jamais persistés : un consentement RGPD ne se restaure pas silencieusement,
 * et le honeypot n'a de sens que rempli par un robot dans la session courante.
 */
const OMITTED_FIELDS = ["consent", "honeypot"]

export type QuoteDraft = {
  values: Record<string, unknown>
  stepIndex: number
  savedAt: number
}

export function draftKey(slug: string): string {
  return `martens:devis:${slug}:${DRAFT_VERSION}`
}

export function stripOmittedFields(
  values: Record<string, unknown>
): Record<string, unknown> {
  const copy = { ...values }
  for (const field of OMITTED_FIELDS) {
    delete copy[field]
  }
  return copy
}

/**
 * Le brouillon est un confort, pas une exigence : toute défaillance du
 * stockage (navigation privée, site data bloqué, quota) est avalée.
 */
export function readDraft(slug: string, now = Date.now()): QuoteDraft | null {
  try {
    const raw = window.localStorage.getItem(draftKey(slug))
    if (!raw) {
      return null
    }

    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as QuoteDraft).savedAt !== "number" ||
      typeof (parsed as QuoteDraft).stepIndex !== "number" ||
      typeof (parsed as QuoteDraft).values !== "object" ||
      (parsed as QuoteDraft).values === null
    ) {
      return null
    }

    const draft = parsed as QuoteDraft
    return now - draft.savedAt > MAX_AGE_MS ? null : draft
  } catch {
    return null
  }
}

export function writeDraft(
  slug: string,
  values: Record<string, unknown>,
  stepIndex: number,
  now = Date.now()
): void {
  try {
    window.localStorage.setItem(
      draftKey(slug),
      JSON.stringify({
        values: stripOmittedFields(values),
        stepIndex,
        savedAt: now,
      })
    )
  } catch {
    // Stockage indisponible : on continue sans brouillon.
  }
}

export function clearDraft(slug: string): void {
  try {
    window.localStorage.removeItem(draftKey(slug))
  } catch {
    // Voir writeDraft.
  }
}
