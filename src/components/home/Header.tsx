import Link from "next/link"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import Image from "next/image"

import TopBar from "@/components/home/TopBar"

const servicesSubNav = [
  { label: "Particuliers", href: "/services/particuliers" },
  { label: "Professionnels", href: "/services/professionnels" },
  { label: "Placements & Épargne", href: "/services/placements-epargne" },
]

const navItems = [
  { label: "À propos", href: "/a-propos" },
  { label: "Services", href: "/services", children: servicesSubNav },
  { label: "Sinistres", href: "/sinistres" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-white">
      <TopBar />
      <div className="container flex h-16 items-center justify-between gap-6 md:h-20">
        <Link href="/">
          <Image
            src="/martens-assurances-logo.png"
            alt="Martens Assurances &amp; Placements"
            width={300}
            height={100}
            className="h-14 md:h-18 w-auto"
          />
        </Link>
        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-7 lg:flex"
        >
          {navItems.map((item) =>
            item.children ? (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Link>
                <div className="invisible absolute left-1/2 top-full z-10 w-64 -translate-x-1/2 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                  <ul className="rounded-xl border border-border bg-white p-2 shadow-lg">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="rule-sweep text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-6">
          {/* <Button asChild>
            <Link href="/simulation">Demande de simulation</Link>
          </Button> */}
        </div>
      </div>
    </header>
  )
}
