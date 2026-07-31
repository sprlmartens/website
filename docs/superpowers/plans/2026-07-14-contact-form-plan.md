# Formulaire de contact — page /contact refondue — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a contact form (prénom, nom, email, téléphone, intention, message) on a refonte of `/contact`, with client+server validation, honeypot/rate-limit anti-spam, and email delivery over SMTP.

**Architecture:** React Hook Form + `zodResolver` validates client-side against a shared Zod schema; submission calls a Next.js Server Action (imported directly, invoked inside `useTransition`) that revalidates with the same schema, checks a honeypot field and an in-memory per-IP rate limit, then sends the email via a generic Nodemailer SMTP wrapper. Feedback is shown via Sonner toasts.

**Tech Stack:** Next.js App Router (Server Actions), React Hook Form, `@hookform/resolvers/zod`, Zod v4, Nodemailer, shadcn/ui (`Field`, `Input`, `Select`, `Textarea`, `Button`, `Sonner`), Tailwind CSS v4.

## Global Constraints

- No automated test framework exists in this repo (confirmed: no vitest/jest config, no `test` script) — verification is via `npx tsc --noEmit`, `npm run lint`, and manual QA through the dev server. Do not introduce a test runner as part of this plan.
- Server-side validation must never trust client input — `submitContactForm` re-validates with `contactSchema` even though the client already validated.
- Rate limiting is in-memory (`Map`), best-effort only — acceptable known limitation, do not attempt to make it durable (e.g. no external store) in this plan.
- Email transport config must use generic env var names (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `CONTACT_EMAIL_TO`) — not provider-specific names — per the spec's reusability requirement.
- `src/components/home/Contact.tsx` (homepage section) must keep working unchanged in content/behavior — only the internal schedule-rendering code is extracted into a shared component, not removed or altered visually.
- French copy throughout (labels, error messages, toasts) — this is a French-language site.

---

### Task 1: Install dependencies

**Files:**

- Modify: `package.json`

**Interfaces:**

- Produces: `nodemailer` importable as `import nodemailer from "nodemailer"`; `react-hook-form` and `@hookform/resolvers/zod` explicitly declared (already present transitively/declared, now pinned).

- [ ] **Step 1: Install nodemailer, its types, and pin react-hook-form**

Run:

```bash
npm install nodemailer react-hook-form
npm install -D @types/nodemailer
```

- [ ] **Step 2: Verify package.json was updated**

Run: `grep -E "nodemailer|react-hook-form" package.json`
Expected: three new lines — `"nodemailer": "^7.x.x"` and `"@types/nodemailer": "^..."` and `"react-hook-form": "^7.x.x"` (versions may vary, just confirm presence in `dependencies`/`devDependencies`).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add nodemailer and react-hook-form dependencies"
```

---

### Task 2: Contact form validation schema

**Files:**

- Modify: `src/features/contact/schema.ts` (currently an empty stub)

**Interfaces:**

- Produces:
  - `contactIntents: readonly ["assurance", "placement", "sinistre", "autre"]`
  - `type ContactIntent = (typeof contactIntents)[number]`
  - `contactIntentLabels: Record<ContactIntent, string>`
  - `contactSchema: z.ZodObject<...>` (fields: `firstName`, `lastName`, `email`, `phone`, `intent`, `message`, `honeypot`)
  - `type ContactFormValues = z.infer<typeof contactSchema>`

- [ ] **Step 1: Write the schema**

```ts
import { z } from "zod"

export const contactIntents = [
  "assurance",
  "placement",
  "sinistre",
  "autre",
] as const

export type ContactIntent = (typeof contactIntents)[number]

export const contactIntentLabels: Record<ContactIntent, string> = {
  assurance: "Assurance",
  placement: "Placement",
  sinistre: "Sinistre",
  autre: "Autre",
}

const belgianPhone = /^(\+32|0)[1-9](\s?\d){7,8}$/

