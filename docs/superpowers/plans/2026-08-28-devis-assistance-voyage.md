# Formulaires de devis multi-étapes — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire un moteur de formulaire multi-étapes réutilisable et son premier produit, la demande de devis en assistance voyage, accessible sur `/devis/assistance-voyage`.

**Architecture:** Un moteur générique (`src/features/quotes/core` + `src/components/quotes`) piloté par une `QuoteFormDefinition` par produit. La navigation par étapes utilise `trigger(step.fields)` de react-hook-form pour valider une étape à la fois contre un schéma zod unique. Trois registres séparés — métadonnées sérialisables, définitions serveur, composants client — parce qu'un schéma zod et une fonction ne franchissent pas la frontière RSC.

**Tech Stack:** Next.js 16.2.9 (App Router), React 19.2, react-hook-form 7.83, zod 4.4.3, @hookform/resolvers 5.4, radix-ui (paquet unifié), Tailwind 4, nodemailer, sonner, vitest (ajouté par ce plan).

**Spec:** `docs/superpowers/specs/2026-08-28-devis-assistance-voyage-design.md`

## Global Constraints

- **Langue** : tout texte affiché à l'utilisateur et tout commentaire de code est en **français**. Les identifiants (variables, fonctions, types, fichiers) sont en **anglais**.
- **Messages zod** : syntaxe zod v4, `{ error: "..." }` — jamais `{ message: "..." }`.
- **Raffinements zod** : utiliser `.check((ctx) => ctx.issues.push({ code: "custom", input, path, message }))`. `superRefine` fonctionne encore mais est déprécié en zod v4.
- **Typage du schéma dans les génériques** : `schema: z.ZodType<T, T>` — et non `z.ZodType<T>`, dont le type d'entrée `unknown` fait échouer `zodResolver`. Vérifié à l'écriture de ce plan.
- **Imports radix** : `import { RadioGroup as RadioGroupPrimitive } from "radix-ui"` — paquet unifié, jamais `@radix-ui/react-*`.
- **Composants UI** : suivre le style de `src/components/ui/` — `data-slot`, `cn()`, `rounded-xl`, tokens `bg-input/50`, `focus-visible:ring-3 focus-visible:ring-ring/30`, `aria-invalid:border-destructive`.
- **Formulaires** : suivre le style de `src/components/contact/ContactForm.tsx` — `Field` / `FieldContent` / `FieldLabel` / `FieldError`, `noValidate`, `useTransition`, toasts `sonner` pour les erreurs.
- **Aucune dépendance nouvelle** hors `vitest` (dev). `radix-ui` fournit déjà `Checkbox`, `RadioGroup` et `Progress` — vérifié.
- **Commits** : un commit par tâche, message en anglais à l'impératif, conforme aux commits existants du dépôt.
- **L'arbre de travail contient des modifications en cours sans rapport avec ce plan** (pages partenaires, avis Google, logos, `Team.tsx`, `Hero.tsx`, `TrustBar.tsx`, `globals.css`…). N'utilisez **jamais** `git add -A`, `git add .` ni un chemin de répertoire large : n'indexez que les fichiers explicitement listés dans la commande de commit de votre tâche. Ne committez, ne restaurez et ne modifiez aucun fichier absent de votre tâche.

---

## Structure des fichiers

**Créés :**

| Fichier | Responsabilité |
|---|---|
| `vitest.config.ts` | Config vitest, alias `@` |
| `src/lib/html.ts` | `escapeHtml`, extrait de contact |
| `src/lib/validation.ts` | Regex téléphone belge, dates `JJ/MM/AAAA`, montants € |
| `src/lib/validation.test.ts` | Tests des helpers |
| `src/features/quotes/core/types.ts` | `QuoteStep`, `QuoteFormDefinition`, `SummarySection` |
| `src/features/quotes/core/meta.ts` | `quoteFormsMeta`, `QuoteSlug` — sérialisable |
| `src/features/quotes/core/definitions.ts` | `quoteDefinitions` — schémas, pour la Server Action |
| `src/features/quotes/core/email.ts` | `SummarySection[]` → texte + HTML |
| `src/features/quotes/core/email.test.ts` | Tests du rendu e-mail |
| `src/features/quotes/core/action.ts` | `"use server" submitQuoteRequest` |
| `src/features/quotes/core/draft-storage.ts` | Lecture/écriture `localStorage`, pur et testable |
| `src/features/quotes/core/draft-storage.test.ts` | Tests du brouillon |
| `src/features/quotes/core/useQuoteDraft.ts` | Hook autour de `draft-storage` |
| `src/features/quotes/assistance-voyage/schema.ts` | Schéma zod, énumérations, libellés |
| `src/features/quotes/assistance-voyage/schema.test.ts` | Tests du schéma |
| `src/features/quotes/assistance-voyage/summary.ts` | Valeurs → `SummarySection[]` |
| `src/features/quotes/assistance-voyage/summary.test.ts` | Tests du récapitulatif |
| `src/features/quotes/assistance-voyage/definition.ts` | Assemblage sans JSX |
| `src/features/quotes/assistance-voyage/steps.tsx` | Étapes et composants de champs |
| `src/features/quotes/assistance-voyage/AssistanceVoyageForm.tsx` | Entrée client du produit |
| `src/components/ui/checkbox.tsx` | Primitive checkbox |
| `src/components/ui/radio-group.tsx` | Primitive radio |
| `src/components/ui/progress.tsx` | Primitive barre de progression |
| `src/components/quotes/fields/MaskedDateField.tsx` | Saisie `JJ/MM/AAAA` |
| `src/components/quotes/fields/OptionCardGroup.tsx` | Cartes radio |
| `src/components/quotes/fields/BooleanField.tsx` | Segmenté Oui/Non |
| `src/components/quotes/fields/GenderField.tsx` | Genre M/F |
| `src/components/quotes/fields/TextField.tsx` | Champ texte relié à RHF |
| `src/components/quotes/fields/PersonFields.tsx` | Bloc identité réutilisé 5 fois |
| `src/components/quotes/QuoteStepper.tsx` | Stepper desktop + progression mobile |
| `src/components/quotes/QuoteReview.tsx` | Écran récapitulatif |
| `src/components/quotes/QuoteSuccess.tsx` | Écran de confirmation |
| `src/components/quotes/QuoteDraftBanner.tsx` | Bandeau de reprise |
| `src/components/quotes/QuoteForm.tsx` | Moteur client |
| `src/components/quotes/quote-forms.tsx` | Registre client + `QuoteFormBySlug` |
| `src/app/(app)/devis/page.tsx` | Hub |
| `src/app/(app)/devis/[produit]/page.tsx` | Route produit |

**Écart assumé avec la spec :** la spec listait `fields/EuroField.tsx` et
`fields/AddressFields.tsx`. Ils sont abandonnés — le montant est un `TextField`
en `inputMode="numeric"`, et l'adresse tient en quatre `TextField` posés
directement dans l'étape « preneur ». Deux enveloppes de plus n'auraient rien
factorisé.

**Modifiés :** `package.json`, `next.config.ts`, `src/features/contact/schema.ts`, `src/features/contact/actions.ts`, `src/app/(app)/services/particuliers/page.tsx`, `src/components/home/Header.tsx`, `src/components/home/Footer.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`.

---

## Task 1: Vitest et helpers de validation partagés

**Files:**
- Create: `vitest.config.ts`, `src/lib/html.ts`, `src/lib/validation.ts`
- Test: `src/lib/validation.test.ts`
- Modify: `package.json`, `src/features/contact/schema.ts`, `src/features/contact/actions.ts`

**Interfaces:**
- Consumes: rien.
- Produces: `escapeHtml(value: string): string` · `belgianPhone: RegExp` · `parseFrenchDate(value: string): Date | null` · `todayUtc(): Date` · `frenchDate(error?: string): z.ZodType<string, string>` · `birthDate(error?: string): z.ZodType<string, string>` · `euroAmount(error?: string): z.ZodType<string, string>` · `parseEuroAmount(value: string): number | null` · `formatEuroAmount(value: string): string`

- [ ] **Step 1: Installer vitest**

```bash
npm install --save-dev vitest
```

- [ ] **Step 2: Créer `vitest.config.ts`**

`import.meta.url` plutôt que `__dirname` : Vite charge sa configuration en ESM.

```ts
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
```

- [ ] **Step 3: Ajouter les scripts à `package.json`**

Dans `"scripts"`, après `"lint"` :

```json
    "test": "vitest run",
    "test:watch": "vitest",
```

- [ ] **Step 4: Écrire les tests qui échouent**

Créer `src/lib/validation.test.ts` :

```ts
import { describe, expect, it } from "vitest"

import {
  belgianPhone,
  formatEuroAmount,
  parseEuroAmount,
  parseFrenchDate,
} from "@/lib/validation"

describe("parseFrenchDate", () => {
  it("accepte une date valide", () => {
    const date = parseFrenchDate("15/03/1985")
    expect(date?.toISOString()).toBe("1985-03-15T00:00:00.000Z")
  })

  it("tolère les espaces autour", () => {
    expect(parseFrenchDate("  01/01/2000  ")).not.toBeNull()
  })

  it("refuse un format incorrect", () => {
    expect(parseFrenchDate("1985-03-15")).toBeNull()
    expect(parseFrenchDate("1/3/1985")).toBeNull()
    expect(parseFrenchDate("")).toBeNull()
  })

  it("refuse une date inexistante que Date normaliserait", () => {
    expect(parseFrenchDate("31/02/2020")).toBeNull()
    expect(parseFrenchDate("29/02/2021")).toBeNull()
  })

  it("accepte le 29 février d'une année bissextile", () => {
    expect(parseFrenchDate("29/02/2020")).not.toBeNull()
  })
})

describe("belgianPhone", () => {
  it("accepte les formats courants", () => {
    expect(belgianPhone.test("0475123456")).toBe(true)
    expect(belgianPhone.test("+32475123456")).toBe(true)
  })

  it("refuse un numéro trop court", () => {
    expect(belgianPhone.test("0475")).toBe(false)
  })
})

describe("parseEuroAmount", () => {
  it("accepte le point et la virgule", () => {
    expect(parseEuroAmount("2500")).toBe(2500)
    expect(parseEuroAmount("2500,50")).toBe(2500.5)
    expect(parseEuroAmount("2500.50")).toBe(2500.5)
  })

  it("ignore les espaces de séparation des milliers", () => {
    expect(parseEuroAmount("2 500,50")).toBe(2500.5)
  })

  it("refuse ce qui n'est pas un montant", () => {
    expect(parseEuroAmount("")).toBeNull()
    expect(parseEuroAmount("abc")).toBeNull()
    expect(parseEuroAmount("2500,555")).toBeNull()
  })
})

describe("formatEuroAmount", () => {
  it("formate à la belge, avec espace insécable", () => {
    expect(formatEuroAmount("2500,5")).toBe("2 500,50 €")
    expect(formatEuroAmount("900")).toBe("900,00 €")
  })

  it("renvoie la valeur brute si elle n'est pas un montant", () => {
    expect(formatEuroAmount("abc")).toBe("abc")
  })
})
```

