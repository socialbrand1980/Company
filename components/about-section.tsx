import { Target, Users, TrendingUp, Award } from "lucide-react"

const features = [
  {
    icon: Target,
    title: "Professional Workflow",
    description: "Every project follows a structured, proven process from strategy to execution."
  },
  {
    icon: Users,
    title: "Clear Strategy",
    description: "We define clear objectives, target audiences, and measurable KPIs from day one."
  },
  {
    icon: Award,
    title: "Consistent Brand Voice",
    description: "Your brand speaks with one unified voice across all channels and touchpoints."
  },
  {
    icon: TrendingUp,
    title: "Long-term Growth",
    description: "We focus on sustainable brand growth, not just short-term vanity metrics."
  }
]

export function AboutSection() {
  return (
    <section id="about" className="relative py-16 sm:py-24 lg:py-32 scroll-mt-20 overflow-hidden">
      {/* Background neon glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#2D75FF]/15 rounded-full blur-3xl -translate-y-1/2 animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-accent/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-24 items-center">
          <div>
            <p className="text-xs sm:text-sm font-medium tracking-widest uppercase mb-3 sm:mb-4 neon-text">
              About Socialbrand 1980
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground text-balance">
              A Brand Partner, <span className="neon-text">Not Just a Vendor</span>
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
              We work alongside your team as a strategic partner, taking ownership of your brand's 
              digital presence. From developing comprehensive strategies to executing campaigns 
              with precision, we handle every aspect of your brand's growth journey.
            </p>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Our approach is rooted in data and driven by creativity. We don't believe in 
              one-size-fits-all solutions—every brand strategy is tailored to your unique 
              goals, audience, and market position.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="glass-card p-5 sm:p-6 rounded-2xl transition-all duration-500 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
