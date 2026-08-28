import { z } from "zod"

/** Numéros belges : +32 ou 0, puis 8 ou 9 chiffres, espaces tolérés. */
export const belgianPhone = /^(\+32|0)[1-9](\s?\d){7,8}$/

const FRENCH_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/

/** Âge maximal admis pour une date de naissance. */
const MAX_AGE_YEARS = 120

/**
 * Convertit « JJ/MM/AAAA » en Date UTC, ou null si le format est invalide ou
 * la date inexistante.
 *
 * `new Date` normalise silencieusement le 31/02 en 03/03 : on compare les
 * composantes de la date obtenue à celles saisies pour rejeter ces valeurs.
 */
export function parseFrenchDate(value: string): Date | null {
  const match = FRENCH_DATE.exec(value.trim())
  if (!match) {
    return null
  }

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? date
    : null
}

/**
 * Minuit UTC du jour courant, pour comparer des dates à la journée.
 *
 * La Belgique étant en UTC+1/+2, une saisie faite entre minuit et 2 h peut
 * être jugée d'un jour trop tolérante — jamais trop stricte.
 */
export function todayUtc(): Date {
  const now = new Date()
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
}

/** Champ texte « JJ/MM/AAAA ». */
export function frenchDate(error = "Date invalide (JJ/MM/AAAA).") {
  return z
    .string()
    .trim()
    .refine((value) => parseFrenchDate(value) !== null, { error })
}

/**
 * Date de naissance : format valide, dans le passé, et pas plus ancienne que
 * 120 ans. Un seul `refine` pour n'afficher qu'un seul message.
 */
export function birthDate(error = "Date de naissance invalide (JJ/MM/AAAA).") {
  return z
    .string()
    .trim()
    .refine((value) => {
      const date = parseFrenchDate(value)
      if (!date) {
        return false
      }

      const today = todayUtc()
      if (date > today) {
        return false
      }

      const oldest = new Date(today)
      oldest.setUTCFullYear(oldest.getUTCFullYear() - MAX_AGE_YEARS)
      return date >= oldest
    }, { error })
}

/**
 * Convertit « 2 500,50 » en 2500.5, ou null si ce n'est pas un montant.
 *
 * Le montant est saisi en texte plutôt qu'en nombre : un `<input>` vide
 * converti en nombre donne `NaN`, et les utilisateurs belges écrivent aussi
 * bien « 2500 » que « 2 500,50 ».
 */
export function parseEuroAmount(value: string): number | null {
  const compact = value.replace(/\s/g, "").replace(",", ".")
  return /^\d{1,7}(\.\d{1,2})?$/.test(compact) ? Number(compact) : null
}

/** Champ texte représentant un montant en euros. */
export function euroAmount(
  error = "Montant invalide (par exemple 2500 ou 2500,50)."
) {
  return z
    .string()
    .trim()
    .refine((value) => parseEuroAmount(value) !== null, { error })
}

/** Formate un montant saisi pour l'affichage : « 2 500,50 € ». */
export function formatEuroAmount(value: string): string {
  const amount = parseEuroAmount(value)
  if (amount === null) {
    return value
  }

  const [whole, decimals] = amount.toFixed(2).split(".")
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${grouped},${decimals} €`
}
