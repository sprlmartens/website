import { describe, expect, it } from "vitest"

import { renderSummaryHtml, renderSummaryText } from "@/features/quotes/core/email"
import type { SummarySection } from "@/features/quotes/core/types"

const sections: SummarySection[] = [
  {
    title: "Le preneur d'assurance",
    stepId: "holder",
    rows: [
      { label: "Nom", value: "Dupont" },
      { label: "Prénom", value: "Camille" },
    ],
  },
  {
    title: "Vos coordonnées",
    stepId: "contact",
    rows: [{ label: "Message", value: "Bonjour\nMerci !" }],
  },
]

describe("renderSummaryText", () => {
  it("titre chaque section et liste ses lignes", () => {
    const text = renderSummaryText(sections)
    expect(text).toContain("LE PRENEUR D'ASSURANCE")
    expect(text).toContain("Nom : Dupont")
    expect(text).toContain("Prénom : Camille")
  })
})

describe("renderSummaryHtml", () => {
  it("échappe les valeurs", () => {
    const html = renderSummaryHtml([
      {
        title: "Test",
        stepId: "test",
        rows: [{ label: "Nom", value: "<script>alert(1)</script>" }],
      },
    ])
    expect(html).not.toContain("<script>")
    expect(html).toContain("&lt;script&gt;")
  })

  it("échappe aussi les titres et libellés", () => {
    const html = renderSummaryHtml([
      { title: "A & B", stepId: "x", rows: [{ label: "C & D", value: "ok" }] },
    ])
    expect(html).toContain("A &amp; B")
    expect(html).toContain("C &amp; D")
  })

  it("convertit les retours à la ligne en <br />", () => {
    expect(renderSummaryHtml(sections)).toContain("Bonjour<br />Merci !")
  })
})
