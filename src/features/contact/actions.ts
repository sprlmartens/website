"use server"

import { headers } from "next/headers"

import { sendMail } from "@/lib/mailer"
import { checkRateLimit } from "@/lib/rate-limit"
import {
  contactIntentLabels,
  contactSchema,
  type ContactFormValues,
} from "@/features/contact/schema"

export type ContactActionResult =
  | { success: true }
  | { success: false; error: string }

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export async function submitContactForm(
  values: ContactFormValues
): Promise<ContactActionResult> {
  const parsed = contactSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Certains champs sont invalides. Veuillez vérifier le formulaire.",
    }
  }

  const { firstName, lastName, email, phone, intent, message, honeypot } =
    parsed.data

  if (honeypot) {
    return { success: true }
  }

  const headersList = await headers()
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  const allowed = checkRateLimit(`contact:${ip}`, {
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

  const to = process.env.CONTACT_EMAIL_TO

  if (!to) {
    return {
      success: false,
      error: "Configuration serveur manquante. Veuillez nous contacter par téléphone.",
    }
  }

  try {
    await sendMail({
      to,
      subject: `Nouvelle demande de contact — ${contactIntentLabels[intent]}`,
      replyTo: email,
      text: [
        `Prénom : ${firstName}`,
        `Nom : ${lastName}`,
        `Email : ${email}`,
        `Téléphone : ${phone || "Non renseigné"}`,
        `Motif : ${contactIntentLabels[intent]}`,
        "",
        "Message :",
        message,
      ].join("\n"),
      html: `
        <p><strong>Prénom :</strong> ${escapeHtml(firstName)}</p>
        <p><strong>Nom :</strong> ${escapeHtml(lastName)}</p>
        <p><strong>Email :</strong> ${escapeHtml(email)}</p>
        <p><strong>Téléphone :</strong> ${escapeHtml(phone || "Non renseigné")}</p>
        <p><strong>Motif :</strong> ${escapeHtml(contactIntentLabels[intent])}</p>
        <p><strong>Message :</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      `,
    })
  } catch (error) {
    console.error("Failed to send contact email", error)
    return {
      success: false,
      error: "L'envoi a échoué. Veuillez réessayer ou nous appeler directement.",
    }
  }

  return { success: true }
}
