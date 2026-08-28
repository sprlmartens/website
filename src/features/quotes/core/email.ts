import { escapeHtml } from "@/lib/html"

import type { SummarySection } from "./types"

/**
 * Rend un récapitulatif en texte brut. Générique : ce module ne connaît aucun
 * produit, ajouter un formulaire n'y touche pas.
 */
export function renderSummaryText(sections: SummarySection[]): string {
  return sections
    .map((section) =>
      [
        section.title.toUpperCase(),
        ...section.rows.map((row) => `${row.label} : ${row.value}`),
      ].join("\n")
    )
    .join("\n\n")
}

/** Rend le même récapitulatif en HTML, toute valeur échappée. */
export function renderSummaryHtml(sections: SummarySection[]): string {
  return sections
    .map((section) => {
      const rows = section.rows
        .map(
          (row) =>
            `<p style="margin:0 0 4px"><strong>${escapeHtml(row.label)} :</strong> ${escapeHtml(
              row.value
            ).replace(/\n/g, "<br />")}</p>`
        )
        .join("")

      return `<h2 style="font-size:15px;margin:24px 0 8px">${escapeHtml(
        section.title
      )}</h2>${rows}`
    })
    .join("")
}
