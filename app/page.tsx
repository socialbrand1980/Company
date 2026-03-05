import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { ServicesSection } from "@/components/services-section"
import { ClientLogos } from "@/components/client-logos"
import { GrowthFramework } from "@/components/growth-framework"
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
        <GrowthFramework />
        <WhyUsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
