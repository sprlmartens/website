import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  clearDraft,
  draftKey,
  readDraft,
  stripOmittedFields,
  writeDraft,
} from "@/features/quotes/core/draft-storage"

/** localStorage minimal, suffisant pour ces fonctions. */
function createStorage(): Storage {
  const store = new Map<string, string>()
  return {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => void store.delete(key),
    setItem: (key: string, value: string) => void store.set(key, value),
  }
}

beforeEach(() => {
  vi.stubGlobal("window", { localStorage: createStorage() })
})

describe("stripOmittedFields", () => {
  it("retire le consentement et le honeypot", () => {
    expect(
      stripOmittedFields({ email: "a@b.be", consent: true, honeypot: "x" })
    ).toEqual({ email: "a@b.be" })
  })
})

describe("writeDraft / readDraft", () => {
  it("relit ce qui vient d'être écrit", () => {
    writeDraft("assistance-voyage", { email: "a@b.be" }, 2, 1_000)
    expect(readDraft("assistance-voyage", 1_000)).toEqual({
      values: { email: "a@b.be" },
      stepIndex: 2,
      savedAt: 1_000,
    })
  })

  it("ne persiste jamais le consentement", () => {
    writeDraft("assistance-voyage", { consent: true }, 0, 1_000)
    expect(readDraft("assistance-voyage", 1_000)?.values).toEqual({})
  })

  it("renvoie null en l'absence de brouillon", () => {
    expect(readDraft("assistance-voyage")).toBeNull()
  })

  it("ignore un brouillon de plus de sept jours", () => {
    const eightDays = 8 * 24 * 60 * 60 * 1000
    writeDraft("assistance-voyage", { email: "a@b.be" }, 0, 0)
    expect(readDraft("assistance-voyage", eightDays)).toBeNull()
  })

  it("ignore un contenu corrompu au lieu de lever", () => {
    window.localStorage.setItem(draftKey("assistance-voyage"), "{pas du json")
    expect(readDraft("assistance-voyage")).toBeNull()
  })

  it("ignore un brouillon avec un stepIndex manquant", () => {
    window.localStorage.setItem(
      draftKey("assistance-voyage"),
      JSON.stringify({ values: { email: "a@b.be" }, savedAt: 1_000 })
    )
    expect(readDraft("assistance-voyage", 1_000)).toBeNull()
  })

  it("ignore un brouillon avec un stepIndex non numérique", () => {
    window.localStorage.setItem(
      draftKey("assistance-voyage"),
      JSON.stringify({
        values: { email: "a@b.be" },
        stepIndex: "2",
        savedAt: 1_000,
      })
    )
    expect(readDraft("assistance-voyage", 1_000)).toBeNull()
  })

  it("ne lève pas quand le stockage est indisponible", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => {
          throw new Error("stockage bloqué")
        },
        setItem: () => {
          throw new Error("stockage bloqué")
        },
        removeItem: () => {
          throw new Error("stockage bloqué")
        },
      },
    })

    expect(() => writeDraft("assistance-voyage", {}, 0)).not.toThrow()
    expect(readDraft("assistance-voyage")).toBeNull()
    expect(() => clearDraft("assistance-voyage")).not.toThrow()
  })
})

describe("clearDraft", () => {
  it("supprime le brouillon", () => {
    writeDraft("assistance-voyage", { email: "a@b.be" }, 0, 1_000)
    clearDraft("assistance-voyage")
    expect(readDraft("assistance-voyage", 1_000)).toBeNull()
  })
})
