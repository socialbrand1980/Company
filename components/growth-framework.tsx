"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  Map, 
  Calendar, 
  Rocket, 
  BarChart3, 
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Target,
  Lightbulb,
  Users,
  FileText,
  PenTool,
  Video,
  Megaphone,
  MessageCircle,
  LineChart,
  RefreshCcw,
  Settings
} from "lucide-react"

const frameworkNodes = [
  {
    id: 1,
    title: "Brand Audit",
    timeline: "Week 1-2",
    icon: Search,
    color: "from-blue-500 to-cyan-500",
    content: [
      { icon: CheckCircle2, text: "Brand health assessment" },
      { icon: Users, text: "Audience research" },
      { icon: Target, text: "Competitor benchmarking" },
      { icon: Lightbulb, text: "Gap identification" },
    ],
  },
  {
    id: 2,
    title: "Strategy Mapping",
    timeline: "Week 2-3",
    icon: Map,
    color: "from-cyan-500 to-blue-500",
    content: [
      { icon: Target, text: "Brand positioning" },
      { icon: FileText, text: "Messaging framework" },
      { icon: Map, text: "Channel strategy" },
      { icon: Lightbulb, text: "Campaign direction" },
    ],
  },
  {
    id: 3,
    title: "Content Planning",
    timeline: "Week 3-4",
    icon: Calendar,
    color: "from-blue-500 to-purple-500",
    content: [
      { icon: Lightbulb, text: "Content pillars" },
      { icon: Calendar, text: "Content calendar" },
      { icon: FileText, text: "Production roadmap" },
    ],
  },
  {
    id: 4,
    title: "Execution Phase",
    timeline: "Ongoing",
    icon: Rocket,
    color: "from-purple-500 to-pink-500",
    content: [
      { icon: PenTool, text: "Content production" },
      { icon: MessageCircle, text: "Social media management" },
      { icon: Megaphone, text: "Paid ads" },
      { icon: Users, text: "Influencer campaigns" },
    ],
  },
  {
    id: 5,
    title: "Reporting & Optimization",
    timeline: "Monthly",
    icon: BarChart3,
    color: "from-pink-500 to-blue-500",
    content: [
      { icon: LineChart, text: "Performance tracking" },
      { icon: BarChart3, text: "Campaign analysis" },
      { icon: RefreshCcw, text: "Strategy refinement" },
      { icon: Settings, text: "Continuous optimization" },
    ],
  },
]

const deliverables = [
  {
    title: "Strategy",
    icon: Target,
    items: [
      "Brand positioning document",
      "Target audience personas",
      "Competitive analysis report",
      "Channel strategy roadmap",
      "Campaign planning framework",
    ],
  },
  {
    title: "Creative",
    icon: Video,
    items: [
      "Visual identity guidelines",
      "Content templates & assets",
      "Video & photo production",
      "Copywriting & messaging",
      "Social media content library",
    ],
  },
  {
    title: "Performance",
    icon: TrendingUp,
    items: [
      "Analytics dashboard setup",
      "KPI tracking system",
      "Monthly performance reports",
      "A/B testing results",
      "ROI optimization strategies",
    ],
  },
]

