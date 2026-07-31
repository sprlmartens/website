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
        <div>
          <dt className="font-semibold uppercase tracking-[0.14em]">
            Fermeture annuelle
          </dt>
          <dd className="mt-1 leading-relaxed text-foreground/70">
            Aucune période de fermeture annuelle : nous sommes disponibles
            toute l&apos;année.
          </dd>
        </div>
        <div>
          <dt className="font-semibold uppercase tracking-[0.14em]">
            Accessibilité
          </dt>
          <dd className="mt-1 leading-relaxed text-foreground/70">
            Place de parking réservée à nos clients devant le bureau.
          </dd>
        </div>
      </dl>
    </div>
  )
}