export const contactSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, { error: "Le prénom doit contenir au moins 2 caractères." })
    .max(50, { error: "Le prénom est trop long." }),
  lastName: z
    .string()
    .trim()
    .min(2, { error: "Le nom doit contenir au moins 2 caractères." })
    .max(50, { error: "Le nom est trop long." }),
  email: z.email({ error: "Adresse e-mail invalide." }),
  phone: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .regex(belgianPhone, { error: "Numéro de téléphone invalide." }),
    ])
    .optional(),
  intent: z.enum(contactIntents, {
    error: "Veuillez sélectionner un motif de contact.",
  }),
  message: z
    .string()
    .trim()
    .min(10, { error: "Le message doit contenir au moins 10 caractères." })
    .max(2000, {
      error: "Le message est trop long (2000 caractères maximum).",
    }),
  honeypot: z.string().optional(),
})

export type ContactFormValues = z.infer<typeof contactSchema>
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/features/contact/schema.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/features/contact/schema.ts
git commit -m "feat(contact): add contact form validation schema"
```

---

### Task 3: Generic in-memory rate limiter

**Files:**

- Create: `src/lib/rate-limit.ts`

**Interfaces:**

- Produces: `checkRateLimit(key: string, options: { max: number; windowMs: number }): boolean` — returns `true` if the call is allowed (and records it), `false` if the caller has exceeded `max` calls within `windowMs`.

- [ ] **Step 1: Write the rate limiter**

```ts
const attempts = new Map<string, number[]>()

type RateLimitOptions = {
  max: number
  windowMs: number
}

export function checkRateLimit(
  key: string,
  { max, windowMs }: RateLimitOptions,
): boolean {
  const now = Date.now()
  const windowStart = now - windowMs
  const recent = (attempts.get(key) ?? []).filter(
    (timestamp) => timestamp > windowStart,
  )

  if (recent.length >= max) {
    attempts.set(key, recent)
    return false
  }

  recent.push(now)
  attempts.set(key, recent)
  return true
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/lib/rate-limit.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/rate-limit.ts
git commit -m "feat: add generic in-memory rate limiter"
```

---

### Task 4: Generic SMTP mailer

**Files:**

- Create: `src/lib/mailer.ts`

**Interfaces:**

- Consumes: env vars `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`.
- Produces: `sendMail(options: { to: string; subject: string; text: string; html: string; replyTo?: string }): Promise<void>`

- [ ] **Step 1: Write the mailer**

```ts
import nodemailer from "nodemailer"

type SendMailOptions = {
  to: string
  subject: string
  text: string
  html: string
  replyTo?: string
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

export async function sendMail({
  to,
  subject,
  text,
  html,
  replyTo,
}: SendMailOptions): Promise<void> {
  const transporter = getTransporter()

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html,
    replyTo,
  })
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/lib/mailer.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/mailer.ts
git commit -m "feat: add generic SMTP mailer"
```

---

### Task 5: Contact form Server Action

**Files:**

- Create: `src/features/contact/actions.ts`

**Interfaces:**

- Consumes:
  - `contactSchema`, `contactIntentLabels`, `type ContactFormValues` from `@/features/contact/schema` (Task 2)
  - `checkRateLimit` from `@/lib/rate-limit` (Task 3)
  - `sendMail` from `@/lib/mailer` (Task 4)
- Produces: `type ContactActionResult = { success: true } | { success: false; error: string }` and `submitContactForm(values: ContactFormValues): Promise<ContactActionResult>` — consumed by `ContactForm` in Task 7.

- [ ] **Step 1: Write the server action**

```ts
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
  { success: true } | { success: false; error: string }

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export async function submitContactForm(
  values: ContactFormValues,
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
      error:
        "Configuration serveur manquante. Veuillez nous contacter par téléphone.",
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
      error:
        "L'envoi a échoué. Veuillez réessayer ou nous appeler directement.",
    }
  }

  return { success: true }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/features/contact/actions.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/features/contact/actions.ts
git commit -m "feat(contact): add submitContactForm server action"
```

---

### Task 6: Extract shared schedule timeline component

The homepage `Contact.tsx` has ~80 lines of schedule-chart rendering logic (data, `toPercent`, axis ticks) that the new `ContactInfo` component (Task 8) also needs. Extract it once instead of duplicating it.

**Files:**

- Create: `src/components/contact/ScheduleTimeline.tsx`
- Modify: `src/components/home/Contact.tsx`

**Interfaces:**

- Produces: `export default function ScheduleTimeline(): JSX.Element` — renders the horaires chart (the `<div className="space-y-2.5">...</div>` schedule bars, axis ticks, and legend), consumed by `ContactInfo` in Task 8 and by the updated `Contact.tsx`.

- [ ] **Step 1: Create `ScheduleTimeline.tsx` with the extracted logic**

```tsx
type Segment = { start: string; end: string; onRequest?: boolean }