export function GrowthFramework() {
  const [activeNode, setActiveNode] = useState<number | null>(null)

  return (
    <section id="process" className="relative py-24 sm:py-32 lg:py-40 scroll-mt-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2D75FF]/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20 sm:mb-28">
          <p className="text-xs sm:text-sm font-medium tracking-widest uppercase mb-4 neon-text">
            Our Process
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance mb-6">
            A Structured Approach to{" "}
            <span className="neon-text">Brand Growth</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Our proven framework combines strategy, content, and performance marketing to turn brands into scalable growth engines.
          </p>
          
          <div className="mt-10">
            <Button size="lg" asChild className="group neon-btn text-white font-semibold">
              <a href="https://wa.me/62811198093" target="_blank" rel="noopener noreferrer">
                Start With a Brand Audit
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        </div>

        {/* Interactive Framework - Minimalist */}
        <div className="mb-24 sm:mb-32">
          {/* Desktop: Horizontal Layout */}
          <div className="hidden lg:block">
            {/* Nodes */}
            <div className="grid grid-cols-5 gap-4 relative z-10">
              {frameworkNodes.map((node, index) => {
                const Icon = node.icon
                const isActive = activeNode === node.id
                
                return (
                  <button
                    key={node.id}
                    onClick={() => setActiveNode(isActive ? null : node.id)}
                    className="group relative flex flex-col items-center w-full transition-all duration-500 ease-out"
                  >
                    {/* Icon Circle with Glow */}
                    <div className={`relative w-16 h-16 rounded-full transition-all duration-500 ease-out ${
                      isActive 
                        ? `bg-gradient-to-br ${node.color} shadow-lg shadow-blue-500/50 scale-110`
                        : "bg-black/80 border border-blue-500/20 group-hover:border-blue-500/50 group-hover:shadow-md group-hover:shadow-blue-500/30"
                    }`}>
                      <Icon className={`w-7 h-7 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out ${
                        isActive ? "text-white scale-110" : "text-blue-400 group-hover:text-blue-300"
                      }`} />
                      
                      {/* Active Glow Effect */}
                      {isActive && (
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${node.color} blur-lg opacity-60 animate-pulse`} style={{ animationDuration: '3s' }} />
                      )}
                      
                      {/* Outer Ring for inactive */}
                      {!isActive && (
                        <div className="absolute inset-0 rounded-full border border-blue-500/20 transition-all duration-500 ease-out" />
                      )}
                    </div>
                    
                    {/* Label */}
                    <div className="mt-4 text-center">
                      <p className={`text-sm font-medium transition-all duration-500 ease-out ${
                        isActive ? "text-white" : "text-muted-foreground group-hover:text-blue-300"
                      }`}>
                        {node.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{node.timeline}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            
            {/* Content Panel - Minimalist with Smooth Animation */}
            {activeNode && (
              <div className="mt-16 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                <div className="glass-card rounded-2xl p-8 border border-blue-500/20">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {frameworkNodes.find(n => n.id === activeNode)?.content.map((item, index) => {
                      const ItemIcon = item.icon
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-500/5 transition-all duration-300 ease-out"
                        >
                          <ItemIcon className="w-5 h-5 text-blue-400 flex-shrink-0 transition-transform duration-300 ease-out hover:scale-110" />
                          <span className="text-sm text-blue-100">{item.text}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile: Vertical Layout with Smooth Animation */}
          <div className="lg:hidden space-y-4">
            {frameworkNodes.map((node) => {
              const Icon = node.icon
              const isActive = activeNode === node.id
              
              return (
                <button
                  key={node.id}
                  onClick={() => setActiveNode(isActive ? null : node.id)}
                  className="group w-full glass-card rounded-xl p-4 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-500 ease-out"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon with Blue Glow */}
                    <div className={`relative w-14 h-14 rounded-full transition-all duration-500 ease-out flex-shrink-0 ${
                      isActive 
                        ? `bg-gradient-to-br ${node.color} shadow-lg shadow-blue-500/50 scale-110`
                        : "bg-black/80 border border-blue-500/30"
                    }`}>
                      <Icon className={`w-7 h-7 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out ${
                        isActive ? "text-white scale-110" : "text-blue-400"
                      }`} />
                      
                      {/* Glow Effect */}
                      {isActive && (
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${node.color} blur-lg opacity-60 animate-pulse`} style={{ animationDuration: '3s' }} />
                      )}
                    </div>
                    
                    {/* Label */}
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-medium transition-all duration-500 ease-out ${
                        isActive ? "text-white" : "text-blue-100"
                      }`}>
                        {node.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{node.timeline}</p>
                    </div>
                    
                    {/* Arrow */}
                    <ArrowRight className={`w-4 h-4 transition-all duration-500 ease-out ${
                      isActive ? "rotate-90 text-blue-400" : "text-blue-400"
                    }`} />
                  </div>
                  
                  {/* Expanded Content with Smooth Animation */}
                  {isActive && (
                    <div className="mt-4 pt-4 border-t border-blue-500/20 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
                      {node.content.map((item, index) => {
                        const ItemIcon = item.icon
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-xs text-blue-100"
                          >
                            <ItemIcon className="w-4 h-4 text-blue-400 flex-shrink-0 transition-transform duration-300 ease-out hover:scale-110" />
                            <span>{item.text}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Deliverables Section */}
        <div className="mb-24 sm:mb-32">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              What You'll Receive
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive deliverables across strategy, creative, and performance to ensure your brand's success.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {deliverables.map((deliverable, index) => {
              const Icon = deliverable.icon
              return (
                <div
                  key={index}
                  className="glass-card rounded-2xl p-6 sm:p-8 border border-border/30 hover:border-white/40 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  
                  <h4 className="text-xl font-semibold text-foreground mb-6">
                    {deliverable.title}
                  </h4>
                  
                  <ul className="space-y-3">
                    {deliverable.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="glass-card rounded-3xl p-8 sm:p-12 lg:p-16 border border-border/50 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2D75FF]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
            
            <div className="relative">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Let's Build Your{" "}
                <span className="neon-text">Brand Growth System</span>
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Ready to transform your brand with our proven framework? Start with a comprehensive brand audit today.
              </p>
              
              <Button size="lg" asChild className="group neon-btn text-white font-semibold text-base sm:text-lg px-8 py-6">
                <a href="https://wa.me/62811198093" target="_blank" rel="noopener noreferrer">
                  Start With a Brand Audit
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
