import Claims from "@/components/home/Claims"
import Contact from "@/components/home/Contact"
import FinalCta from "@/components/home/FinalCta"
import GoogleReviews from "@/components/home/GoogleReviews"
import Hero from "@/components/home/Hero"
import Manifesto from "@/components/home/Manifesto"
import Services from "@/components/home/Services"
import TrustBar from "@/components/home/TrustBar"
import WhyMartens from "@/components/home/WhyMartens"

export default function Page() {
  return (
    <>
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