- [ ] **Step 5: Lancer les tests et vérifier qu'ils échouent**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "@/lib/validation"`

- [ ] **Step 6: Créer `src/lib/html.ts`**

```ts
/** Échappe une chaîne destinée à être insérée dans un corps d'e-mail HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
```

- [ ] **Step 7: Créer `src/lib/validation.ts`**

```ts
import { z } from "zod"

/** Numéros belges : +32 ou 0, puis 8 ou 9 chiffres, espaces tolérés. */
export const belgianPhone = /^(\+32|0)[1-9](\s?\d){7,8}$/

const FRENCH_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/

/** Âge maximal admis pour une date de naissance. */
const MAX_AGE_YEARS = 120

/**
 * Convertit « JJ/MM/AAAA » en Date UTC, ou null si le format est invalide ou
 * la date inexistante.
 *
 * `new Date` normalise silencieusement le 31/02 en 03/03 : on compare les
 * composantes de la date obtenue à celles saisies pour rejeter ces valeurs.
 */
export function parseFrenchDate(value: string): Date | null {
  const match = FRENCH_DATE.exec(value.trim())
  if (!match) {
    return null
  }

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? date
    : null
}

/**
 * Minuit UTC du jour courant, pour comparer des dates à la journée.
 *
 * La Belgique étant en UTC+1/+2, une saisie faite entre minuit et 2 h peut
 * être jugée d'un jour trop tolérante — jamais trop stricte.
 */
export function todayUtc(): Date {
  const now = new Date()
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
}

/** Champ texte « JJ/MM/AAAA ». */
export function frenchDate(error = "Date invalide (JJ/MM/AAAA).") {
  return z
    .string()
    .trim()
    .refine((value) => parseFrenchDate(value) !== null, { error })
}

/**
 * Date de naissance : format valide, dans le passé, et pas plus ancienne que
 * 120 ans. Un seul `refine` pour n'afficher qu'un seul message.
 */
export function birthDate(error = "Date de naissance invalide (JJ/MM/AAAA).") {
  return z
    .string()
    .trim()
    .refine((value) => {
      const date = parseFrenchDate(value)
      if (!date) {
        return false
      }

      const today = todayUtc()
      if (date > today) {
        return false
      }

      const oldest = new Date(today)
      oldest.setUTCFullYear(oldest.getUTCFullYear() - MAX_AGE_YEARS)
      return date >= oldest
    }, { error })
}

/**
 * Convertit « 2 500,50 » en 2500.5, ou null si ce n'est pas un montant.
 *
 * Le montant est saisi en texte plutôt qu'en nombre : un `<input>` vide
 * converti en nombre donne `NaN`, et les utilisateurs belges écrivent aussi
 * bien « 2500 » que « 2 500,50 ».
 */
export function parseEuroAmount(value: string): number | null {
  const compact = value.replace(/\s/g, "").replace(",", ".")
  return /^\d{1,7}(\.\d{1,2})?$/.test(compact) ? Number(compact) : null
}

/** Champ texte représentant un montant en euros. */
export function euroAmount(
  error = "Montant invalide (par exemple 2500 ou 2500,50)."
) {
  return z
    .string()
    .trim()
    .refine((value) => parseEuroAmount(value) !== null, { error })
}

/** Formate un montant saisi pour l'affichage : « 2 500,50 € ». */
export function formatEuroAmount(value: string): string {
  const amount = parseEuroAmount(value)
  if (amount === null) {
    return value
  }

  const [whole, decimals] = amount.toFixed(2).split(".")
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${grouped},${decimals} €`
}
```

- [ ] **Step 8: Lancer les tests et vérifier qu'ils passent**

Run: `npm test`
Expected: PASS — 12 tests

- [ ] **Step 9: Faire pointer le formulaire de contact sur les helpers partagés**

Dans `src/features/contact/schema.ts`, supprimer la ligne
`const belgianPhone = /^(\+32|0)[1-9](\s?\d){7,8}$/` et ajouter l'import
sous celui de zod :

```ts
import { belgianPhone } from "@/lib/validation"
```

Dans `src/features/contact/actions.ts`, supprimer la fonction locale
`escapeHtml` (les 8 lignes de `function escapeHtml` à sa fermeture) et
ajouter aux imports :

```ts
import { escapeHtml } from "@/lib/html"
```

- [ ] **Step 10: Vérifier que rien n'est cassé**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: aucune erreur, tests au vert

- [ ] **Step 11: Commit**

```bash
git add vitest.config.ts package.json package-lock.json src/lib/html.ts src/lib/validation.ts src/lib/validation.test.ts src/features/contact/
git commit -m "Add vitest and shared validation helpers"
```

---

## Task 2: Schéma zod de l'assistance voyage

**Files:**
- Create: `src/features/quotes/assistance-voyage/schema.ts`
- Test: `src/features/quotes/assistance-voyage/schema.test.ts`

**Interfaces:**
- Consumes: `belgianPhone`, `birthDate`, `euroAmount`, `parseFrenchDate`, `todayUtc` de `@/lib/validation`
- Produces: `assistanceVoyageSchema` · `AssistanceVoyageValues` · `assistanceVoyageDefaultValues` · `genders`, `genderLabels`, `Gender` · `destinations`, `destinationLabels`, `Destination` · `coverageDurations`, `coverageDurationLabels`, `CoverageDuration` · `MAX_ADDITIONAL_INSURED`

- [ ] **Step 1: Écrire les tests qui échouent**

Créer `src/features/quotes/assistance-voyage/schema.test.ts` :

```ts
import { describe, expect, it } from "vitest"

import {
  assistanceVoyageSchema,
  type AssistanceVoyageValues,
} from "@/features/quotes/assistance-voyage/schema"

/** Un dossier complet et valide, que chaque test dégrade sur un seul point. */
function validValues(): AssistanceVoyageValues {
  return {
    destination: "europe",
    coverageDuration: "annual",
    periodStart: "",
    periodEnd: "",
    tripValue: "2500",
    insureVehicle: false,
    vehicleFirstRegistration: "",
    insureHolder: true,
    hasAdditionalInsured: false,
    additionalInsured: [],
    holder: {
      firstName: "Camille",
      lastName: "Dupont",
      birthDate: "15/03/1985",
      gender: "F",
      street: "Rue de la Station",
      streetNumber: "12A",
      postalCode: "4000",
      city: "Liège",
    },
    email: "camille@example.be",
    phone: "0475123456",
    message: "",
    consent: true,
    honeypot: "",
  }
}

/** Renvoie les chemins d'erreur, pour des assertions lisibles. */
function errorPaths(values: unknown): string[] {
  const result = assistanceVoyageSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((i) => i.path.join("."))
}

describe("assistanceVoyageSchema", () => {
  it("accepte un dossier complet", () => {
    expect(assistanceVoyageSchema.safeParse(validValues()).success).toBe(true)
  })

  it("exige les dates quand la couverture est une période", () => {
    const values = { ...validValues(), coverageDuration: "period" as const }
    expect(errorPaths(values)).toEqual(
      expect.arrayContaining(["periodStart", "periodEnd"])
    )
  })

  it("accepte une période correctement remplie", () => {
    const values = {
      ...validValues(),
      coverageDuration: "period" as const,
      periodStart: "01/07/2099",
      periodEnd: "15/07/2099",
    }
    expect(assistanceVoyageSchema.safeParse(values).success).toBe(true)
  })

  it("refuse une date de départ passée", () => {
    const values = {
      ...validValues(),
      coverageDuration: "period" as const,
      periodStart: "01/01/2020",
      periodEnd: "15/01/2020",
    }
    expect(errorPaths(values)).toContain("periodStart")
  })

  it("refuse une date de retour antérieure au départ", () => {
    const values = {
      ...validValues(),
      coverageDuration: "period" as const,
      periodStart: "15/07/2099",
      periodEnd: "01/07/2099",
    }
    expect(errorPaths(values)).toContain("periodEnd")
  })

  it("exige la mise en circulation quand un véhicule est assuré", () => {
    const values = { ...validValues(), insureVehicle: true }
    expect(errorPaths(values)).toContain("vehicleFirstRegistration")
  })

  it("refuse une mise en circulation dans le futur", () => {
    const values = {
      ...validValues(),
      insureVehicle: true,
      vehicleFirstRegistration: "01/01/2099",
    }
    expect(errorPaths(values)).toContain("vehicleFirstRegistration")
  })

  it("exige au moins une personne assurée", () => {
    const values = { ...validValues(), insureHolder: false }
    expect(errorPaths(values)).toContain("insureHolder")
  })

  it("accepte un preneur non assuré s'il y a un autre assuré", () => {
    const values = {
      ...validValues(),
      insureHolder: false,
      hasAdditionalInsured: true,
      additionalInsured: [
        {
          firstName: "Louis",
          lastName: "Dupont",
          birthDate: "02/09/2010",
          gender: "M" as const,
        },
      ],
    }
    expect(assistanceVoyageSchema.safeParse(values).success).toBe(true)
  })

  it("exige une personne quand on annonce d'autres assurés", () => {
    const values = { ...validValues(), hasAdditionalInsured: true }
    expect(errorPaths(values)).toContain("additionalInsured")
  })

  it("refuse plus de quatre assurés supplémentaires", () => {
    const person = {
      firstName: "Louis",
      lastName: "Dupont",
      birthDate: "02/09/2010",
      gender: "M" as const,
    }
    const values = {
      ...validValues(),
      hasAdditionalInsured: true,
      additionalInsured: [person, person, person, person, person],
    }
    expect(errorPaths(values)).toContain("additionalInsured")
  })

  it("refuse un code postal non belge", () => {
    const values = validValues()
    values.holder.postalCode = "75001"
    expect(errorPaths(values)).toContain("holder.postalCode")
  })

  it("refuse une date de naissance dans le futur", () => {
    const values = validValues()
    values.holder.birthDate = "01/01/2099"
    expect(errorPaths(values)).toContain("holder.birthDate")
  })

  it("accepte un téléphone vide", () => {
    const values = { ...validValues(), phone: "" }
    expect(assistanceVoyageSchema.safeParse(values).success).toBe(true)
  })

  it("exige le consentement", () => {
    const values = { ...validValues(), consent: false }
    expect(errorPaths(values)).toContain("consent")
  })
})
```

- [ ] **Step 2: Lancer les tests et vérifier qu'ils échouent**

Run: `npm test -- schema`
Expected: FAIL — `Failed to resolve import "@/features/quotes/assistance-voyage/schema"`

- [ ] **Step 3: Créer le schéma**

`src/features/quotes/assistance-voyage/schema.ts` :

```ts
import { z } from "zod"

import {
  belgianPhone,
  birthDate,
  euroAmount,
  parseFrenchDate,
  todayUtc,
} from "@/lib/validation"

export const genders = ["M", "F"] as const
export type Gender = (typeof genders)[number]
export const genderLabels: Record<Gender, string> = {
  M: "Masculin",
  F: "Féminin",
}

export const destinations = [
  "europe",
  "world-except-na-carib",
  "world",
] as const
export type Destination = (typeof destinations)[number]
export const destinationLabels: Record<Destination, string> = {
  europe: "Europe",
  "world-except-na-carib": "Le monde hormis USA, Canada et Caraïbes",
  world: "Le monde",
}

