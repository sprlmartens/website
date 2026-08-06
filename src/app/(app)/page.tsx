import Claims from "@/components/home/Claims"
import Contact from "@/components/home/Contact"
import FinalCta from "@/components/home/FinalCta"
import GoogleReviews from "@/components/home/GoogleReviews"
import Hero from "@/components/home/Hero"
import Manifesto from "@/components/home/Manifesto"
import Services from "@/components/home/Services"
import TrustBar from "@/components/home/TrustBar"
import WhyMartens from "@/components/home/WhyMartens"

import { JsonLd } from "@/components/seo/JsonLd"
import { organizationSchema, websiteSchema } from "@/lib/structured-data"

export const metadata = {
  // Le titre porte l'intention géographique : l'essentiel de la clientèle
  // cherche « courtier assurances Liège », pas la marque.
  title: "Courtier en assurances à Liège — Martens Assurances",
  description:
    "Courtier indépendant en assurances et placements à Rocourt (Liège). Auto, habitation, santé, pension : nous comparons le marché pour vous depuis plus de 20 ans.",
  alternates: { canonical: "/" },
}

export default function Page() {
  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <Hero />
      <TrustBar />
      <Manifesto />
      <GoogleReviews />
      <Services />
      <WhyMartens />
      <Claims />
      {/* <FeaturedArticles /> */}
      <FinalCta />
      <Contact />
    </>
  )
}
