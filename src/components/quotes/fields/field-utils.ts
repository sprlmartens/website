/**
 * Fonctions pures partagées par les composants de champ. Elles ne dépendent
 * d'aucun contexte React ni du DOM : testables sans infrastructure de test
 * de composants.
 */

/**
 * Lit une erreur au chemin pointé, par exemple « holder.city ».
 *
 * `errors` est typé `unknown` : `FieldErrors<T>` de react-hook-form est un
 * type mappé qui ne s'assigne pas à `Record<string, unknown>`.
 *
 * Le nœud trouvé n'est retourné que s'il s'agit bien d'une feuille d'erreur
 * react-hook-form, c'est-à-dire un objet dont le `message` est absent ou de
 * type `string`. Sans cette vérification, un champ du schéma nommé
 * littéralement « message » ferait croire à tort qu'un nœud intermédiaire
 * est la feuille recherchée (son `message` serait alors lui-même un objet),
 * et `FieldError` tenterait d'afficher cet objet comme enfant React.
 */
export function getFieldError(
  errors: unknown,
  name: string
): { message?: string } | undefined {
  const found = name.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, errors)

  if (!found || typeof found !== "object" || Array.isArray(found)) {
    return undefined
  }

  if (!("message" in found)) {
    return undefined
  }

  const { message } = found as { message?: unknown }

  if (message !== undefined && typeof message !== "string") {
    return undefined
  }

  return found as { message?: string }
}

/**
 * Insère les « / » au fil de la saisie et ignore tout caractère non
 * numérique. Le masque est toujours reconstruit à partir des seuls chiffres
 * saisis (jamais en insérant des séparateurs à une position fixe), ce qui
 * permet à la suppression de fonctionner naturellement en fin de chaîne : on
 * repart des chiffres restants.
 *
 * Ce principe a une limite : supprimer un « / » inséré automatiquement ne
 * retire aucun chiffre, donc le masque se reconstruirait à l'identique et la
 * touche Retour arrière semblerait ne rien faire. Le paramètre `deletion`
 * couvre ce cas : quand la valeur brute raccourcit sans qu'aucun chiffre ne
 * disparaisse, on retire à la place le chiffre qui précède immédiatement le
 * curseur, pour que la suppression progresse toujours.
 */
export function maskDate(
  raw: string,
  deletion?: { previous: string; caret: number }
): string {
  const rawDigits = raw.replace(/\D/g, "").slice(0, 8)

  const digits = (() => {
    if (!deletion) {
      return rawDigits
    }

    const { previous, caret } = deletion
    const previousDigits = previous.replace(/\D/g, "").slice(0, 8)
    const isSeparatorOnlyDeletion =
      raw.length < previous.length && rawDigits.length === previousDigits.length

    if (!isSeparatorOnlyDeletion) {
      return rawDigits
    }

    const digitsBeforeCaret = raw.slice(0, caret).replace(/\D/g, "").length
    return (
      rawDigits.slice(0, Math.max(0, digitsBeforeCaret - 1)) +
      rawDigits.slice(digitsBeforeCaret)
    )
  })()

  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
  return parts.filter(Boolean).join("/")
}
