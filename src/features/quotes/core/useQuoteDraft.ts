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
  const stepIndexRef = useRef(stepIndex)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // eslint-disable-next-line react-hooks/refs
  stepIndexRef.current = stepIndex

  // Lecture unique au montage.
  useEffect(() => {
    const draft = readDraft(slug)
    if (draft) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPendingDraft(draft)
    } else {
      setIsDecided(true)
    }
  }, [slug])

  // On n'écrit qu'une fois le bandeau traité : sans cela, le formulaire vide
  // écraserait le brouillon avant que l'utilisateur ait pu le reprendre.
  useEffect(() => {
    if (!isDecided) {
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
  }, [form, slug, isDecided])

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
  }, [slug])

  return { pendingDraft, restoreDraft, discardDraft, clearSavedDraft }
}
