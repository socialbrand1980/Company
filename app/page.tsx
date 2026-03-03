import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { ServicesSection } from "@/components/services-section"
import { ClientLogos } from "@/components/client-logos"
import { ProcessSection } from "@/components/process-section"
import { WhyUsSection } from "@/components/why-us-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <ClientLogos />
        <AboutSection />
        <ServicesSection />
        <ProcessSection />
        <WhyUsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