const schedule: { day: string; segments: Segment[] }[] = [
  {
    day: "Lundi",
    segments: [
      { start: "9:00", end: "12:30" },
      { start: "13:00", end: "18:00" },
    ],
  },
  {
    day: "Mardi",
    segments: [
      { start: "9:00", end: "12:30" },
      { start: "13:00", end: "18:00", onRequest: true },
    ],
  },
  {
    day: "Mercredi",
    segments: [
      { start: "9:00", end: "12:30" },
      { start: "13:00", end: "18:00" },
    ],
  },
  {
    day: "Jeudi",
    segments: [
      { start: "9:00", end: "12:30" },
      { start: "13:00", end: "18:00" },
    ],
  },
  {
    day: "Vendredi",
    segments: [
      { start: "9:00", end: "12:30" },
      { start: "13:00", end: "16:30" },
    ],
  },
]

const DAY_START = 9 * 60
const DAY_END = 18 * 60
const DAY_SPAN = DAY_END - DAY_START

const AXIS_TICKS: {
  time: string
  label: string
  align: "start" | "center" | "end"
}[] = [
  { time: "9:00", label: "9h", align: "start" },
  { time: "12:30", label: "12h30", align: "end" },
  { time: "13:00", label: "13h", align: "start" },
  { time: "18:00", label: "18h", align: "end" },
]

const AXIS_ALIGN: Record<string, string> = {
  start: "translate-x-0",
  center: "-translate-x-1/2",
  end: "-translate-x-full",
}

function toPercent(time: string) {
  const [h, m] = time.split(":").map(Number)
  return ((h * 60 + m - DAY_START) / DAY_SPAN) * 100
}

