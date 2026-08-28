"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { DefaultValues, FieldValues, UseFormReturn } from "react-hook-form"

import {
  clearDraft,
  readDraft,
  writeDraft,
  type QuoteDraft,
} from "./draft-storage"

const SAVE_DEBOUNCE_MS = 500

export function useQuoteDraft<T extends FieldValues>(
  slug: string,
  form: UseFormReturn<T>,
  stepIndex: number
) {
  const [pendingDraft, setPendingDraft] = useState<QuoteDraft | null>(null)
  const [isDecided, setIsDecided] = useState(false)
  const [isSuppressed, setIsSuppressed] = useState(false)
  const stepIndexRef = useRef(stepIndex)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Mise à jour du ref à chaque rendu pour que le ref reflète toujours l'étape actuelle.
  // Cette mutation est intentionnelle : elle ne déclenche pas de re-rendu.
  // eslint-disable-next-line react-hooks/refs
  stepIndexRef.current = stepIndex

  // Lecture unique au montage.
  useEffect(() => {
    const draft = readDraft(slug)
    if (draft) {
      // Initialisation unique d'après un effet asynchrone (stockage local) : pas de
      // cascade de re-rendus. L'effet dépend uniquement de `slug` et ne s'exécute que
      // à mount ou lors du changement de `slug`.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPendingDraft(draft)
    } else {
      setIsDecided(true)
    }
  }, [slug])

  // On n'écrit qu'une fois le bandeau traité : sans cela, le formulaire vide
  // écraserait le brouillon avant que l'utilisateur ait pu le reprendre.
  // `isSuppressed` permet d'arrêter les écritures après clearSavedDraft().
  useEffect(() => {
    if (!isDecided || isSuppressed) {
      return
    }

    // `watch(callback)` évite de re-rendre l'arbre à chaque frappe, au
    // contraire de `watch()` sans argument.
    const subscription = form.watch((values) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        writeDraft(slug, values as Record<string, unknown>, stepIndexRef.current)
      }, SAVE_DEBOUNCE_MS)
    })

    return () => {
      subscription.unsubscribe()
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [form, slug, isDecided, isSuppressed])

  const restoreDraft = useCallback(() => {
    if (!pendingDraft) {
      return 0
    }

    // `reset` attend `DefaultValues<T>` : le brouillon est fusionné sur les
    // valeurs courantes pour que les champs jamais persistés gardent la leur.
    form.reset({
      ...form.getValues(),
      ...pendingDraft.values,
    } as DefaultValues<T>)

    const restoredStep = pendingDraft.stepIndex
    setPendingDraft(null)
    setIsDecided(true)
    return restoredStep
  }, [form, pendingDraft])

  const discardDraft = useCallback(() => {
    clearDraft(slug)
    setPendingDraft(null)
    setIsDecided(true)
  }, [slug])

  const clearSavedDraft = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    clearDraft(slug)
    setIsSuppressed(true)
  }, [slug])

  return { pendingDraft, restoreDraft, discardDraft, clearSavedDraft }
}