export const coverageDurations = ["annual", "period"] as const
export type CoverageDuration = (typeof coverageDurations)[number]
export const coverageDurationLabels: Record<CoverageDuration, string> = {
  annual: "Une année",
  period: "Une période déterminée",
}

export const MAX_ADDITIONAL_INSURED = 4

const personSchema = z.object({
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
  birthDate: birthDate(),
  gender: z.enum(genders, { error: "Veuillez sélectionner un genre." }),
})

export const assistanceVoyageSchema = z
  .object({
    // Étape 1 — le voyage
    destination: z.enum(destinations, {
      error: "Veuillez choisir une destination.",
    }),
    coverageDuration: z.enum(coverageDurations, {
      error: "Veuillez choisir une durée de couverture.",
    }),
    periodStart: z.string().trim().optional(),
    periodEnd: z.string().trim().optional(),
    tripValue: euroAmount(),
    insureVehicle: z.boolean(),
    vehicleFirstRegistration: z.string().trim().optional(),

    // Étape 2 — les assurés
    insureHolder: z.boolean(),
    hasAdditionalInsured: z.boolean(),
    additionalInsured: z.array(personSchema).max(MAX_ADDITIONAL_INSURED, {
      error: `Vous pouvez assurer ${MAX_ADDITIONAL_INSURED} personnes supplémentaires au maximum.`,
    }),

    // Étape 3 — le preneur
    holder: personSchema.extend({
      street: z
        .string()
        .trim()
        .min(2, { error: "Veuillez indiquer la rue." })
        .max(100, { error: "Le nom de rue est trop long." }),
      streetNumber: z
        .string()
        .trim()
        .min(1, { error: "Veuillez indiquer le numéro." })
        .max(20, { error: "Le numéro est trop long." }),
      postalCode: z
        .string()
        .trim()
        .regex(/^\d{4}$/, { error: "Code postal belge invalide (4 chiffres)." }),
      city: z
        .string()
        .trim()
        .min(2, { error: "Veuillez indiquer la localité." })
        .max(80, { error: "Le nom de localité est trop long." }),
    }),

    // Étape 4 — les coordonnées
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
    message: z
      .string()
      .trim()
      .max(1000, { error: "Le message est trop long (1000 caractères maximum)." })
      .optional(),
    // `z.boolean().refine(...)` plutôt que `z.literal(true)` : le type reste
    // `boolean`, ce qui permet une valeur par défaut `false` côté formulaire.
    consent: z.boolean().refine((value) => value, {
      error: "Veuillez accepter le traitement de vos données.",
    }),
    honeypot: z.string().optional(),
  })
  .check((ctx) => {
    const values = ctx.value

    if (values.coverageDuration === "period") {
      const start = values.periodStart
        ? parseFrenchDate(values.periodStart)
        : null
      const end = values.periodEnd ? parseFrenchDate(values.periodEnd) : null

      if (!start) {
        ctx.issues.push({
          code: "custom",
          input: values,
          path: ["periodStart"],
          message: "Date de départ requise (JJ/MM/AAAA).",
        })
      } else if (start < todayUtc()) {
        ctx.issues.push({
          code: "custom",
          input: values,
          path: ["periodStart"],
          message: "La date de départ ne peut pas être dans le passé.",
        })
      }

      if (!end) {
        ctx.issues.push({
          code: "custom",
          input: values,
          path: ["periodEnd"],
          message: "Date de retour requise (JJ/MM/AAAA).",
        })
      } else if (start && end <= start) {
        ctx.issues.push({
          code: "custom",
          input: values,
          path: ["periodEnd"],
          message: "La date de retour doit suivre la date de départ.",
        })
      }
    }

    if (values.insureVehicle) {
      const registration = values.vehicleFirstRegistration
        ? parseFrenchDate(values.vehicleFirstRegistration)
        : null

      if (!registration) {
        ctx.issues.push({
          code: "custom",
          input: values,
          path: ["vehicleFirstRegistration"],
          message: "Date de mise en circulation requise (JJ/MM/AAAA).",
        })
      } else if (registration > todayUtc()) {
        ctx.issues.push({
          code: "custom",
          input: values,
          path: ["vehicleFirstRegistration"],
          message: "La date de mise en circulation ne peut pas être dans le futur.",
        })
      }
    }

    // `?.` défensif : ce bloc peut s'exécuter sur une charge utile forgée à la
    // main, la Server Action étant une frontière réseau.
    const insuredCount = values.additionalInsured?.length ?? 0

    if (values.hasAdditionalInsured && insuredCount === 0) {
      ctx.issues.push({
        code: "custom",
        input: values,
        path: ["additionalInsured"],
        message: "Ajoutez au moins une personne, ou répondez « Non ».",
      })
    }

    if (!values.insureHolder && insuredCount === 0) {
      ctx.issues.push({
        code: "custom",
        input: values,
        path: ["insureHolder"],
        message: "Il faut au moins une personne assurée.",
      })
    }
  })

export type AssistanceVoyageValues = z.infer<typeof assistanceVoyageSchema>

/**
 * Les énumérations n'ont pas d'état « non répondu » : on part d'une chaîne
 * vide castée, comme le fait déjà `ContactForm` pour son champ `intent`.
 */
export const assistanceVoyageDefaultValues: AssistanceVoyageValues = {
  destination: "" as Destination,
  coverageDuration: "" as CoverageDuration,
  periodStart: "",
  periodEnd: "",
  tripValue: "",
  insureVehicle: false,
  vehicleFirstRegistration: "",
  insureHolder: true,
  hasAdditionalInsured: false,
  additionalInsured: [],
  holder: {
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "" as Gender,
    street: "",
    streetNumber: "",
    postalCode: "",
    city: "",
  },
  email: "",
  phone: "",
  message: "",
  consent: false,
  honeypot: "",
}
```

- [ ] **Step 4: Lancer les tests et vérifier qu'ils passent**

Run: `npm test -- schema`
Expected: PASS — 15 tests

- [ ] **Step 5: Commit**

```bash
git add src/features/quotes/assistance-voyage/
git commit -m "Add travel assistance quote schema"
```

---

## Task 3: Types du moteur et récapitulatif du produit

**Files:**
- Create: `src/features/quotes/core/types.ts`, `src/features/quotes/assistance-voyage/summary.ts`
- Test: `src/features/quotes/assistance-voyage/summary.test.ts`

**Interfaces:**
- Consumes: `AssistanceVoyageValues` et les libellés de la Task 2 ; `formatEuroAmount` de la Task 1
- Produces: `SummaryRow`, `SummarySection`, `QuoteStep<T>`, `QuoteFormDefinition<T>`, `QuoteFormMeta` · `assistanceVoyageSummary(values): SummarySection[]`

- [ ] **Step 1: Créer `src/features/quotes/core/types.ts`**

Aucun test : ce fichier ne contient que des types.

```ts
import type { ComponentType } from "react"
import type { DefaultValues, FieldValues, Path } from "react-hook-form"
import type { z } from "zod"

export type SummaryRow = {
  label: string
  value: string
}

export type SummarySection = {
  title: string
  /** Étape à rouvrir depuis le lien « Modifier » du récapitulatif. */
  stepId: string
  rows: SummaryRow[]
}

export type QuoteStep<T extends FieldValues> = {
  id: string
  title: string
  description?: string
  /** Champs validés avant de passer à l'étape suivante. */
  fields: Path<T>[]
  /** Lit le formulaire via `useFormContext()` : aucune prop. */
  Component: ComponentType
}

export type QuoteFormDefinition<T extends FieldValues> = {
  slug: string
  /**
   * `z.ZodType<T, T>` et non `z.ZodType<T>` : ce dernier a `unknown` pour type
   * d'entrée, que `zodResolver` refuse.
   */
  schema: z.ZodType<T, T>
  defaultValues: DefaultValues<T>
  summary: (values: T) => SummarySection[]
  emailSubject: (values: T) => string
  /** Adresse du prospect, destinataire de l'accusé de réception. */
  recipientEmail: (values: T) => string
}

/** Métadonnées sérialisables : traversent la frontière RSC sans encombre. */
export type QuoteFormMeta = {
  slug: string
  eyebrow: string
  title: string
  intro: string
  metaTitle: string
  metaDescription: string
  image: { src: string; alt: string }
}
```

- [ ] **Step 2: Écrire les tests qui échouent**

Créer `src/features/quotes/assistance-voyage/summary.test.ts` :

```ts
import { describe, expect, it } from "vitest"

import { assistanceVoyageSummary } from "@/features/quotes/assistance-voyage/summary"
import type { AssistanceVoyageValues } from "@/features/quotes/assistance-voyage/schema"

function validValues(): AssistanceVoyageValues {
  return {
    destination: "world",
    coverageDuration: "annual",
    periodStart: "",
    periodEnd: "",
    tripValue: "2500,50",
    insureVehicle: false,
    vehicleFirstRegistration: "",
    insureHolder: true,
    hasAdditionalInsured: false,
    additionalInsured: [],
    holder: {
      firstName: "Camille",
      lastName: "Dupont",
      birthDate: "15/03/1985",
      gender: "F",
      street: "Rue de la Station",
      streetNumber: "12A",
      postalCode: "4000",
      city: "Liège",
    },
    email: "camille@example.be",
    phone: "",
    message: "",
    consent: true,
    honeypot: "",
  }
}

/** Aplatit les sections en « Libellé: valeur » pour des assertions lisibles. */
function flatten(values: AssistanceVoyageValues): string[] {
  return assistanceVoyageSummary(values).flatMap((section) =>
    section.rows.map((row) => `${row.label}: ${row.value}`)
  )
}

