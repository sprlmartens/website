import type { Metadata } from "next"
import { Inter, Nunito_Sans, IBM_Plex_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const nunitoSansHeading = Nunito_Sans({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const ibmPlexSansDisplay = IBM_Plex_Sans({subsets:['latin'],weight:['400','500','600','700'],variable:'--font-display'});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
  title: "Martens Assurances — Courtier en assurances",
  description:
    "Martens Assurances, courtier en assurances indépendant. Conseils et solutions adaptés à vos besoins.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={cn("font-sans", inter.variable, nunitoSansHeading.variable, ibmPlexSansDisplay.variable)}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
