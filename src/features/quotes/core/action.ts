"use server"

import { headers } from "next/headers"

import { sendMail } from "@/lib/mailer"
import { checkRateLimit } from "@/lib/rate-limit"

import { quoteDefinitions } from "./definitions"
import { renderSummaryHtml, renderSummaryText } from "./email"
import { isQuoteSlug, quoteFormsMeta } from "./meta"

export type QuoteActionResult =
  | { success: true; acknowledgementSent: boolean }
  | { success: false; error: string }

const GENERIC_ERROR =
  "L'envoi a échoué. Veuillez réessayer ou nous appeler directement."

export async function submitQuoteRequest(
  slug: string,
  values: unknown
): Promise<QuoteActionResult> {
  if (!isQuoteSlug(slug)) {
    return { success: false, error: GENERIC_ERROR }
  }

  const definition = quoteDefinitions[slug]
  const parsed = definition.schema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Certains champs sont invalides. Veuillez vérifier le formulaire.",
    }
  }

  const data = parsed.data

  // Piège à robots : on feint le succès plutôt que de signaler la détection.
  // Aucun e-mail n'est envoyé sur ce chemin, donc pas d'accusé de réception.
  if (data.honeypot) {
    return { success: true, acknowledgementSent: false }
  }

  const headersList = await headers()
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  const allowed = checkRateLimit(`quote:${slug}:${ip}`, {
    max: 3,
    windowMs: 10 * 60_000,
  })

  if (!allowed) {
    return {
      success: false,
      error:
        "Trop de demandes envoyées récemment. Veuillez réessayer dans quelques minutes.",
    }
  }

  const to = process.env.QUOTE_EMAIL_TO ?? process.env.CONTACT_EMAIL_TO

  if (!to) {
    return {
      success: false,
      error:
        "Configuration serveur manquante. Veuillez nous contacter par téléphone.",
    }
  }

  const sections = definition.summary(data)
  const text = renderSummaryText(sections)
  const html = renderSummaryHtml(sections)
  const subject = definition.emailSubject(data)
  const prospectEmail = definition.recipientEmail(data)

  try {
    await sendMail({
      to,
      subject,
      replyTo: prospectEmail,
      text,
      html,
    })
  } catch (error) {
    console.error("Failed to send quote request email", error)
    return { success: false, error: GENERIC_ERROR }
  }

  // L'accusé de réception ne doit jamais faire échouer la demande : l'agence
  // l'a reçue, inviter le prospect à recommencer créerait un doublon. Son
  // succès est néanmoins remonté à l'appelant pour que l'écran de
  // confirmation n'affirme pas un envoi qui a échoué.
  let acknowledgementSent = true
  try {
    const meta = quoteFormsMeta[slug]
    await sendMail({
      to: prospectEmail,
      subject: `Votre demande de devis — ${meta.eyebrow}`,
      text: [
        "Bonjour,",
        "",
        "Nous avons bien reçu votre demande de devis. Un conseiller vous recontacte sous deux jours ouvrables.",
        "",
        "Voici le récapitulatif de votre demande :",
        "",
        text,
        "",
        "Martens Assurances",
      ].join("\n"),
      html: [
        "<p>Bonjour,</p>",
        "<p>Nous avons bien reçu votre demande de devis. Un conseiller vous recontacte sous deux jours ouvrables.</p>",
        "<p>Voici le récapitulatif de votre demande :</p>",
        html,
        "<p>Martens Assurances</p>",
      ].join(""),
    })
  } catch (error) {
    console.error("Failed to send quote acknowledgement email", error)
    acknowledgementSent = false
  }

  return { success: true, acknowledgementSent }
}