describe("assistanceVoyageSummary", () => {
  it("restitue l'ordre métier : preneur, assurés, voyage, coordonnées", () => {
    expect(assistanceVoyageSummary(validValues()).map((s) => s.stepId)).toEqual([
      "holder",
      "insured",
      "trip",
      "contact",
    ])
  })

  it("traduit les énumérations en libellés français", () => {
    expect(flatten(validValues())).toEqual(
      expect.arrayContaining([
        "Genre: Féminin",
        "Destination: Le monde",
        "Durée de la couverture: Une année",
      ])
    )
  })

  it("formate le montant du voyage", () => {
    expect(flatten(validValues())).toContain("Valeur du voyage: 2 500,50 €")
  })

  it("compose l'adresse en deux lignes", () => {
    expect(flatten(validValues())).toEqual(
      expect.arrayContaining([
        "Adresse: Rue de la Station 12A",
        "Code postal et localité: 4000 Liège",
      ])
    )
  })

  it("n'affiche pas la période quand la couverture est annuelle", () => {
    expect(flatten(validValues()).some((row) => row.startsWith("Période:"))).toBe(
      false
    )
  })

  it("affiche la période quand elle est renseignée", () => {
    const values = {
      ...validValues(),
      coverageDuration: "period" as const,
      periodStart: "01/07/2099",
      periodEnd: "15/07/2099",
    }
    expect(flatten(values)).toContain("Période: du 01/07/2099 au 15/07/2099")
  })

  it("n'affiche la mise en circulation que si un véhicule est assuré", () => {
    expect(
      flatten(validValues()).some((row) =>
        row.startsWith("Mise en circulation")
      )
    ).toBe(false)

    const values = {
      ...validValues(),
      insureVehicle: true,
      vehicleFirstRegistration: "20/06/2018",
    }
    expect(flatten(values)).toContain(
      "Mise en circulation du véhicule: 20/06/2018"
    )
  })

  it("liste chaque assuré supplémentaire", () => {
    const values = {
      ...validValues(),
      hasAdditionalInsured: true,
      additionalInsured: [
        {
          firstName: "Louis",
          lastName: "Dupont",
          birthDate: "02/09/2010",
          gender: "M" as const,
        },
      ],
    }
    expect(flatten(values)).toEqual(
      expect.arrayContaining([
        "Assuré supplémentaire 1: Dupont Louis",
        "— Date de naissance: 02/09/2010",
        "— Genre: Masculin",
      ])
    )
  })

  it("indique un téléphone non renseigné plutôt qu'une ligne vide", () => {
    expect(flatten(validValues())).toContain("Téléphone: Non renseigné")
  })

  it("omet le message quand il est vide", () => {
    expect(flatten(validValues()).some((row) => row.startsWith("Message:"))).toBe(
      false
    )
  })
})
```

- [ ] **Step 3: Lancer les tests et vérifier qu'ils échouent**

Run: `npm test -- summary`
Expected: FAIL — `Failed to resolve import ".../summary"`

- [ ] **Step 4: Créer `src/features/quotes/assistance-voyage/summary.ts`**

```ts
import type { SummarySection } from "@/features/quotes/core/types"
import { formatEuroAmount } from "@/lib/validation"

import {
  coverageDurationLabels,
  destinationLabels,
  genderLabels,
  type AssistanceVoyageValues,
} from "./schema"

function yesNo(value: boolean): string {
  return value ? "Oui" : "Non"
}

/**
 * Construit le récapitulatif dans l'ordre du dossier assureur — preneur,
 * assurés, voyage — quel que soit l'ordre de saisie.
 *
 * Utilisé par l'écran récapitulatif, l'e-mail à l'agence et l'accusé de
 * réception : les libellés ne peuvent pas diverger.
 */
export function assistanceVoyageSummary(
  values: AssistanceVoyageValues
): SummarySection[] {
  return [
    {
      title: "Le preneur d'assurance",
      stepId: "holder",
      rows: [
        { label: "Nom", value: values.holder.lastName },
        { label: "Prénom", value: values.holder.firstName },
        { label: "Date de naissance", value: values.holder.birthDate },
        { label: "Genre", value: genderLabels[values.holder.gender] },
        {
          label: "Adresse",
          value: `${values.holder.street} ${values.holder.streetNumber}`,
        },
        {
          label: "Code postal et localité",
          value: `${values.holder.postalCode} ${values.holder.city}`,
        },
      ],
    },
    {
      title: "Les personnes assurées",
      stepId: "insured",
      rows: [
        { label: "Le preneur est assuré", value: yesNo(values.insureHolder) },
        ...values.additionalInsured.flatMap((person, index) => [
          {
            label: `Assuré supplémentaire ${index + 1}`,
            value: `${person.lastName} ${person.firstName}`,
          },
          { label: "— Date de naissance", value: person.birthDate },
          { label: "— Genre", value: genderLabels[person.gender] },
        ]),
      ],
    },
    {
      title: "Le voyage",
      stepId: "trip",
      rows: [
        { label: "Destination", value: destinationLabels[values.destination] },
        {
          label: "Durée de la couverture",
          value: coverageDurationLabels[values.coverageDuration],
        },
        ...(values.coverageDuration === "period"
          ? [
              {
                label: "Période",
                value: `du ${values.periodStart} au ${values.periodEnd}`,
              },
            ]
          : []),
        { label: "Valeur du voyage", value: formatEuroAmount(values.tripValue) },
        { label: "Véhicule à assurer", value: yesNo(values.insureVehicle) },
        ...(values.insureVehicle
          ? [
              {
                label: "Mise en circulation du véhicule",
                value: values.vehicleFirstRegistration ?? "",
              },
            ]
          : []),
      ],
    },
    {
      title: "Vos coordonnées",
      stepId: "contact",
      rows: [
        { label: "E-mail", value: values.email },
        { label: "Téléphone", value: values.phone || "Non renseigné" },
        ...(values.message
          ? [{ label: "Message", value: values.message }]
          : []),
      ],
    },
  ]
}
```

- [ ] **Step 5: Lancer les tests et vérifier qu'ils passent**

Run: `npm test -- summary`
Expected: PASS — 10 tests

- [ ] **Step 6: Commit**

```bash
git add src/features/quotes/
git commit -m "Add quote engine types and travel assistance summary"
```

---

## Task 4: Rendu des e-mails

**Files:**
- Create: `src/features/quotes/core/email.ts`
- Test: `src/features/quotes/core/email.test.ts`

**Interfaces:**
- Consumes: `SummarySection` (Task 3), `escapeHtml` (Task 1)
- Produces: `renderSummaryText(sections): string` · `renderSummaryHtml(sections): string`

- [ ] **Step 1: Écrire les tests qui échouent**

Créer `src/features/quotes/core/email.test.ts` :

```ts
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
```

- [ ] **Step 2: Lancer les tests et vérifier qu'ils échouent**

Run: `npm test -- email`
Expected: FAIL — `Failed to resolve import ".../core/email"`

- [ ] **Step 3: Créer `src/features/quotes/core/email.ts`**

```ts
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
```

- [ ] **Step 4: Lancer les tests et vérifier qu'ils passent**

Run: `npm test -- email`
Expected: PASS — 4 tests

- [ ] **Step 5: Commit**

```bash
git add src/features/quotes/core/
git commit -m "Add quote summary email rendering"
```

---

## Task 5: Registres et Server Action

**Files:**
- Create: `src/features/quotes/core/meta.ts`, `src/features/quotes/assistance-voyage/definition.ts`, `src/features/quotes/core/definitions.ts`, `src/features/quotes/core/action.ts`

**Interfaces:**
- Consumes: `assistanceVoyageSchema`, `assistanceVoyageDefaultValues` (Task 2), `assistanceVoyageSummary` (Task 3), `renderSummaryText`/`renderSummaryHtml` (Task 4), `sendMail` (`@/lib/mailer`), `checkRateLimit` (`@/lib/rate-limit`)
- Produces: `quoteFormsMeta`, `QuoteSlug`, `quoteFormSlugs` · `assistanceVoyageDefinition` · `quoteDefinitions` · `submitQuoteRequest(slug: string, values: unknown): Promise<QuoteActionResult>` · `QuoteActionResult = { success: true } | { success: false; error: string }`

- [ ] **Step 1: Créer `src/features/quotes/core/meta.ts`**

```ts
import type { QuoteFormMeta } from "./types"

/**
 * Métadonnées sérialisables des formulaires de devis.
 *
 * Séparées des définitions : un schéma zod et une fonction ne franchissent pas
 * la frontière RSC, mais ces valeurs si. Consommées par le hub `/devis`,
 * `generateStaticParams`, `generateMetadata` et le sitemap.
 */
export const quoteFormsMeta = {
  "assistance-voyage": {
    slug: "assistance-voyage",
    eyebrow: "Assistance voyage",
    title: "Partez couvert, où que vous alliez.",
    intro:
      "Quelques minutes suffisent. Nous revenons vers vous avec une proposition adaptée à votre voyage, sans engagement.",
    metaTitle: "Devis assurance assistance voyage — Martens Assurances",
    metaDescription:
      "Demandez gratuitement un devis d'assistance voyage : assistance médicale, rapatriement et véhicule, en Europe ou dans le monde.",
    image: {
      src: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80&fm=jpg",
      alt: "Avion de ligne au-dessus des nuages",
    },
  },
} as const satisfies Record<string, QuoteFormMeta>

export type QuoteSlug = keyof typeof quoteFormsMeta

export const quoteFormSlugs = Object.keys(quoteFormsMeta) as QuoteSlug[]

/**
 * `Object.hasOwn` et non `value in quoteFormsMeta` : `in` parcourt la chaîne
 * de prototypes, donc « toString » ou « constructor » passeraient le garde et
 * feraient planter la Server Action, qui est un point d'entrée public.
 */
export function isQuoteSlug(value: string): value is QuoteSlug {
  return Object.hasOwn(quoteFormsMeta, value)
}
```

- [ ] **Step 2: Créer `src/features/quotes/assistance-voyage/definition.ts`**

Aucun JSX ici : la Server Action importe ce fichier, son graphe d'import ne
doit pas tirer de composants client.

```ts
import type { QuoteFormDefinition } from "@/features/quotes/core/types"

import {
  assistanceVoyageDefaultValues,
  assistanceVoyageSchema,
  type AssistanceVoyageValues,
} from "./schema"
import { assistanceVoyageSummary } from "./summary"

export const assistanceVoyageDefinition: QuoteFormDefinition<AssistanceVoyageValues> =
  {
    slug: "assistance-voyage",
    schema: assistanceVoyageSchema,
    defaultValues: assistanceVoyageDefaultValues,
    summary: assistanceVoyageSummary,
    emailSubject: (values) =>
      `Demande de devis — Assistance voyage — ${values.holder.lastName} ${values.holder.firstName}`,
    recipientEmail: (values) => values.email,
  }
```

- [ ] **Step 3: Créer `src/features/quotes/core/definitions.ts`**

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { assistanceVoyageDefinition } from "@/features/quotes/assistance-voyage/definition"

import type { QuoteSlug } from "./meta"
import type { QuoteFormDefinition } from "./types"

/**
 * Registre des définitions, consommé par la seule Server Action.
 *
 * Le `any` est délibéré : les définitions ont chacune leur type de valeurs, et
 * l'action ne les manipule qu'après `safeParse`, donc de façon sûre.
 */
export const quoteDefinitions: Record<QuoteSlug, QuoteFormDefinition<any>> = {
  "assistance-voyage": assistanceVoyageDefinition,
}
```

- [ ] **Step 4: Créer `src/features/quotes/core/action.ts`**

```ts
"use server"

import { headers } from "next/headers"

import { sendMail } from "@/lib/mailer"
import { checkRateLimit } from "@/lib/rate-limit"

import { quoteDefinitions } from "./definitions"
import { renderSummaryHtml, renderSummaryText } from "./email"
import { isQuoteSlug, quoteFormsMeta } from "./meta"

export type QuoteActionResult =
  | { success: true }
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
  if (data.honeypot) {
    return { success: true }
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
  // l'a reçue, inviter le prospect à recommencer créerait un doublon.
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
  }

  return { success: true }
}
```

- [ ] **Step 5: Vérifier la compilation et le lint**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: aucune erreur, tests au vert

- [ ] **Step 6: Ajouter la variable d'environnement (facultative)**

Ajouter à `.env.local`, en commentaire si l'adresse doit rester celle du
contact :