export default function ScheduleTimeline() {
  return (
    <>
      <div className="space-y-2.5">
        {schedule.map((row) => (
          <div
            key={row.day}
            className="grid grid-cols-[4.5rem_1fr] items-center gap-3"
          >
            <span className="text-sm text-foreground/70">{row.day}</span>
            <div className="relative h-2 rounded-full bg-foreground/10">
              {row.segments.map((seg) => (
                <span
                  key={seg.start}
                  className={
                    "absolute inset-y-0 rounded-full " +
                    (seg.onRequest ? "bg-accent" : "bg-primary")
                  }
                  style={{
                    left: `${toPercent(seg.start)}%`,
                    width: `${toPercent(seg.end) - toPercent(seg.start)}%`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-[4.5rem_1fr] gap-3">
        <span />
        <div className="relative h-3.5 text-sm font-medium text-foreground/70">
          {AXIS_TICKS.map((tick) => (
            <span
              key={tick.time}
              className={`absolute whitespace-nowrap ${AXIS_ALIGN[tick.align]}`}
              style={{ left: `${toPercent(tick.time)}%` }}
            >
              {tick.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-5 text-sm text-foreground/70">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Ouvert
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Sur rendez-vous
        </span>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Update `src/components/home/Contact.tsx` to use it**

Replace the entire file content with:

```tsx
import ScheduleTimeline from "@/components/contact/ScheduleTimeline"

export default function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 bg-secondary text-foreground">
      <div className="container py-24 lg:py-32">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
          <div className="reveal lg:col-span-5">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Votre bureau, près de chez vous
            </p>
            <h2 className="mt-6 font-display text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
              À Rocourt,
              <br />
              depuis toujours.
            </h2>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground">
              Un vrai bureau, des visages connus, un café offert. Passez nous
              voir, appelez-nous, ou réservez un rendez-vous.
            </p>

            <dl className="mt-10 space-y-6 text-sm">
              <div>
                <dt className="font-semibold uppercase tracking-[0.14em]">
                  Adresse
                </dt>
                <dd className="mt-1 leading-relaxed text-foreground/70">
                  Rue François Lefebvre 10/B
                  <br />
                  4000 Rocourt (Liège)
                </dd>
              </div>
              <div>
                <dt className="font-semibold uppercase tracking-[0.14em]">
                  Contact
                </dt>
                <dd className="mt-1 leading-relaxed text-foreground/70">
                  <a href="tel:+3242461363">+32 4 246 13 63</a>
                  <br />
                  <a href="mailto:assurances@sprlmartens.be">
                    assurances@sprlmartens.be
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold uppercase tracking-[0.14em]">
                  Horaires
                </dt>
                <dd className="mt-3">
                  <ScheduleTimeline />
                </dd>
              </div>
            </dl>
          </div>

          <div className="reveal lg:col-span-7">
            <div className="relative h-full min-h-[24rem] w-full overflow-hidden">
              <iframe
                title="Bureau Martens Assurances — Rocourt, Liège"
                src="https://www.google.com/maps?q=Rue%20Fran%C3%A7ois%20Lefebvre%2010%2FB%2C%204000%20Rocourt%2C%20Li%C3%A8ge&output=embed&hl=fr"
                className="absolute inset-0 h-full w-full grayscale-[0.6] contrast-[1.05]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing either file.

- [ ] **Step 4: Manually verify the homepage is visually unchanged**

Run: `npm run dev`, open `http://localhost:3000/#contact`.
Expected: the schedule chart (bars, axis labels "9h/12h30/13h/18h", "Ouvert"/"Sur rendez-vous" legend) renders identically to before the refactor.

- [ ] **Step 5: Commit**

```bash
git add src/components/contact/ScheduleTimeline.tsx src/components/home/Contact.tsx
git commit -m "refactor: extract ScheduleTimeline component from homepage Contact section"
```

---

### Task 7: ContactForm component

**Files:**

- Create: `src/components/contact/ContactForm.tsx`

**Interfaces:**

- Consumes:
  - `submitContactForm`, `type ContactActionResult` from `@/features/contact/actions` (Task 5)
  - `contactSchema`, `contactIntents`, `contactIntentLabels`, `type ContactFormValues` from `@/features/contact/schema` (Task 2)
  - shadcn `Button`, `Field`/`FieldContent`/`FieldError`/`FieldGroup`/`FieldLabel`, `Input`, `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue`, `Textarea`
- Produces: `export default function ContactForm(): JSX.Element` — consumed by the `/contact` page in Task 10.

- [ ] **Step 1: Write the component**

```tsx
"use client"

import { useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { submitContactForm } from "@/features/contact/actions"
import {
  contactIntentLabels,
  contactIntents,
  contactSchema,
  type ContactFormValues,
} from "@/features/contact/schema"

const defaultValues: ContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  intent: "" as ContactFormValues["intent"],
  message: "",
  honeypot: "",
}

export default function ContactForm() {
  const [isPending, startTransition] = useTransition()
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues,
  })

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await submitContactForm(values)

      if (result.success) {
        toast.success("Merci, nous revenons vers vous rapidement.")
        reset(defaultValues)
      } else {
        toast.error(result.error)
      }
    })
  })

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.firstName}>
            <FieldLabel htmlFor="firstName">Prénom</FieldLabel>
            <FieldContent>
              <Input
                id="firstName"
                autoComplete="given-name"
                aria-invalid={!!errors.firstName}
                {...register("firstName")}
              />
              <FieldError errors={[errors.firstName]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!errors.lastName}>
            <FieldLabel htmlFor="lastName">Nom</FieldLabel>
            <FieldContent>
              <Input
                id="lastName"
                autoComplete="family-name"
                aria-invalid={!!errors.lastName}
                {...register("lastName")}
              />
              <FieldError errors={[errors.lastName]} />
            </FieldContent>
          </Field>
        </div>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <FieldContent>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="phone">Téléphone (facultatif)</FieldLabel>
          <FieldContent>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              {...register("phone")}
            />
            <FieldError errors={[errors.phone]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.intent}>
          <FieldLabel htmlFor="intent">Motif de la demande</FieldLabel>
          <FieldContent>
            <Controller
              control={control}
              name="intent"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="intent"
                    className="w-full"
                    aria-invalid={!!errors.intent}
                  >
                    <SelectValue placeholder="Sélectionnez un motif" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactIntents.map((intent) => (
                      <SelectItem key={intent} value={intent}>
                        {contactIntentLabels[intent]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.intent]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.message}>
          <FieldLabel htmlFor="message">Message</FieldLabel>
          <FieldContent>
            <Textarea
              id="message"
              rows={5}
              aria-invalid={!!errors.message}
              {...register("message")}
            />
            <FieldError errors={[errors.message]} />
          </FieldContent>
        </Field>

        <div className="sr-only" aria-hidden="true">
          <label htmlFor="website">Ne pas remplir ce champ</label>
          <input
            id="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("honeypot")}
          />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Envoi en cours…" : "Envoyer"}
        </Button>
      </FieldGroup>
    </form>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/components/contact/ContactForm.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/contact/ContactForm.tsx
git commit -m "feat(contact): add ContactForm component"
```

---

### Task 8: ContactInfo component

**Files:**

- Create: `src/components/contact/ContactInfo.tsx`

**Interfaces:**

- Consumes: `ScheduleTimeline` default export from `@/components/contact/ScheduleTimeline` (Task 6)
- Produces: `export default function ContactInfo(): JSX.Element` — consumed by the `/contact` page in Task 10.

- [ ] **Step 1: Write the component**

```tsx
import ScheduleTimeline from "@/components/contact/ScheduleTimeline"

export default function ContactInfo() {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
        Votre bureau, près de chez vous
      </p>
      <h1 className="mt-6 font-display text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
        Parlons de votre situation.
      </h1>
      <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground">
        Un vrai bureau, des visages connus, un café offert. Passez nous voir,
        appelez-nous, ou laissez-nous un message ci-contre.
      </p>

      <dl className="mt-10 space-y-6 text-sm">
        <div>
          <dt className="font-semibold uppercase tracking-[0.14em]">Adresse</dt>
          <dd className="mt-1 leading-relaxed text-foreground/70">
            Rue François Lefebvre 10/B
            <br />
            4000 Rocourt (Liège)
            <div className="mt-1">
              Place de parking réservée à nos clients devant le bureau.
            </div>
          </dd>
        </div>
        <div>
          <dt className="font-semibold uppercase tracking-[0.14em]">Contact</dt>
          <dd className="mt-1 leading-relaxed text-foreground/70">
            <a href="tel:+3242461363">+32 4 246 13 63</a>
            <br />
            <a href="mailto:assurances@sprlmartens.be">
              assurances@sprlmartens.be
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-semibold uppercase tracking-[0.14em]">
            Horaires
          </dt>
          <dd className="mt-3">
            <ScheduleTimeline />
          </dd>
        </div>
      </dl>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/components/contact/ContactInfo.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/contact/ContactInfo.tsx
git commit -m "feat(contact): add ContactInfo component"
```

---

### Task 9: Mount the Toaster in the app layout

**Files:**

- Modify: `src/app/(app)/layout.tsx`

**Interfaces:**

- Consumes: `Toaster` from `@/components/ui/sonner` (already generated by `npx shadcn add sonner`).

- [ ] **Step 1: Add the Toaster to the layout**

In `src/app/(app)/layout.tsx`, add the import and render `<Toaster />` once inside the wrapping `<div>`:

```tsx
import React from "react"
import { draftMode } from "next/headers"
import { VisualEditing } from "next-sanity/visual-editing"

import { DisableDraftMode } from "@/components/disable-draft-mode"
import { SanityLive } from "@/sanity/lib/live"
import { Toaster } from "@/components/ui/sonner"

import Header from "@/components/home/Header"
import Footer from "@/components/home/Footer"

import "./globals.css"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isEnabled: isDraftMode } = await draftMode()

  return (
    <div className="min-h-screen">
      <Header />
      <main>{children}</main>
      <Footer />
      <SanityLive />
      <Toaster />
      {isDraftMode && (
        <>
          <DisableDraftMode />
          <VisualEditing />
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/app/(app)/layout.tsx`.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/layout.tsx"
git commit -m "feat: mount Sonner Toaster in app layout"
```

---

### Task 10: Rebuild the /contact page

**Files:**

- Modify: `src/app/(app)/contact/page.tsx`

**Interfaces:**

- Consumes: `ContactInfo` (Task 8), `ContactForm` (Task 7).

- [ ] **Step 1: Rewrite the page**

```tsx
import ContactForm from "@/components/contact/ContactForm"
import ContactInfo from "@/components/contact/ContactInfo"

export const metadata = {
  title: "Contact — Martens Assurances",
  description:
    "Retrouvez Martens Assurances à Rocourt (Liège) : adresse, téléphone, e-mail, horaires d'ouverture et formulaire de contact.",
}

export default function Page() {
  return (
    <main>
      <section className="bg-secondary text-foreground">
        <div className="container py-24 lg:py-32">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <ContactInfo />
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-border bg-background p-8">
                <ContactForm />
              </div>
            </div>
          </div>

          <div className="mt-14">
            <div className="relative h-[24rem] w-full overflow-hidden rounded-3xl">
              <iframe
                title="Bureau Martens Assurances — Rocourt, Liège"
                src="https://www.google.com/maps?q=Rue%20Fran%C3%A7ois%20Lefebvre%2010%2FB%2C%204000%20Rocourt%2C%20Li%C3%A8ge&output=embed&hl=fr"
                className="absolute inset-0 h-full w-full grayscale-[0.6] contrast-[1.05]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/contact/page.tsx"
git commit -m "feat(contact): rebuild /contact page with form, extended info, and map"
```

---

### Task 11: Environment variables and end-to-end manual QA

**Files:**

- Modify: `.env.local` (gitignored — safe to edit directly)

**Interfaces:** none (final integration task).

- [ ] **Step 1: Add the new env var placeholders**

Append to `.env.local`:

```
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
CONTACT_EMAIL_TO=assurances@sprlmartens.be
```

Tell the user to fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` with their real Brevo SMTP credentials before testing actual email delivery — these steps cannot be completed without them.

- [ ] **Step 2: Full production-equivalent build check**

Run: `npm run build`
Expected: build succeeds with no type or lint errors.

- [ ] **Step 3: Manual QA — validation**

Run: `npm run dev`, open `http://localhost:3000/contact`.

- Submit the empty form → every required field shows its French error message inline, no request is sent (no network tab activity for the server action).
- Fill an invalid email (`foo`) → "Adresse e-mail invalide." shown.
- Fill phone with `123` → "Numéro de téléphone invalide." shown; clear phone entirely → no error (optional).
- Fill message with `"short"` (under 10 chars) → "Le message doit contenir au moins 10 caractères." shown.
- Fill all fields validly (leave phone empty) → no inline errors remain, "Envoyer" becomes clickable.

- [ ] **Step 4: Manual QA — honeypot**

In browser devtools, remove the `sr-only` class from the hidden `#website` input (or use the console: `document.getElementById('website').value = 'x'`), then submit a validly-filled form.
Expected: a success toast appears ("Merci, nous revenons vers vous rapidement.") but no email arrives at `CONTACT_EMAIL_TO` — confirms the honeypot silently short-circuits sending.

- [ ] **Step 5: Manual QA — rate limiting**

With SMTP credentials filled in `.env.local` and the dev server restarted (`npm run dev`), submit a validly-filled form (honeypot empty) 4 times in a row within a couple of minutes.
Expected: the first 3 submissions succeed (toast success, email received at `assurances@sprlmartens.be` each time with correct fields and `replyTo` set to the visitor's email); the 4th shows the rate-limit error toast ("Trop de demandes envoyées récemment...").

- [ ] **Step 6: Manual QA — homepage regression**

Open `http://localhost:3000/#contact`.
Expected: schedule chart, address, and contact info render identically to before this change (Task 6 refactor didn't alter the homepage).

- [ ] **Step 7: Manual QA — responsive layout**

Resize the browser (or use devtools device toolbar) to a narrow mobile width on `/contact`.
Expected: the two columns (`ContactInfo`, `ContactForm`) stack vertically (`grid-cols-1` below `lg:`), the map remains full-width, no horizontal overflow.

- [ ] **Step 8: Commit**

```bash
git add .env.local
git commit -m "chore: add contact form SMTP env var placeholders"
```
