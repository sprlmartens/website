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