```
# Destinataire des demandes de devis. Sans elle, CONTACT_EMAIL_TO est utilisée.
# QUOTE_EMAIL_TO=
```

- [ ] **Step 7: Commit**

```bash
git add src/features/quotes/
git commit -m "Add quote registries and submission server action"
```

---

## Task 6: Primitives d'interface manquantes

**Files:**
- Create: `src/components/ui/checkbox.tsx`, `src/components/ui/radio-group.tsx`, `src/components/ui/progress.tsx`

**Interfaces:**
- Consumes: `cn` (`@/lib/utils`), `radix-ui`
- Produces: `Checkbox` · `RadioGroup`, `RadioGroupItem` · `Progress`

- [ ] **Step 1: Créer `src/components/ui/checkbox.tsx`**

```tsx
"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-5 shrink-0 rounded-md border border-border bg-input/50 outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
```

- [ ] **Step 2: Créer `src/components/ui/radio-group.tsx`**

```tsx
"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "aspect-square size-5 shrink-0 rounded-full border border-border bg-input/50 outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:text-primary aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <CircleIcon className="size-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
```

- [ ] **Step 3: Créer `src/components/ui/progress.tsx`**

```tsx
"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-1 w-full overflow-hidden rounded-full bg-primary/10",
        className,
      )}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-primary transition-transform duration-300"
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
```

- [ ] **Step 4: Vérifier la compilation**

Run: `npx tsc --noEmit && npm run lint`
Expected: aucune erreur

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/checkbox.tsx src/components/ui/radio-group.tsx src/components/ui/progress.tsx
git commit -m "Add checkbox, radio group and progress UI primitives"
```

---

## Task 7: Composants de champ

**Files:**
- Create: `src/components/quotes/fields/TextField.tsx`, `MaskedDateField.tsx`, `OptionCardGroup.tsx`, `BooleanField.tsx`, `GenderField.tsx`, `PersonFields.tsx`

**Interfaces:**
- Consumes: `Field`/`FieldContent`/`FieldLabel`/`FieldError`/`FieldDescription`/`FieldSet`/`FieldLegend` (`@/components/ui/field`), `Input`, `RadioGroup`, `RadioGroupItem` (Task 6), `genders`/`genderLabels` (Task 2)
- Produces: `TextField` · `MaskedDateField` · `OptionCardGroup` · `BooleanField` · `GenderField` · `PersonFields`

Tous ces composants lisent le formulaire par `useFormContext()` et sont
typés sur `FieldValues` : ils servent tous les produits, pas seulement
l'assistance voyage.

- [ ] **Step 1: Créer `src/components/quotes/fields/TextField.tsx`**

```tsx
"use client"

import { useFormContext } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type TextFieldProps = {
  name: string
  label: string
  description?: string
  placeholder?: string
  autoComplete?: string
  inputMode?: "text" | "numeric" | "tel" | "email"
  type?: "text" | "email" | "tel"
}

export function TextField({
  name,
  label,
  description,
  placeholder,
  autoComplete,
  inputMode,
  type = "text",
}: TextFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  // `errors` est imbriqué comme les valeurs : « holder.city » se lit en deux
  // temps. `getFieldError` fait ce parcours sans dépendance supplémentaire.
  const error = getFieldError(errors, name)

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <FieldContent>
        <Input
          id={name}
          type={type}
          inputMode={inputMode}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          {...register(name)}
        />
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        <FieldError errors={[error]} />
      </FieldContent>
    </Field>
  )
}

/**
 * Lit une erreur au chemin pointé, par exemple « holder.city ».
 *
 * `errors` est typé `unknown` : `FieldErrors<T>` de react-hook-form est un
 * type mappé qui ne s'assigne pas à `Record<string, unknown>`.
 */
export function getFieldError(
  errors: unknown,
  name: string
): { message?: string } | undefined {
  const found = name.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, errors)

  return found && typeof found === "object" && "message" in found
    ? (found as { message?: string })
    : undefined
}
```

- [ ] **Step 2: Créer `src/components/quotes/fields/MaskedDateField.tsx`**

```tsx
"use client"

import { Controller, useFormContext } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { getFieldError } from "./TextField"

/**
 * Insère les « / » au fil de la saisie et ignore tout caractère non
 * numérique. La suppression fonctionne naturellement : on repart toujours des
 * seuls chiffres saisis.
 */
function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8)
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
  return parts.filter(Boolean).join("/")
}

type MaskedDateFieldProps = {
  name: string
  label: string
  description?: string
  autoComplete?: string
}

export function MaskedDateField({
  name,
  label,
  description,
  autoComplete,
}: MaskedDateFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()
  const error = getFieldError(errors, name)

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <FieldContent>
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Input
              id={name}
              inputMode="numeric"
              placeholder="JJ/MM/AAAA"
              maxLength={10}
              autoComplete={autoComplete}
              aria-invalid={!!error}
              value={field.value ?? ""}
              onBlur={field.onBlur}
              onChange={(event) => field.onChange(maskDate(event.target.value))}
            />
          )}
        />
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        <FieldError errors={[error]} />
      </FieldContent>
    </Field>
  )
}
```

- [ ] **Step 3: Créer `src/components/quotes/fields/OptionCardGroup.tsx`**

```tsx
"use client"

import { Controller, useFormContext } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

import { getFieldError } from "./TextField"

export type Option = {
  value: string
  label: string
  description?: string
}

type OptionCardGroupProps = {
  name: string
  label: string
  options: Option[]
  columns?: 1 | 2 | 3
}

export function OptionCardGroup({
  name,
  label,
  options,
  columns = 1,
}: OptionCardGroupProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()
  const error = getFieldError(errors, name)

  return (
    <Field data-invalid={!!error}>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <RadioGroup
              value={field.value ?? ""}
              onValueChange={field.onChange}
              className={cn(
                columns === 2 && "sm:grid-cols-2",
                columns === 3 && "sm:grid-cols-3",
              )}
            >
              {options.map((option) => {
                const id = `${name}-${option.value}`
                const isSelected = field.value === option.value

                return (
                  <label
                    key={option.value}
                    htmlFor={id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                      isSelected
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    <RadioGroupItem
                      id={id}
                      value={option.value}
                      aria-invalid={!!error}
                      className="mt-0.5"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">
                        {option.label}
                      </span>
                      {option.description ? (
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                  </label>
                )
              })}
            </RadioGroup>
          )}
        />
        <FieldError errors={[error]} />
      </FieldContent>
    </Field>
  )
}
```

- [ ] **Step 4: Créer `src/components/quotes/fields/BooleanField.tsx`**

```tsx
"use client"

import { Controller, useFormContext } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"

import { getFieldError } from "./TextField"

type BooleanFieldProps = {
  name: string
  label: string
  description?: string
  /** Appelé après le changement, pour vider les champs devenus inutiles. */
  onChanged?: (value: boolean) => void
}

const choices = [
  { value: true, label: "Oui" },
  { value: false, label: "Non" },
]

export function BooleanField({
  name,
  label,
  description,
  onChanged,
}: BooleanFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()
  const error = getFieldError(errors, name)

  return (
    <Field data-invalid={!!error}>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <div
              role="radiogroup"
              aria-label={label}
              className="flex w-full max-w-xs gap-2"
            >
              {choices.map((choice) => {
                const isSelected = field.value === choice.value

                return (
                  <button
                    key={choice.label}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      field.onChange(choice.value)
                      onChanged?.(choice.value)
                    }}
                    className={cn(
                      "flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
                      isSelected
                        ? "border-primary/40 bg-primary/5 text-primary"
                        : "border-border text-foreground hover:bg-muted",
                    )}
                  >
                    {choice.label}
                  </button>
                )
              })}
            </div>
          )}
        />
        <FieldError errors={[error]} />
      </FieldContent>
    </Field>
  )
}
```

- [ ] **Step 5: Créer `src/components/quotes/fields/GenderField.tsx`**

```tsx
"use client"

import {
  genderLabels,
  genders,
} from "@/features/quotes/assistance-voyage/schema"

import { OptionCardGroup } from "./OptionCardGroup"

const options = genders.map((gender) => ({
  value: gender,
  label: genderLabels[gender],
}))

export function GenderField({ name }: { name: string }) {
  return (
    <OptionCardGroup name={name} label="Genre" options={options} columns={2} />
  )
}
```

- [ ] **Step 6: Créer `src/components/quotes/fields/PersonFields.tsx`**

```tsx
"use client"

import { GenderField } from "./GenderField"
import { MaskedDateField } from "./MaskedDateField"
import { TextField } from "./TextField"

/**
 * Bloc identité, réutilisé pour le preneur et pour chaque assuré
 * supplémentaire. `prefix` est le chemin RHF du bloc, par exemple
 * « holder » ou « additionalInsured.0 ».
 */
export function PersonFields({
  prefix,
  autoCompleteScope = false,
}: {
  prefix: string
  /** N'active l'autofill navigateur que pour le preneur. */
  autoCompleteScope?: boolean
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          name={`${prefix}.firstName`}
          label="Prénom"
          autoComplete={autoCompleteScope ? "given-name" : "off"}
        />
        <TextField
          name={`${prefix}.lastName`}
          label="Nom"
          autoComplete={autoCompleteScope ? "family-name" : "off"}
        />
      </div>
      <MaskedDateField
        name={`${prefix}.birthDate`}
        label="Date de naissance"
        autoComplete={autoCompleteScope ? "bday" : "off"}
      />
      <GenderField name={`${prefix}.gender`} />
    </>
  )
}
```

- [ ] **Step 7: Vérifier la compilation**

Run: `npx tsc --noEmit && npm run lint`
Expected: aucune erreur

- [ ] **Step 8: Commit**

```bash
git add src/components/quotes/fields/
git commit -m "Add reusable quote form field components"
```

---

## Task 8: Persistance du brouillon

**Files:**
- Create: `src/features/quotes/core/draft-storage.ts`, `src/features/quotes/core/useQuoteDraft.ts`
- Test: `src/features/quotes/core/draft-storage.test.ts`

**Interfaces:**
- Consumes: rien
- Produces: `QuoteDraft` · `draftKey(slug)` · `stripOmittedFields(values)` · `readDraft(slug, now?)` · `writeDraft(slug, values, stepIndex, now?)` · `clearDraft(slug)` · `useQuoteDraft(slug, form, stepIndex)` renvoyant `{ pendingDraft, restoreDraft, discardDraft, clearSavedDraft }`

- [ ] **Step 1: Écrire les tests qui échouent**

Créer `src/features/quotes/core/draft-storage.test.ts` :

```ts
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
```

- [ ] **Step 2: Lancer les tests et vérifier qu'ils échouent**

Run: `npm test -- draft-storage`
Expected: FAIL — `Failed to resolve import ".../draft-storage"`

- [ ] **Step 3: Créer `src/features/quotes/core/draft-storage.ts`**

```ts
const DRAFT_VERSION = "v1"

/** Au-delà, le brouillon n'est plus proposé. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Jamais persistés : un consentement RGPD ne se restaure pas silencieusement,
 * et le honeypot n'a de sens que rempli par un robot dans la session courante.
 */
const OMITTED_FIELDS = ["consent", "honeypot"]

