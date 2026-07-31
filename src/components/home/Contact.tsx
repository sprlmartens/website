import ScheduleTimeline from "@/components/contact/ScheduleTimeline"

export default function Contact() {
  return (
    <section id="contact" className="scroll-mt-32 bg-secondary text-foreground">
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
