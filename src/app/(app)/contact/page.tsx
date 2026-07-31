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
            <div className="relative h-96 w-full overflow-hidden rounded-3xl">
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
