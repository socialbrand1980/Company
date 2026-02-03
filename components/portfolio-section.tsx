import { ArrowUpRight, TrendingUp } from "lucide-react"

const caseStudies = [
  {
    brand: "Trueve",
    industry: "Beauty & Skincare",
    challenge: "Low social engagement and inconsistent brand voice across platforms",
    result: "+340% engagement growth in 6 months",
    metrics: [
      { label: "Engagement Rate", value: "+340%" },
      { label: "Follower Growth", value: "+125K" },
      { label: "Sales Impact", value: "+45%" }
    ]
  },
  {
    brand: "Screamous",
    industry: "Fashion",
    challenge: "Difficulty reaching 0,5% Market Size",
    result: "350% increased Sales",
    metrics: [
      { label: "Brand Equity", value: "+30%" },
      { label: "Product Search", value: "+180%" },
      { label: "Sales Impact", value: "+156%" }
    ]
  },
  {
    brand: "PGJ Watches",
    industry: "Fashion & Luxury Watches",
    challenge: "New market entry with zero brand awareness",
    result: "Built Brand Awareness in 4 months",
    metrics: [
      { label: "Community Size", value: "30K+" },
      { label: "Store Visits", value: "+89%" },
      { label: "Brand Trust", value: "72%" }
    ]
  }
]

export function PortfolioSection() {
  return (
    <section id="portfolio" className="relative py-16 sm:py-24 lg:py-32 scroll-mt-20 overflow-hidden">
      {/* Background neon glow */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#2D75FF]/15 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 sm:gap-8 mb-10 sm:mb-16">
          <div>
            <p className="text-xs sm:text-sm font-medium tracking-widest uppercase mb-3 sm:mb-4 neon-text">
              Portfolio
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground text-balance">
              Results That <span className="neon-text">Speak for Themselves</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl">
              Every brand partnership is built on measurable outcomes. 
              Here's a glimpse of what we've achieved together with our clients.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {caseStudies.map((study, index) => (
            <div 
              key={study.brand}
              className="group glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02]"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="p-5 sm:p-8">
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium tracking-wider text-primary bg-primary/10 uppercase">
                      {study.industry}
                    </span>
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mt-2">
                      {study.brand}
                    </h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <ArrowUpRight className="h-5 w-5 text-primary" />
                  </div>
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Challenge:</p>
                  <p className="text-sm sm:text-base text-foreground/80">{study.challenge}</p>
                </div>

                <div className="mb-4 sm:mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Key Result:</p>
                  </div>
                  <p className="text-base sm:text-lg font-semibold neon-text">{study.result}</p>
                </div>

                <div className="pt-4 sm:pt-6 border-t border-border/50 grid grid-cols-3 gap-2 sm:gap-4">
                  {study.metrics.map((metric) => (
                    <div key={metric.label}>
                      <p className="text-lg sm:text-xl font-bold text-foreground">{metric.value}</p>
                      <p className="text-xs text-muted-foreground leading-tight">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
