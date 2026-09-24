"use client"

import { TextField } from "./TextField"

/**
 * Bloc adresse, réutilisé pour le preneur et pour le conducteur principal
 * d'un devis auto. `prefix` est le chemin RHF du bloc, par exemple
 * « holder » ou « mainDriver ».
 */
export function AddressFields({
  prefix,
  autoCompleteScope = false,
}: {
  prefix: string
  /** N'active l'autofill navigateur que pour le preneur. */
  autoCompleteScope?: boolean
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
        <TextField
          name={`${prefix}.street`}
          label="Rue"
          autoComplete={autoCompleteScope ? "address-line1" : "off"}
        />
        <TextField
          name={`${prefix}.streetNumber`}
          label="N° / Boîte"
          autoComplete={autoCompleteScope ? "address-line2" : "off"}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
        <TextField
          name={`${prefix}.postalCode`}
          label="Code postal"
          inputMode="numeric"
          autoComplete={autoCompleteScope ? "postal-code" : "off"}
        />
        <TextField
          name={`${prefix}.city`}
          label="Localité"
          autoComplete={autoCompleteScope ? "address-level2" : "off"}
        />
      </div>
    </>
  )
}