export type QuoteDraft = {
  values: Record<string, unknown>
  stepIndex: number
  savedAt: number
}

export function draftKey(slug: string): string {
  return `martens:devis:${slug}:${DRAFT_VERSION}`
}

export function stripOmittedFields(
  values: Record<string, unknown>
): Record<string, unknown> {
  const copy = { ...values }
  for (const field of OMITTED_FIELDS) {
    delete copy[field]
  }
  return copy
}

/**
 * Le brouillon est un confort, pas une exigence : toute défaillance du
 * stockage (navigation privée, site data bloqué, quota) est avalée.
 */
export function readDraft(slug: string, now = Date.now()): QuoteDraft | null {
  try {
    const raw = window.localStorage.getItem(draftKey(slug))
    if (!raw) {
      return null
    }

    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as QuoteDraft).savedAt !== "number" ||
      typeof (parsed as QuoteDraft).values !== "object" ||
      (parsed as QuoteDraft).values === null
    ) {
      return null
    }

    const draft = parsed as QuoteDraft
    return now - draft.savedAt > MAX_AGE_MS ? null : draft
  } catch {
    return null
  }
}

export function writeDraft(
  slug: string,
  values: Record<string, unknown>,
  stepIndex: number,
  now = Date.now()
): void {
  try {
    window.localStorage.setItem(
      draftKey(slug),
      JSON.stringify({
        values: stripOmittedFields(values),
        stepIndex,
        savedAt: now,
      })
    )
  } catch {
    // Stockage indisponible : on continue sans brouillon.
  }
}

