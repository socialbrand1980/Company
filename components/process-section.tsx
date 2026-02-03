"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Search, Map, Calendar, Play, BarChart3 } from "lucide-react"

const steps = [
  {
    id: 1,
    icon: Search,
    title: "Brand Audit",
    subtitle: "Week 1-2",
    description: "We begin with a comprehensive analysis of your current brand presence, market position, and competitive landscape.",
    details: [
      "Current brand health assessment",
      "Audience research & analysis",
      "Competitor benchmarking",
      "Gap identification"
    ]
  },
  {
    id: 2,
    icon: Map,
    title: "Strategy Mapping",
    subtitle: "Week 2-3",
    description: "Based on our findings, we develop a tailored strategy with clear objectives, KPIs, and tactical roadmap.",
    details: [
      "Strategic objectives definition",
      "KPI framework development",
      "Channel strategy planning",
      "Resource allocation"
    ]
  },
  {
    id: 3,
    icon: Calendar,
    title: "Content Planning",
    subtitle: "Week 3-4",
    description: "We create detailed content calendars, creative briefs, and production schedules aligned with your strategy.",
    details: [
      "Content pillar development",
      "Editorial calendar creation",
      "Creative direction & briefs",
      "Production scheduling"
    ]
  },
  {
    id: 4,
    icon: Play,
    title: "Execution Phase",
    subtitle: "Ongoing",
    description: "Our team executes with precision—creating, publishing, and managing your brand's presence daily.",
    details: [
      "Content creation & production",
      "Publishing & scheduling",
      "Community management",
      "Campaign activation"
    ]
  },
  {
    id: 5,
    icon: BarChart3,
    title: "Reporting & Optimization",
    subtitle: "Monthly",
    description: "Regular performance reviews with actionable insights to continuously improve and scale your results.",
    details: [
      "Performance analytics",
      "Monthly strategy reviews",
      "A/B testing & optimization",
      "Quarterly strategic pivots"
    ]
  }
]

export function ProcessSection() {
  const [activeStep, setActiveStep] = useState(1)

  const currentStep = steps.find(s => s.id === activeStep) || steps[0]

  return (
    <section id="process" className="relative py-16 sm:py-24 lg:py-32 scroll-mt-20 overflow-hidden">
      {/* Background neon elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
      <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-[#2D75FF]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse-glow" />
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-accent/15 rounded-full blur-3xl animate-float" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <p className="text-xs sm:text-sm font-medium tracking-widest uppercase mb-3 sm:mb-4 neon-text">
            If We Handle Your Brand
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground text-balance">
            A Structured Approach to <span className="neon-text">Brand Growth</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            Our proven process ensures every brand we partner with receives 
            the strategic attention and professional execution they deserve.
          </p>
        </div>

        {/* Timeline Navigation */}
        <div className="relative mb-8 sm:mb-12">
          {/* Desktop connecting line */}
          <div className="hidden lg:block absolute top-6 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          
          <div className="flex flex-col lg:flex-row lg:justify-between gap-3 sm:gap-4 lg:gap-0">
            {steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={cn(
                  "relative flex items-center lg:flex-col gap-3 sm:gap-4 lg:gap-3 p-3 sm:p-4 lg:p-0 rounded-xl lg:rounded-none transition-all duration-300",
                  activeStep === step.id 
                    ? "glass-card lg:bg-transparent lg:border-0 lg:shadow-none" 
                    : "hover:bg-secondary/30 lg:hover:bg-transparent"
                )}
              >
                <div 
                  className={cn(
                    "relative z-10 h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0",
                    activeStep === step.id
                      ? "bg-primary text-primary-foreground glow-primary scale-110"
                      : "glass-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="text-left lg:text-center">
                  <p className={cn(
                    "font-medium text-sm sm:text-base transition-colors",
                    activeStep === step.id ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.subtitle}</p>
                </div>
                
                {/* Active indicator for desktop */}
                {activeStep === step.id && (
                  <div className="hidden lg:block absolute -bottom-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary glow-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Active Step Content */}
        <div className="glass-card rounded-2xl p-5 sm:p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16">
            <div>
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                  <currentStep.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">{currentStep.title}</h3>
                  <p className="text-sm text-primary">{currentStep.subtitle}</p>
                </div>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {currentStep.description}
              </p>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium tracking-widest uppercase mb-4 sm:mb-6 neon-text">
                What's Included
              </h4>
              <ul className="space-y-3 sm:space-y-4">
                {currentStep.details.map((detail, index) => (
                  <li key={detail} className="flex items-start gap-3 group">
                    <span className="flex-shrink-0 h-6 w-6 rounded-lg bg-primary/10 text-primary text-sm font-medium flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {index + 1}
                    </span>
                    <span className="text-sm sm:text-base text-foreground">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
