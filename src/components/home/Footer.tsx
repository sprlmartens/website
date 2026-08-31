import Image from "next/image"
import Link from "next/link"
import { Mail, MapPin, PhoneCall, Printer } from "lucide-react"

const mainNav = [
  { label: "À propos", href: "/a-propos" },
  { label: "Partenaires", href: "/partenaires" },
  { label: "Sinistres", href: "/sinistres" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "Demande de devis", href: "/devis" },
]

const services = [
  { label: "Particuliers", href: "/services/particuliers" },
  { label: "Professionnels", href: "/services/professionnels" },
  { label: "Placements & Épargne", href: "/services/placements-epargne" },
]

const legalLinks = [
  { label: "Informations juridiques", href: "/Info-societe-et-services.pdf" },
  {
    label: "Règles de conduite AssurMiFID",
    href: "https://www.fsma.be/fr/regles-de-conduite-mifid",
  },
  {
    label: "Conditions générales en assurances",
    href: "https://app.sectorcatalog.be/SectorCatalog/public?language=FR",
  },
]

const quickLinks = [
  { label: "My Broker", href: "https://www.mybroker.be/?o=55937" },
  {
    label: "Procédure immat. véhicule étranger",
    href: "https://div-info.be/immatriculation/importation-dun-vehicule-etranger/",
  },
]

export default function Footer() {
  return (
    <footer className="bg-white text-foreground border-t border-border">
      <div className="container py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Image
              src="/martens-assurances-logo.png"
              alt="Martens Assurances &amp; Placements"
              width={300}
              height={100}
              className="h-22 w-auto"
            />
            <p className="mt-5 max-w-sm text-sm leading-relaxed">
              Courtier indépendant en assurances et en placements, au service
              des familles, des indépendants et des entreprises depuis plus de
              20 ans.
            </p>
            <ul className="mt-5 space-y-2 text-sm leading-relaxed">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  Rue François Lefebvre 10/B
                  <br />
                  4000 Rocourt (Liège)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 shrink-0 text-primary" />
                <a href="tel:+3242461363">+32 4 246 13 63</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a href="mailto:assurances@sprlmartens.be">
                  assurances@sprlmartens.be
                </a>
              </li>
            </ul>
            <a
              href="https://www.facebook.com/sprlmartens/?ref=bookmarks"
              target="_blank"
              rel="noreferrer"
              aria-label="Martens Assurances sur Facebook"
              className="mt-6 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-primary transition-colors hover:border-primary"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="size-6"
              >
                <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.87.24-1.46 1.49-1.46H16.5V4.36C16.24 4.32 15.36 4.25 14.33 4.25c-2.15 0-3.63 1.31-3.63 3.72V10.5H8.19v3h2.51V21h2.8Z" />
              </svg>
            </a>
            <div className="mt-6 flex items-center gap-6">
              <Image
                src="/feprabel-logo.svg"
                alt="Feprabel"
                width={120}
                height={60}
                className="h-13 w-auto"
              />
              <a
                href="https://www.courtierenassurances.be/brokers/3975"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="My Broker"
              >
                <Image
                  src="/mybroker-logo.png"
                  alt="My Broker"
                  width={140}
                  height={80}
                  className="h-16 w-auto"
                />
              </a>
            </div>
          </div>

          <div className="md:col-span-7 flex flex-col md:flex-row justify-between gap-8">
            <nav aria-label="Navigation">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                Navigation
              </p>
              <ul className="mt-5 space-y-3.5">
                {mainNav.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="rule-sweep inline-block text-sm font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Nos services">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                Services
              </p>
              <ul className="mt-5 space-y-3.5">
                {services.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="rule-sweep inline-block text-sm font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Liens rapides">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                Liens rapides
              </p>
              <ul className="mt-5 space-y-3.5">
                {quickLinks.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rule-sweep inline-block text-sm font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-5 border-t border-border pt-6 text-sm text-foreground">
          <nav
            aria-label="Mentions légales"
            className="flex flex-wrap gap-x-8 gap-y-2"
          >
            {legalLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rule-sweep inline-block text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col justify-between gap-2 sm:flex-row">
            <p>© {new Date().getFullYear()} Martens SPRL</p>
            <p>Courtier en assurances agréé FSMA n° 065799&nbsp;A</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
