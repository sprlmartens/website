import Claims from "@/components/home/Claims"
import Contact from "@/components/home/Contact"
import FinalCta from "@/components/home/FinalCta"
import Footer from "@/components/home/Footer"
import Hero from "@/components/home/Hero"
import Manifesto from "@/components/home/Manifesto"
import Services from "@/components/home/Services"
import Testimonials from "@/components/home/Testimonials"
import TrustBar from "@/components/home/TrustBar"
import WhyMartens from "@/components/home/WhyMartens"

export default function Page() {
  return (
    <>
      <main>
        <Hero />
        <TrustBar />
        <Manifesto />
        <Services />
        <WhyMartens />
        <Claims />
        <Testimonials />
        <FinalCta />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