export function clearDraft(slug: string): void {
  try {
    window.localStorage.removeItem(draftKey(slug))
  } catch {
    // Voir writeDraft.
  }
}
```

- [ ] **Step 4: Lancer les tests et vérifier qu'ils passent**

Run: `npm test -- draft-storage`
Expected: PASS — 8 tests

- [ ] **Step 5: Créer `src/features/quotes/core/useQuoteDraft.ts`**

```tsx
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

  stepIndexRef.current = stepIndex

  // Lecture unique au montage.
  useEffect(() => {
    const draft = readDraft(slug)
    if (draft) {
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
```

- [ ] **Step 6: Vérifier la compilation**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: aucune erreur, tests au vert

- [ ] **Step 7: Commit**

```bash
git add src/features/quotes/core/
git commit -m "Add quote draft persistence"
```

---

## Task 9: Composants du moteur

**Files:**
- Create: `src/components/quotes/QuoteStepper.tsx`, `QuoteReview.tsx`, `QuoteSuccess.tsx`, `QuoteDraftBanner.tsx`, `QuoteForm.tsx`

**Interfaces:**
- Consumes: `QuoteStep`, `QuoteFormDefinition`, `SummarySection` (Task 3), `submitQuoteRequest` (Task 5), `Progress` (Task 6), `useQuoteDraft` (Task 8)
- Produces: `QuoteForm<T>({ definition, steps })` · `QuoteStepper` · `QuoteReview` · `QuoteSuccess` · `QuoteDraftBanner`

- [ ] **Step 1: Créer `src/components/quotes/QuoteStepper.tsx`**

```tsx
"use client"

import { CheckIcon } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type QuoteStepperProps = {
  titles: string[]
  currentIndex: number
  /** Retourner à une étape déjà validée. */
  onNavigate: (index: number) => void
}

export function QuoteStepper({
  titles,
  currentIndex,
  onNavigate,
}: QuoteStepperProps) {
  const total = titles.length
  const progress = ((currentIndex + 1) / total) * 100

  return (
    <>
      {/* Mobile et tablette : compteur et barre de progression. */}
      <div className="lg:hidden">
        <p className="text-sm font-medium text-muted-foreground">
          Étape {currentIndex + 1} sur {total} ·{" "}
          <span className="text-foreground">{titles[currentIndex]}</span>
        </p>
        <Progress value={progress} className="mt-3" />
      </div>

      {/* Desktop : stepper vertical. */}
      <nav aria-label="Étapes du formulaire" className="hidden lg:block">
        <ol className="flex flex-col gap-1">
          {titles.map((title, index) => {
            const isCurrent = index === currentIndex
            const isDone = index < currentIndex

            return (
              <li key={title}>
                <button
                  type="button"
                  onClick={() => onNavigate(index)}
                  disabled={index > currentIndex}
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                    isCurrent && "bg-primary/5 font-medium text-primary",
                    !isCurrent && isDone && "text-foreground hover:bg-muted",
                    index > currentIndex &&
                      "cursor-default text-muted-foreground",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs",
                      isDone && "border-primary bg-primary text-primary-foreground",
                      isCurrent && "border-primary text-primary",
                      !isDone && !isCurrent && "border-border",
                    )}
                  >
                    {isDone ? <CheckIcon className="size-3.5" /> : index + 1}
                  </span>
                  {title}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
```

- [ ] **Step 2: Créer `src/components/quotes/QuoteReview.tsx`**

```tsx
"use client"

import type { SummarySection } from "@/features/quotes/core/types"

type QuoteReviewProps = {
  sections: SummarySection[]
  onEdit: (stepId: string) => void
}

export function QuoteReview({ sections, onEdit }: QuoteReviewProps) {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Vérifiez vos réponses avant l'envoi. Chaque section reste modifiable.
      </p>

      {sections.map((section) => (
        <section key={section.stepId}>
          <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
            <h3 className="font-display text-lg font-medium text-foreground">
              {section.title}
            </h3>
            <button
              type="button"
              onClick={() => onEdit(section.stepId)}
              className="shrink-0 text-sm text-primary underline-offset-4 hover:underline"
            >
              Modifier
            </button>
          </div>
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-[minmax(0,14rem)_1fr]">
            {section.rows.map((row, index) => (
              <div key={`${row.label}-${index}`} className="contents">
                <dt className="text-sm text-muted-foreground">{row.label}</dt>
                <dd className="text-sm text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Créer `src/components/quotes/QuoteSuccess.tsx`**

```tsx
import Link from "next/link"
import { CheckIcon, PhoneCall } from "lucide-react"

import { Button } from "@/components/ui/button"

export function QuoteSuccess({ email }: { email: string }) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <span
        aria-hidden
        className="mx-auto flex size-14 items-center justify-center rounded-full border border-primary/20 bg-primary/5"
      >
        <CheckIcon className="size-6 text-primary" />
      </span>
      <h2 className="mt-6 font-display text-3xl font-medium text-foreground">
        Votre demande est bien partie.
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Un récapitulatif vient d'être envoyé à {email}. Un conseiller vous
        recontacte sous deux jours ouvrables avec une proposition adaptée.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button asChild size="lg">
          <Link href="/services/particuliers">Retour aux assurances</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href="tel:+3242461363">
            <PhoneCall className="size-4" />
            +32 4 246 13 63
          </a>
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Créer `src/components/quotes/QuoteDraftBanner.tsx`**

```tsx
"use client"

import { Button } from "@/components/ui/button"

type QuoteDraftBannerProps = {
  savedAt: number
  onRestore: () => void
  onDiscard: () => void
}

export function QuoteDraftBanner({
  savedAt,
  onRestore,
  onDiscard,
}: QuoteDraftBannerProps) {
  const date = new Date(savedAt)
  const formatted = `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")} à ${String(date.getHours()).padStart(2, "0")}h${String(
    date.getMinutes()
  ).padStart(2, "0")}`

  return (
    <div
      role="status"
      className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"
    >
      <p className="text-sm text-foreground">
        Une demande commencée le {formatted} a été retrouvée sur cet appareil.
      </p>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={onRestore}>
          Reprendre
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDiscard}>
          Recommencer
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Créer `src/components/quotes/QuoteForm.tsx`**

```tsx
"use client"

import { useCallback, useRef, useState, useTransition } from "react"
import { FormProvider, useForm, type FieldValues } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { submitQuoteRequest } from "@/features/quotes/core/action"
import type { QuoteFormDefinition, QuoteStep } from "@/features/quotes/core/types"
import { useQuoteDraft } from "@/features/quotes/core/useQuoteDraft"

import { QuoteDraftBanner } from "./QuoteDraftBanner"
import { QuoteReview } from "./QuoteReview"
import { QuoteStepper } from "./QuoteStepper"
import { QuoteSuccess } from "./QuoteSuccess"

const REVIEW_TITLE = "Récapitulatif"

type QuoteFormProps<T extends FieldValues> = {
  definition: QuoteFormDefinition<T>
  steps: QuoteStep<T>[]
}

export function QuoteForm<T extends FieldValues>({
  definition,
  steps,
}: QuoteFormProps<T>) {
  const [stepIndex, setStepIndex] = useState(0)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const form = useForm<T>({
    resolver: zodResolver(definition.schema),
    defaultValues: definition.defaultValues,
    mode: "onTouched",
  })

  const { pendingDraft, restoreDraft, discardDraft, clearSavedDraft } =
    useQuoteDraft(definition.slug, form, stepIndex)

  // Le récapitulatif est fourni par le moteur, pas par le produit.
  const isReview = stepIndex === steps.length
  const stepTitles = [...steps.map((step) => step.title), REVIEW_TITLE]

  const goToStep = useCallback((index: number) => {
    setStepIndex(index)
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    // Le focus sur le titre fait annoncer le nouveau contexte aux lecteurs
    // d'écran ; `preventScroll` laisse le défilement doux se dérouler.
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  const handleNext = useCallback(async () => {
    const step = steps[stepIndex]
    if (!step) {
      return
    }

    const isStepValid = await form.trigger(step.fields, { shouldFocus: true })
    if (isStepValid) {
      goToStep(stepIndex + 1)
    }
  }, [form, goToStep, stepIndex, steps])

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await submitQuoteRequest(definition.slug, values)

      if (result.success) {
        clearSavedDraft()
        setSubmittedEmail(definition.recipientEmail(values))
      } else {
        toast.error(result.error)
      }
    })
  })

  if (submittedEmail) {
    return <QuoteSuccess email={submittedEmail} />
  }

  const StepComponent = isReview ? null : steps[stepIndex].Component
  const currentTitle = stepTitles[stepIndex]
  const currentDescription = isReview ? undefined : steps[stepIndex].description

  return (
    <div ref={containerRef} className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <QuoteStepper
            titles={stepTitles}
            currentIndex={stepIndex}
            onNavigate={goToStep}
          />
        </div>
      </div>

      <div className="lg:col-span-8">
        {pendingDraft ? (
          <QuoteDraftBanner
            savedAt={pendingDraft.savedAt}
            onRestore={() => goToStep(restoreDraft())}
            onDiscard={discardDraft}
          />
        ) : null}

        <FormProvider {...form}>
          <form
            onSubmit={onSubmit}
            onKeyDown={(event) => {
              // Entrée fait avancer d'une étape plutôt que soumettre, sauf
              // dans un champ multiligne et sauf sur le récapitulatif.
              const target = event.target as HTMLElement
              if (
                event.key === "Enter" &&
                !isReview &&
                target.tagName !== "TEXTAREA"
              ) {
                event.preventDefault()
                void handleNext()
              }
            }}
            noValidate
          >
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-2xl font-medium text-foreground outline-none md:text-3xl"
            >
              {currentTitle}
            </h2>
            {currentDescription ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {currentDescription}
              </p>
            ) : null}

            <div className="mt-8">
              {StepComponent ? (
                <StepComponent />
              ) : (
                <QuoteReview
                  sections={definition.summary(form.getValues())}
                  onEdit={(stepId) => {
                    const index = steps.findIndex((step) => step.id === stepId)
                    if (index >= 0) {
                      goToStep(index)
                    }
                  }}
                />
              )}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
              {stepIndex > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => goToStep(stepIndex - 1)}
                >
                  <ArrowLeft className="size-4" />
                  Retour
                </Button>
              ) : null}

              {isReview ? (
                <Button type="submit" size="lg" disabled={isPending}>
                  {isPending ? "Envoi en cours…" : "Envoyer ma demande"}
                  {isPending ? null : <Send className="size-4" />}
                </Button>
              ) : (
                <Button type="button" size="lg" onClick={handleNext}>
                  Continuer
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Vérifier la compilation**

Run: `npx tsc --noEmit && npm run lint`
Expected: aucune erreur

- [ ] **Step 7: Commit**

```bash
git add src/components/quotes/
git commit -m "Add multi-step quote form engine"
```

---

## Task 10: Étapes de l'assistance voyage

**Files:**
- Create: `src/features/quotes/assistance-voyage/steps.tsx`, `src/features/quotes/assistance-voyage/AssistanceVoyageForm.tsx`, `src/components/quotes/quote-forms.tsx`

**Interfaces:**
- Consumes: tous les composants de champ (Task 7), `QuoteForm` (Task 9), `assistanceVoyageDefinition` (Task 5), énumérations et libellés (Task 2)
- Produces: `assistanceVoyageSteps: QuoteStep<AssistanceVoyageValues>[]` · `AssistanceVoyageForm` · `QuoteFormBySlug({ slug })`

Les identifiants d'étape (`trip`, `insured`, `holder`, `contact`) doivent
correspondre exactement aux `stepId` de `summary.ts`, sinon le lien
« Modifier » du récapitulatif ne trouve pas son étape.

- [ ] **Step 1: Créer `src/features/quotes/assistance-voyage/steps.tsx`**

```tsx
"use client"

import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"

import { BooleanField } from "@/components/quotes/fields/BooleanField"
import { MaskedDateField } from "@/components/quotes/fields/MaskedDateField"
import { OptionCardGroup } from "@/components/quotes/fields/OptionCardGroup"
import { PersonFields } from "@/components/quotes/fields/PersonFields"
import { TextField, getFieldError } from "@/components/quotes/fields/TextField"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import type { QuoteStep } from "@/features/quotes/core/types"

import {
  MAX_ADDITIONAL_INSURED,
  coverageDurationLabels,
  coverageDurations,
  destinationLabels,
  destinations,
  type AssistanceVoyageValues,
} from "./schema"

const emptyPerson = {
  firstName: "",
  lastName: "",
  birthDate: "",
  gender: "" as AssistanceVoyageValues["holder"]["gender"],
}

function TripStep() {
  const { control, setValue } = useFormContext<AssistanceVoyageValues>()
  const coverageDuration = useWatch({ control, name: "coverageDuration" })
  const insureVehicle = useWatch({ control, name: "insureVehicle" })

  return (
    <div className="flex flex-col gap-8">
      <OptionCardGroup
        name="destination"
        label="Où voyagez-vous ?"
        options={destinations.map((value) => ({
          value,
          label: destinationLabels[value],
        }))}
      />

      <OptionCardGroup
        name="coverageDuration"
        label="Durée de la couverture"
        options={coverageDurations.map((value) => ({
          value,
          label: coverageDurationLabels[value],
          description:
            value === "annual"
              ? "Tous vos voyages de l'année sont couverts."
              : "Un seul voyage, sur des dates précises.",
        }))}
        columns={2}
      />

      {coverageDuration === "period" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MaskedDateField name="periodStart" label="Départ le" />
          <MaskedDateField name="periodEnd" label="Retour le" />
        </div>
      ) : null}

      <TextField
        name="tripValue"
        label="Valeur du voyage (€)"
        description="Coût total pour l'ensemble des voyageurs."
        placeholder="2500"
        inputMode="numeric"
      />

      <BooleanField
        name="insureVehicle"
        label="Faut-il assurer un véhicule ?"
        onChanged={(value) => {
          // Sans ce nettoyage, une réponse abandonnée partirait dans l'e-mail.
          if (!value) {
            setValue("vehicleFirstRegistration", "")
          }
        }}
      />

      {insureVehicle ? (
        <MaskedDateField
          name="vehicleFirstRegistration"
          label="Date de première mise en circulation"
        />
      ) : null}
    </div>
  )
}

function InsuredStep() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<AssistanceVoyageValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalInsured",
  })
  const hasAdditionalInsured = useWatch({
    control,
    name: "hasAdditionalInsured",
  })
  const listError = getFieldError(errors, "additionalInsured")

  return (
    <div className="flex flex-col gap-8">
      <BooleanField
        name="insureHolder"
        label="Êtes-vous vous-même assuré(e) ?"
        description="Le preneur d'assurance n'est pas toujours l'un des voyageurs."
      />

      <BooleanField
        name="hasAdditionalInsured"
        label="Faut-il assurer d'autres personnes ?"
        onChanged={(value) => {
          if (value) {
            // Une première carte évite un état vide sans indication.
            setValue("additionalInsured", [emptyPerson])
          } else {
            setValue("additionalInsured", [])
          }
        }}
      />

      {hasAdditionalInsured ? (
        <div className="flex flex-col gap-6">
          {fields.map((field, index) => (
            <FieldSet
              key={field.id}
              className="rounded-xl border border-border p-5"
            >
              <div className="flex items-baseline justify-between gap-4">
                <FieldLegend className="mb-0">
                  Assuré supplémentaire {index + 1}
                </FieldLegend>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                  Retirer
                </Button>
              </div>
              <PersonFields prefix={`additionalInsured.${index}`} />
            </FieldSet>
          ))}

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => append(emptyPerson)}
              disabled={fields.length >= MAX_ADDITIONAL_INSURED}
            >
              <Plus className="size-4" />
              Ajouter une personne
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">
              {MAX_ADDITIONAL_INSURED} personnes supplémentaires au maximum.
            </p>
            <FieldError errors={[listError]} className="mt-2" />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function HolderStep() {
  return (
    <div className="flex flex-col gap-10">
      <FieldSet>
        <FieldLegend>Identité</FieldLegend>
        <PersonFields prefix="holder" autoCompleteScope />
      </FieldSet>

      <FieldSet>
        <FieldLegend>Adresse légale</FieldLegend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
          <TextField name="holder.street" label="Rue" autoComplete="address-line1" />
          <TextField
            name="holder.streetNumber"
            label="N° / Boîte"
            autoComplete="address-line2"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
          <TextField
            name="holder.postalCode"
            label="Code postal"
            inputMode="numeric"
            autoComplete="postal-code"
          />
          <TextField
            name="holder.city"
            label="Localité"
            autoComplete="address-level2"
          />
        </div>
      </FieldSet>
    </div>
  )
}

function ContactStep() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<AssistanceVoyageValues>()
  const consentError = getFieldError(errors, "consent")

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          name="email"
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
        />
        <TextField
          name="phone"
          label="Téléphone (facultatif)"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
        />
      </div>

      <Field>
        <FieldLabel htmlFor="message">
          Une précision à nous transmettre ? (facultatif)
        </FieldLabel>
        <FieldContent>
          <Textarea id="message" rows={4} {...register("message")} />
        </FieldContent>
      </Field>

      <Field orientation="horizontal" data-invalid={!!consentError}>
        <Controller
          control={control}
          name="consent"
          render={({ field }) => (
            <Checkbox
              id="consent"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              aria-invalid={!!consentError}
            />
          )}
        />
        <FieldContent>
          <FieldLabel htmlFor="consent" className="font-normal">
            J'accepte que Martens Assurances traite mes données pour répondre à
            cette demande.
          </FieldLabel>
          <FieldError errors={[consentError]} />
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
    </div>
  )
}

export const assistanceVoyageSteps: QuoteStep<AssistanceVoyageValues>[] = [
  {
    id: "trip",
    title: "Votre voyage",
    description:
      "Commençons par le voyage lui-même : où, combien de temps, et pour quel montant.",
    fields: [
      "destination",
      "coverageDuration",
      "periodStart",
      "periodEnd",
      "tripValue",
      "insureVehicle",
      "vehicleFirstRegistration",
    ],
    Component: TripStep,
  },
  {
    id: "insured",
    title: "Les personnes assurées",
    description: "Qui doit être couvert pendant ce voyage ?",
    fields: ["insureHolder", "hasAdditionalInsured", "additionalInsured"],
    Component: InsuredStep,
  },
  {
    id: "holder",
    title: "Le preneur d'assurance",
    description: "La personne qui souscrit le contrat.",
    fields: ["holder"],
    Component: HolderStep,
  },
  {
    id: "contact",
    title: "Vos coordonnées",
    description: "Pour vous transmettre votre proposition.",
    fields: ["email", "phone", "message", "consent"],
    Component: ContactStep,
  },
]
```

- [ ] **Step 2: Vérifier que `fields: ["holder"]` couvre bien les sous-champs**

`trigger("holder")` valide l'objet entier, et `get(errors, "holder")` trouve
les erreurs de ses sous-champs : une seule entrée suffit. Idem pour
`additionalInsured`, dont les erreurs d'éléments sont indexées.

- [ ] **Step 3: Créer `src/features/quotes/assistance-voyage/AssistanceVoyageForm.tsx`**

```tsx
"use client"

import { QuoteForm } from "@/components/quotes/QuoteForm"

import { assistanceVoyageDefinition } from "./definition"
import { assistanceVoyageSteps } from "./steps"

export function AssistanceVoyageForm() {
  return (
    <QuoteForm
      definition={assistanceVoyageDefinition}
      steps={assistanceVoyageSteps}
    />
  )
}
```

- [ ] **Step 4: Créer `src/components/quotes/quote-forms.tsx`**

```tsx
"use client"

import type { ComponentType } from "react"

import { AssistanceVoyageForm } from "@/features/quotes/assistance-voyage/AssistanceVoyageForm"
import type { QuoteSlug } from "@/features/quotes/core/meta"

/**
 * Registre client : une définition ne franchit pas la frontière RSC, la page
 * ne peut donc pas la passer en prop. Elle transmet le slug, et ce module
 * résout le composant.
 */
const quoteFormComponents: Record<QuoteSlug, ComponentType> = {
  "assistance-voyage": AssistanceVoyageForm,
}

export function QuoteFormBySlug({ slug }: { slug: QuoteSlug }) {
  const Form = quoteFormComponents[slug]
  return <Form />
}
```

- [ ] **Step 5: Vérifier la compilation**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: aucune erreur, tests au vert

- [ ] **Step 6: Commit**

```bash
git add src/features/quotes/ src/components/quotes/
git commit -m "Add travel assistance form steps"
```

---

## Task 11: Routes /devis

**Files:**
- Create: `src/app/(app)/devis/page.tsx`, `src/app/(app)/devis/[produit]/page.tsx`

**Interfaces:**
- Consumes: `quoteFormsMeta`, `quoteFormSlugs`, `isQuoteSlug` (Task 5), `QuoteFormBySlug` (Task 10), `PageHeader` (`@/components/page-header`), `breadcrumbSchema` (`@/lib/structured-data`), `JsonLd` (`@/components/seo/JsonLd`)
- Produces: les routes `/devis` et `/devis/[produit]`

- [ ] **Step 1: Créer le hub `src/app/(app)/devis/page.tsx`**

```tsx
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { JsonLd } from "@/components/seo/JsonLd"
import { quoteFormsMeta, quoteFormSlugs } from "@/features/quotes/core/meta"
import { breadcrumbSchema } from "@/lib/structured-data"

export const metadata = {
  title: "Demande de devis — Martens Assurances",
  description:
    "Demandez un devis gratuit et sans engagement. Vous recevez une proposition adaptée, comparée entre nos partenaires.",
  alternates: { canonical: "/devis" },
}

export default function Page() {
  return (
    <main>
      <JsonLd data={breadcrumbSchema([{ name: "Devis", path: "/devis" }])} />
      <PageHeader
        eyebrow="Demande de devis"
        title="Une proposition sur mesure, sans engagement."
        description="Répondez à quelques questions et nous comparons les couvertures de nos partenaires pour vous."
        image={{
          src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80&fm=jpg",
          alt: "Personne consultant des documents avec une calculatrice",
        }}
      />
      <div className="container py-16 lg:py-20">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quoteFormSlugs.map((slug) => {
            const meta = quoteFormsMeta[slug]

            return (
              <li key={slug}>
                <Link
                  href={`/devis/${slug}`}
                  className="group/card flex h-full flex-col rounded-2xl border border-border p-6 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <h2 className="font-display text-xl font-medium text-foreground">
                    {meta.eyebrow}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {meta.intro}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    Commencer
                    <ArrowRight className="size-4 transition-transform group-hover/card:translate-x-1" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Créer `src/app/(app)/devis/[produit]/page.tsx`**

`params` est un `Promise` dans cette version de Next : il faut l'attendre.

```tsx
import { notFound } from "next/navigation"

import { PageHeader } from "@/components/page-header"
import { QuoteFormBySlug } from "@/components/quotes/quote-forms"
import { JsonLd } from "@/components/seo/JsonLd"
import {
  isQuoteSlug,
  quoteFormSlugs,
  quoteFormsMeta,
} from "@/features/quotes/core/meta"
import { breadcrumbSchema } from "@/lib/structured-data"

type PageProps = {
  params: Promise<{ produit: string }>
}

export function generateStaticParams() {
  return quoteFormSlugs.map((produit) => ({ produit }))
}

// Tout slug hors registre donne un 404 plutôt qu'un rendu à la demande.
export const dynamicParams = false

export async function generateMetadata({ params }: PageProps) {
  const { produit } = await params

  if (!isQuoteSlug(produit)) {
    return {}
  }

  const meta = quoteFormsMeta[produit]

  return {
    title: meta.metaTitle,
    description: meta.metaDescription,
    alternates: { canonical: `/devis/${produit}` },
  }
}

export default async function Page({ params }: PageProps) {
  const { produit } = await params

  if (!isQuoteSlug(produit)) {
    notFound()
  }

  const meta = quoteFormsMeta[produit]

  return (
    <main>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Devis", path: "/devis" },
          { name: meta.eyebrow, path: `/devis/${produit}` },
        ])}
      />
      <PageHeader
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.intro}
        image={meta.image}
      />
      <div className="container pb-20 lg:pb-24">
        <QuoteFormBySlug slug={produit} />
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Vérifier la compilation et lancer le site**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: le build liste `/devis` et `/devis/assistance-voyage` comme routes générées

- [ ] **Step 4: Vérification manuelle du parcours**

Run: `npm run dev`, puis ouvrir `http://localhost:3000/devis/assistance-voyage`

Vérifier, dans l'ordre :
1. « Continuer » sans rien remplir affiche les erreurs de l'étape 1 seulement — aucune erreur des étapes suivantes ne doit apparaître.
2. Choisir « Une période » fait apparaître les deux champs de dates.
3. Taper `01072099` dans « Départ le » produit `01/07/2099`.
4. Répondre « Oui » à « Faut-il assurer un véhicule ? » fait apparaître la date de mise en circulation ; repasser à « Non » la fait disparaître.
5. À l'étape 2, « Oui » à « d'autres personnes » ajoute une carte ; le bouton « Ajouter » se désactive à quatre.
6. Le stepper permet de revenir à une étape passée, pas d'en sauter une.
7. Le récapitulatif affiche les sections dans l'ordre preneur, assurés, voyage, coordonnées ; « Modifier » ramène à la bonne étape.
8. Recharger la page en cours de saisie fait apparaître le bandeau de reprise ; « Reprendre » restaure les valeurs et l'étape ; le consentement, lui, reste décoché.
9. Naviguer tout le formulaire au clavier uniquement.
10. Vérifier le rendu à 375 px de large : barre de progression visible, aucun débordement horizontal.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(app)/devis/"
git commit -m "Add /devis hub and product quote routes"
```

---

## Task 12: Raccordement au reste du site

**Files:**
- Modify: `src/app/(app)/services/particuliers/page.tsx`, `src/components/home/Header.tsx`, `src/components/home/Footer.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `next.config.ts`

**Interfaces:**
- Consumes: la route `/devis` (Task 11)
- Produces: rien de programmatique

- [ ] **Step 1: Ajouter le lien de devis sur la page Particuliers**

Dans `src/app/(app)/services/particuliers/page.tsx`, remplacer la constante
`coverages` par :

```tsx
const coverages = [
  { icon: Car, name: "Auto / moto", note: "assurer vos véhicules" },
  { icon: House, name: "Habitation", note: "incendie, vol, dégâts des eaux" },
  { icon: Users, name: "Famille", note: "responsabilité civile vie privée" },
  { icon: HeartPulse, name: "Santé", note: "hospitalisation et soins" },
  {
    icon: LifeBuoy,
    name: "Assistance",
    note: "voyage, rapatriement",
    // Les autres couvertures recevront ce champ quand leur formulaire existera.
    quote: { href: "/devis/assistance-voyage", label: "Demander un devis" },
  },
]
```

(La faute de frappe « rappatriement » est corrigée au passage.)

Puis, dans le `<div className="min-w-0">` de chaque ligne, après le
paragraphe `item.note`, ajouter :

```tsx
                {item.quote ? (
                  <Link
                    href={item.quote.href}
                    className="group/quote mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {item.quote.label}
                    <ArrowRight className="size-3.5 transition-transform group-hover/quote:translate-x-0.5" />
                  </Link>
                ) : null}
```

`Link` et `ArrowRight` sont déjà importés dans ce fichier.

- [ ] **Step 2: Réactiver le bouton d'en-tête**

Dans `src/components/home/Header.tsx`, remplacer le bloc commenté
(`{/* <div className="flex items-center gap-6"> … */}`) par :

```tsx
        <div className="flex items-center gap-6">
          <Button asChild>
            <Link href="/devis">Demander un devis</Link>
          </Button>
        </div>
```

`Button` et `Link` sont déjà importés dans ce fichier — vérifié.

- [ ] **Step 3: Réactiver l'entrée de pied de page**

Dans `src/components/home/Footer.tsx`, remplacer la ligne commentée
`// { label: "Demande de simulation", href: "/simulation" },` par :

```ts
  { label: "Demande de devis", href: "/devis" },
```

- [ ] **Step 4: Ajouter les routes au sitemap**

Dans `src/app/sitemap.ts`, ajouter `"/devis"` et `"/devis/assistance-voyage"`
à `staticRoutes`, après `"/contact"`.

Puis remplacer les lignes du commentaire de tête allant de
`* Pages statiques indexables.` à la ligne `/studio` incluse par :

```
 * Pages statiques indexables.
 *
 * Volontairement exclu :
 * - /studio : interface d'administration Sanity
```

Le reste du commentaire (le paragraphe sur `lastModified`) est inchangé.

- [ ] **Step 5: Nettoyer robots.ts**

Dans `src/app/robots.ts`, supprimer le paragraphe de commentaire devenu sans
objet :

```
      //
      // /simulation n'est PAS listée ici volontairement : elle est en
      // `noindex` via ses metadata, et bloquer son exploration empêcherait
      // Google de lire cette directive — l'URL pourrait alors rester
      // indexée sans son contenu.
```

Les deux lignes qui décrivent `/studio` et `/api/` restent inchangées.

- [ ] **Step 6: Rediriger l'ancienne URL**

Dans `next.config.ts`, ajouter à la fin du tableau retourné par `redirects()` :

```ts
      // L'ancienne page de simulation a été remplacée par /devis ; l'URL a pu
      // être partagée avant sa suppression.
      { source: "/simulation", destination: "/devis", permanent: true },
```

- [ ] **Step 7: Vérifier l'ensemble**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: aucune erreur

- [ ] **Step 8: Vérification manuelle du raccordement**

Run: `npm run dev`

1. `http://localhost:3000/simulation` redirige vers `/devis`
2. Le bouton « Demander un devis » de l'en-tête mène à `/devis`
3. Le lien du pied de page mène à `/devis`
4. Sur `/services/particuliers`, la ligne « Assistance » affiche le lien vers le formulaire
5. `http://localhost:3000/sitemap.xml` contient les deux nouvelles URL
6. `http://localhost:3000/devis/inconnu` renvoie un 404

- [ ] **Step 9: Envoyer une demande de bout en bout**

Avec `SMTP_*` et `CONTACT_EMAIL_TO` configurés dans `.env.local`, remplir le
formulaire entièrement et l'envoyer. Vérifier :

1. L'écran de confirmation remplace le formulaire
2. L'agence reçoit un e-mail avec les sections dans l'ordre preneur, assurés, voyage, coordonnées
3. Le prospect reçoit l'accusé de réception
4. Le `Reply-To` de l'e-mail agence est l'adresse du prospect
5. Recharger la page ne propose plus de brouillon
6. Un champ conditionnel abandonné (véhicule passé de « Oui » à « Non ») n'apparaît pas dans l'e-mail

- [ ] **Step 10: Commit**

```bash
git add "src/app/(app)/services/particuliers/page.tsx" \
  src/components/home/Header.tsx \
  src/components/home/Footer.tsx \
  src/app/sitemap.ts \
  src/app/robots.ts \
  next.config.ts
git commit -m "Wire /devis into navigation, sitemap and redirects"
```

---

## Vérification finale

- [ ] `npm run lint` sans erreur
- [ ] `npx tsc --noEmit` sans erreur
- [ ] `npm test` au vert (49 tests attendus)
- [ ] `npm run build` sans erreur, `/devis` et `/devis/assistance-voyage` prérendues
- [ ] `node scripts/check-redirects.mjs` toujours au vert (le script ne couvre pas `/simulation`, vérifiée manuellement à la Task 12)
