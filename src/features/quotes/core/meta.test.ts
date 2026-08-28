import { describe, expect, it } from "vitest"

import {
  isQuoteSlug,
  quoteFormSlugs,
  quoteFormsMeta,
} from "@/features/quotes/core/meta"

describe("isQuoteSlug", () => {
  it("accepte un vrai slug", () => {
    expect(isQuoteSlug("assistance-voyage")).toBe(true)
  })

  it("refuse un slug inconnu", () => {
    expect(isQuoteSlug("inconnu")).toBe(false)
  })

  // Régression : `value in quoteFormsMeta` parcourt la chaîne de prototypes,
  // donc ces noms hérités d'Object.prototype passaient le garde-fou et
  // faisaient planter la Server Action sur une entrée forgée à la main.
  it("refuse les noms hérités du prototype", () => {
    expect(isQuoteSlug("toString")).toBe(false)
    expect(isQuoteSlug("constructor")).toBe(false)
    expect(isQuoteSlug("__proto__")).toBe(false)
    expect(isQuoteSlug("hasOwnProperty")).toBe(false)
  })
})

describe("quoteFormSlugs", () => {
  it("contient exactement les vrais slugs", () => {
    expect(quoteFormSlugs).toEqual(Object.keys(quoteFormsMeta))
    expect(quoteFormSlugs).toEqual(["assistance-voyage"])
  })
})
