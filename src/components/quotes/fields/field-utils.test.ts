import { describe, expect, it } from "vitest"

import { getFieldError, maskDate } from "@/components/quotes/fields/field-utils"

describe("maskDate", () => {
  it("laisse passer une date déjà formatée collée en une fois", () => {
    expect(maskDate("15/03/1985")).toBe("15/03/1985")
  })

  it("insère les séparateurs sur un collage de chiffres seuls", () => {
    expect(maskDate("15031985")).toBe("15/03/1985")
  })

  it("insère les séparateurs au fil de la saisie chiffre par chiffre", () => {
    expect(maskDate("1")).toBe("1")
    expect(maskDate("15")).toBe("15")
    expect(maskDate("150")).toBe("15/0")
    expect(maskDate("1503")).toBe("15/03")
    expect(maskDate("15031")).toBe("15/03/1")
  })

  it("tronque au-delà de 8 chiffres", () => {
    expect(maskDate("123456789")).toBe("12/34/5678")
  })

  it("ignore les caractères non numériques", () => {
    expect(maskDate("15a03b1985")).toBe("15/03/1985")
  })

  it(
    "retire le chiffre précédent le curseur quand le Retour arrière " +
      "supprime un « / » inséré automatiquement (sans quoi la touche ne " +
      "produirait aucun changement)",
    () => {
      // Le curseur était juste après le premier « / » : « 15/|03/1985 ».
      // Le navigateur a déjà supprimé ce séparateur, donnant "1503/1985"
      // avec un curseur en position 2.
      const result = maskDate("1503/1985", {
        previous: "15/03/1985",
        caret: 2,
      })

      // Les chiffres inchangés (« 15031985 ») ne doivent pas se reformater
      // à l'identique : un chiffre a bien été retiré.
      expect(result).not.toBe("15/03/1985")
      expect(result.replace(/\D/g, "")).toHaveLength(7)
    }
  )

  it("retire le bon chiffre lors d'un Retour arrière sur le second séparateur", () => {
    // Curseur juste après le second « / » : « 15/03/|1985 ».
    const result = maskDate("15/031985", {
      previous: "15/03/1985",
      caret: 5,
    })

    expect(result).not.toBe("15/03/1985")
    expect(result.replace(/\D/g, "")).toHaveLength(7)
  })

  it(
    "laisse la suppression normale d'un chiffre en fin de chaîne " +
      "fonctionner, sans déclencher la correction du séparateur",
    () => {
      // Cas déjà correct avant le correctif : un chiffre disparaît
      // vraiment (le nombre de chiffres diminue), donc `deletion` ne doit
      // rien changer au comportement normal.
      const result = maskDate("15/03/198", {
        previous: "15/03/1985",
        caret: 9,
      })

      expect(result).toBe("15/03/198")
    }
  )
})

describe("getFieldError", () => {
  it("lit une erreur à un chemin plat", () => {
    const errors = { email: { type: "invalid", message: "Email invalide." } }
    expect(getFieldError(errors, "email")).toEqual({
      type: "invalid",
      message: "Email invalide.",
    })
  })

  it("lit une erreur à un chemin imbriqué", () => {
    const errors = {
      holder: { city: { type: "too_small", message: "Ville requise." } },
    }
    expect(getFieldError(errors, "holder.city")).toEqual({
      type: "too_small",
      message: "Ville requise.",
    })
  })

  it("lit une erreur sur un chemin de tableau de champs", () => {
    const errors = {
      additionalInsured: [
        undefined,
        { firstName: { type: "too_small", message: "Prénom requis." } },
      ],
    }
    expect(
      getFieldError(errors, "additionalInsured.1.firstName")
    ).toEqual({ type: "too_small", message: "Prénom requis." })
  })

  it("renvoie undefined quand un nœud intermédiaire est absent", () => {
    const errors = { holder: undefined }
    expect(getFieldError(errors, "holder.city")).toBeUndefined()
    expect(getFieldError({}, "holder.city")).toBeUndefined()
  })

  it("renvoie undefined quand il n'y a aucune erreur sur ce chemin", () => {
    const errors = { holder: { city: undefined } }
    expect(getFieldError(errors, "holder.city")).toBeUndefined()
  })

  it(
    "ne confond pas un nœud intermédiaire avec une feuille quand le " +
      "schéma a lui-même un champ nommé « message »",
    () => {
      // Piège reproduit lors de la revue : `errors.contact` n'est pas une
      // feuille react-hook-form mais un sous-objet d'erreurs qui possède,
      // par coïncidence de nommage, sa propre clé « message ». Avant le
      // correctif, `getFieldError(errors, "contact")` renvoyait ce
      // sous-objet en le prenant pour la feuille, et `FieldError` aurait
      // tenté d'afficher un objet comme enfant React.
      const errors = {
        contact: {
          message: { type: "too_big", message: "Trop long." },
        },
      }

      expect(getFieldError(errors, "contact")).toBeUndefined()
      expect(getFieldError(errors, "contact.message")).toEqual({
        type: "too_big",
        message: "Trop long.",
      })
    }
  )
})
