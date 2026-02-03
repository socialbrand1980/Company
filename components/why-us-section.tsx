import { Workflow, FileText, Users, Lightbulb, BarChart } from "lucide-react"

const reasons = [
  {
    icon: Workflow,
    title: "Structured Workflow",
    description: "Every project follows our proven methodology, ensuring consistent quality and predictable timelines."
  },
  {
    icon: FileText,
    title: "Clear Reporting",
    description: "Transparent, data-driven reports that show exactly where your investment is going and what it's achieving."
  },
  {
    icon: Users,
    title: "Dedicated Team",
    description: "A committed team of specialists assigned to your brand, not a rotating door of freelancers."
  },
  {
    icon: Lightbulb,
    title: "Strategy-First Approach",
    description: "We don't start executing until we have a solid strategy in place. No random acts of marketing."
  },
  {
    icon: BarChart,
    title: "Measurable Results",
    description: "Every action is tied to KPIs. We measure what matters and optimize based on real data."
  }
]

export function WhyUsSection() {
  return (
    <section id="why-us" className="relative py-16 sm:py-24 lg:py-32 scroll-mt-20 overflow-hidden">
      {/* Background neon glow */}
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-[#2D75FF]/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-24">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs sm:text-sm font-medium tracking-widest uppercase mb-3 sm:mb-4 neon-text">
              Why Brands Trust Us
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground text-balance">
              Professional Brand Management <span className="neon-text">You Can Rely On</span>
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
              We understand that handing over your brand is a significant decision. 
              That's why we've built our entire operation around accountability, 
              transparency, and delivering measurable results.
            </p>
            <div className="mt-6 sm:mt-8 glass-card p-5 sm:p-6 rounded-2xl">
              <p className="text-3xl sm:text-4xl font-bold neon-text mb-2">50+</p>
              <p className="text-sm sm:text-base text-muted-foreground">Brands managed with an average partnership duration of 2+ years</p>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
            {reasons.map((reason, index) => (
              <div 
                key={reason.title}
                className="flex gap-4 sm:gap-6 glass-card p-4 sm:p-6 rounded-2xl transition-all duration-500 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                    <reason.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <span className="text-xs font-medium text-primary">0{index + 1}</span>
                    <h3 className="font-semibold text-sm sm:text-base text-foreground">{reason.title}</h3>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{reason.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
