import { describe, expect, it } from "vitest"

import {
  belgianPhone,
  formatEuroAmount,
  parseEuroAmount,
  parseFrenchDate,
  pastDate,
  whenFieldsValid,
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

describe("pastDate", () => {
  const schema = pastDate()

  it("accepte une date passée", () => {
    expect(schema.safeParse("15/03/2010").success).toBe(true)
  })

  it("refuse une date dans le futur", () => {
    const nextYear = new Date().getUTCFullYear() + 1
    expect(schema.safeParse(`01/01/${nextYear}`).success).toBe(false)
  })

  it("refuse une date plus ancienne que 120 ans", () => {
    expect(schema.safeParse("01/01/1850").success).toBe(false)
  })

  it("refuse un format incorrect", () => {
    expect(schema.safeParse("2010-03-15").success).toBe(false)
    expect(schema.safeParse("").success).toBe(false)
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

describe("whenFieldsValid", () => {
  const when = whenFieldsValid("periodStart", "periodEnd")

  it("autorise la règle sans aucune erreur", () => {
    expect(when({ issues: [] })).toBe(true)
  })

  it("bloque la règle si un champ lu est en erreur", () => {
    expect(when({ issues: [{ path: ["periodEnd"] }] })).toBe(false)
  })

  it("ignore les erreurs des autres champs", () => {
    expect(when({ issues: [{ path: ["holder", "gender"] }] })).toBe(true)
  })
})
