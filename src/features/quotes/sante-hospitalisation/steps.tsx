"use client"

import { useFormContext } from "react-hook-form"

import { BooleanField } from "@/components/quotes/fields/BooleanField"
import type { QuoteStep } from "@/features/quotes/core/types"
import {
  ContactStep,
  HolderStep,
  InsuredStep as SharedInsuredStep,
} from "@/features/quotes/shared/steps"

import type { SanteHospitalisationValues } from "./schema"

function CoverageStep() {
  const { getFieldState, trigger } =
    useFormContext<SanteHospitalisationValues>()

  // L'erreur « au moins une couverture » est portée par `coverDental` mais
  // dépend des trois réponses : un « Oui » ailleurs doit aussi l'effacer.
  function revalidateGroup() {
    if (getFieldState("coverDental").error) {
      void trigger("coverDental")
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <BooleanField
        name="coverHospitalisation"
        label="Couvrir les frais d’hospitalisation et les frais médicaux liés à une opération ?"
        onChanged={revalidateGroup}
      />
      <BooleanField
        name="coverMedicalCare"
        label="Couvrir les frais médicaux courants toute l’année ?"
        description="Visites chez le médecin, médicaments prescrits…"
        onChanged={revalidateGroup}
      />
      <BooleanField name="coverDental" label="Couvrir les frais dentaires ?" />
    </div>
  )
}

function InsuredStep() {
  return (
    <SharedInsuredStep holderDescription="Le preneur d’assurance n’est pas toujours l’une des personnes couvertes." />
  )
}

export const santeHospitalisationSteps: QuoteStep<SanteHospitalisationValues>[] =
  [
    {
      id: "coverage",
      title: "Vos besoins",
      description:
        "Quelles couvertures souhaitez-vous souscrire ? Choisissez-en au moins une.",
      fields: ["coverHospitalisation", "coverMedicalCare", "coverDental"],
      Component: CoverageStep,
    },
    {
      id: "insured",
      title: "Les personnes assurées",
      description: "Qui doit être couvert par ce contrat ?",
      fields: ["insureHolder", "hasAdditionalInsured", "additionalInsured"],
      Component: InsuredStep,
    },
    {
      id: "holder",
      title: "Le preneur d’assurance",
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
