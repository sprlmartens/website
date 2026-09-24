"use client"

import { useEffect, useRef } from "react"

type PendingFocus = { kind: "card"; index: number } | { kind: "add" }

/**
 * Gestion du focus d'une liste de fiches répétables (assurés, sinistres) :
 * une fiche ajoutée reçoit le focus sur son premier champ, et le retrait
 * d'une fiche renvoie le focus au bouton d'ajout, pour qu'il ne se perde pas
 * sur `<body>`.
 *
 * `fields` est le tableau renvoyé par `useFieldArray` : le focus est posé
 * après le rendu qui suit sa mise à jour.
 */
export function useListFocus(fields: readonly unknown[]) {
  const cardRefs = useRef<Array<HTMLFieldSetElement | null>>([])
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const pendingFocus = useRef<PendingFocus | null>(null)

  useEffect(() => {
    const target = pendingFocus.current
    if (target === null) {
      return
    }
    pendingFocus.current = null

    if (target.kind === "card") {
      cardRefs.current[target.index]
        ?.querySelector<HTMLElement>("input")
        ?.focus()
    } else {
      addButtonRef.current?.focus()
    }
  }, [fields])

  return {
    cardRefs,
    addButtonRef,
    /** À appeler juste avant `append`, avec l'index de la future fiche. */
    focusCardNext(index: number) {
      pendingFocus.current = { kind: "card", index }
    },
    /** À appeler juste avant `remove`. */
    focusAddButtonNext() {
      pendingFocus.current = { kind: "add" }
    },
  }
}
