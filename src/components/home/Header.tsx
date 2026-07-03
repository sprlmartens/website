import Link from "next/link"
import { PhoneCall } from "lucide-react"

const navItems = [
  { label: "Particuliers", href: "#particuliers" },
  { label: "Indépendants", href: "#independants" },
  { label: "Entreprises", href: "#entreprises" },
  { label: "Sinistre", href: "#sinistre" },
  { label: "Contact", href: "#contact" },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-white/90 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between md:h-20">
        <Link href="/">
          <span className="font-display text-2xl font-semibold tracking-tight text-primary">
            Martens
          </span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-7 lg:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rule-sweep text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="tel:+3242461363"
          className="text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          <PhoneCall className="mr-2 inline-block h-4 w-4" />
          +32&nbsp;4&nbsp;246&nbsp;13&nbsp;63
        </Link>
      </div>
    </header>
  )
}
