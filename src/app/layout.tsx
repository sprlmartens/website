import type { Metadata } from "next"
import { Inter, Nunito_Sans, IBM_Plex_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import { siteUrl } from "@/lib/site-url";

const nunitoSansHeading = Nunito_Sans({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const ibmPlexSansDisplay = IBM_Plex_Sans({subsets:['latin'],weight:['400','500','600','700'],variable:'--font-display'});

export const metadata: Metadata = {
  // `siteUrl` a un repli : une variable d'environnement manquante ne doit pas
  // faire échouer le build (ce que provoquait le `!` précédent).
  metadataBase: new URL(siteUrl),
  title: "Martens Assurances — Courtier en assurances",
  description:
    "Martens Assurances, courtier en assurances indépendant. Conseils et solutions adaptés à vos besoins.",
  // Valeurs par défaut héritées par toutes les pages. L'image est fournie
  // par le fichier app/opengraph-image.png (convention Next.js).
  // Valeurs par défaut héritées par toutes les pages.
  //
  // Pas de `url` ici : une valeur définie à la racine serait héritée telle
  // quelle par chaque page, qui annoncerait alors l'URL de l'accueil. Mieux
  // vaut aucune `og:url` — les réseaux sociaux retombent sur l'URL réelle —
  // que la mauvaise. Le canonical, lui, est défini page par page.
  openGraph: {
    type: "website",
    locale: "fr_BE",
    siteName: "Martens Assurances & Placements",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // `data-scroll-behavior` : depuis Next.js 16, sans cet attribut, le
    // `scroll-behavior: smooth` global reste actif pendant les changements de
    // page. Le retour en haut devient alors animé, Next.js le croit inachevé
    // et aligne le haut du contenu sous l'en-tête collant, qui masque le
    // début de la page.
    <html lang="fr" data-scroll-behavior="smooth" className={cn("font-sans", inter.variable, nunitoSansHeading.variable, ibmPlexSansDisplay.variable)}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
