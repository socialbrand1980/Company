import { Compass, MessageSquare, Camera, Users2, Target, Layers } from "lucide-react"

const services = [
  {
    icon: Compass,
    title: "Brand Strategy & Positioning",
    description: "Define your brand's unique position in the market with comprehensive research and strategic planning.",
    features: ["Market Analysis", "Competitor Research", "Brand Positioning", "Strategic Roadmap"]
  },
  {
    icon: MessageSquare,
    title: "Social Media Management",
    description: "Full-service social media management that builds communities and drives meaningful engagement.",
    features: ["Content Calendar", "Community Management", "Engagement Strategy", "Performance Tracking"]
  },
  {
    icon: Camera,
    title: "Content Production",
    description: "High-quality photo, video, and reels production that captures your brand's essence.",
    features: ["Photo Shoots", "Video Production", "Reels & Stories", "Graphic Design"]
  },
  {
    icon: Users2,
    title: "KOL & Influencer Activation",
    description: "Strategic influencer partnerships that amplify your brand message to the right audiences.",
    features: ["Influencer Matching", "Campaign Management", "Performance Analysis", "Long-term Partnerships"]
  },
  {
    icon: Target,
    title: "Paid Ads (Meta & Google)",
    description: "Data-driven advertising campaigns that maximize ROI across Meta and Google platforms.",
    features: ["Campaign Strategy", "Ad Creative", "Budget Optimization", "Conversion Tracking"]
  },
  {
    icon: Layers,
    title: "Omnichannel Marketing Strategy",
    description: "Integrated marketing strategies that create seamless brand experiences across all channels.",
    features: ["Channel Integration", "Customer Journey Mapping", "Cross-platform Analytics", "Unified Messaging"]
  }
]

export function ServicesSection() {
  return (
    <section id="services" className="relative py-16 sm:py-24 lg:py-32 scroll-mt-20 overflow-hidden">
      {/* Background neon elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#2D75FF]/15 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <p className="text-xs sm:text-sm font-medium tracking-widest uppercase mb-3 sm:mb-4 neon-text">
            Our Services
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground text-balance">
            End-to-End <span className="neon-text">Brand Management</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            From strategy to execution, we provide comprehensive services that cover 
            every aspect of your brand's digital presence.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {services.map((service, index) => (
            <div 
              key={service.title}
              className="group glass-card p-6 sm:p-8 rounded-2xl transition-all duration-500 hover:scale-[1.02]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <service.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">{service.title}</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature) => (
                  <li key={feature} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-primary rounded-full flex-shrink-0 glow-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
