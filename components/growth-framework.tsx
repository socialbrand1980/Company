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
  const [activeNode, setActiveNode] = useState<number | null>(1)

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

        {/* Interactive Framework */}
        <div className="mb-24 sm:mb-32">
          {/* Framework Container */}
          <div className="relative">
            {/* Desktop: Horizontal Layout */}
            <div className="hidden lg:block">
              {/* Connection Line */}
              <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-30 blur-sm" />
              </div>
              
              {/* Nodes */}
              <div className="grid grid-cols-5 gap-4 relative z-10">
                {frameworkNodes.map((node, index) => {
                  const Icon = node.icon
                  const isActive = activeNode === node.id
                  
                  return (
                    <div key={node.id} className="relative">
                      {/* Node Button */}
                      <button
                        onClick={() => setActiveNode(node.id)}
                        className={`group relative flex flex-col items-center w-full transition-all duration-500 ${
                          isActive ? "scale-110" : "hover:scale-105"
                        }`}
                      >
                        {/* Icon Container */}
                        <div className={`relative w-32 h-32 rounded-2xl bg-gradient-to-br ${node.color} p-0.5 transition-all duration-500 ${
                          isActive ? "shadow-2xl shadow-blue-500/30" : "shadow-lg"
                        }`}>
                          <div className="w-full h-full rounded-2xl bg-black/90 backdrop-blur-xl flex items-center justify-center">
                            <Icon className={`w-12 h-12 transition-all duration-500 ${
                              isActive ? "text-white scale-110" : "text-white/70 group-hover:text-white"
                            }`} />
                          </div>
                          
                          {/* Glow Effect */}
                          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${node.color} opacity-0 transition-opacity duration-500 ${
                            isActive ? "opacity-30 blur-xl" : "group-hover:opacity-20 group-hover:blur-lg"
                          }`} />
                        </div>
                        
                        {/* Timeline */}
                        <div className="mt-4 text-center">
                          <p className={`text-sm font-semibold transition-colors duration-300 ${
                            isActive ? "text-white" : "text-muted-foreground"
                          }`}>
                            {node.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{node.timeline}</p>
                        </div>
                        
                        {/* Active Indicator */}
                        {isActive && (
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                        )}
                      </button>
                      
                      {/* Connector Dots */}
                      {index < frameworkNodes.length - 1 && (
                        <div className="absolute top-16 -right-2 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-black" />
                      )}
                    </div>
                  )
                })}
              </div>
              
              {/* Floating Content Panel */}
              {activeNode && (
                <div className="mt-16 glass-card rounded-2xl p-8 border border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {frameworkNodes.find(n => n.id === activeNode)?.content.map((item, index) => {
                      const ItemIcon = item.icon
                      return (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <ItemIcon className="w-5 h-5 text-primary" />
                          </div>
                          <span className="text-sm text-foreground">{item.text}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile: Vertical Layout */}
            <div className="lg:hidden space-y-6">
              {frameworkNodes.map((node) => {
                const Icon = node.icon
                const isActive = activeNode === node.id
                
                return (
                  <div key={node.id} className="relative">
                    <button
                      onClick={() => setActiveNode(node.id)}
                      className={`group w-full flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 ${
                        isActive 
                          ? "glass-card border border-primary/50" 
                          : "glass-card border border-border/30 hover:border-primary/30"
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${node.color} p-0.5 flex-shrink-0`}>
                        <div className="w-full h-full rounded-xl bg-black/90 backdrop-blur-xl flex items-center justify-center">
                          <Icon className={`w-7 h-7 transition-all duration-300 ${
                            isActive ? "text-white scale-110" : "text-white/70 group-hover:text-white"
                          }`} />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 text-left">
                        <p className={`text-base font-semibold transition-colors duration-300 ${
                          isActive ? "text-white" : "text-foreground"
                        }`}>
                          {node.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">{node.timeline}</p>
                        
                        {/* Expanded Content */}
                        {isActive && (
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            {node.content.map((item, index) => {
                              const ItemIcon = item.icon
                              return (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-sm text-muted-foreground"
                                >
                                  <ItemIcon className="w-4 h-4 text-primary flex-shrink-0" />
                                  <span>{item.text}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      
                      {/* Arrow */}
                      <ArrowRight className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                        isActive ? "rotate-90" : ""
                      }`} />
                    </button>
                    
                    {/* Connection Line */}
                    {node.id < frameworkNodes.length && (
                      <div className="absolute left-10 top-20 w-0.5 h-6 bg-gradient-to-b from-blue-500/50 to-transparent" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mb-24 sm:mb-32">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              From Week 1 to Ongoing Growth
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our structured timeline ensures every brand gets the attention and strategy they need for sustainable growth.
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />
            
            {/* Timeline Items */}
            <div className="space-y-8 lg:space-y-0">
              {frameworkNodes.map((node, index) => {
                const isLeft = index % 2 === 0
                const Icon = node.icon
                
                return (
                  <div
                    key={node.id}
                    className={`relative lg:flex items-center gap-8 ${
                      isLeft ? "lg:flex-row" : "lg:flex-row-reverse"
                    }`}
                  >
                    {/* Content */}
                    <div className={`flex-1 ${isLeft ? "lg:text-right" : "lg:text-left"} pl-20 lg:pl-0`}>
                      <div className="glass-card rounded-2xl p-6 border border-border/30">
                        <div className={`flex items-center gap-3 mb-3 ${isLeft ? "lg:flex-row-reverse" : ""}`}>
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${node.color} p-0.5`}>
                            <div className="w-full h-full rounded-lg bg-black/90 backdrop-blur-xl flex items-center justify-center">
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <h4 className="text-lg font-semibold text-foreground">{node.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{node.timeline}</p>
                      </div>
                    </div>
                    
                    {/* Center Dot */}
                    <div className="absolute left-8 lg:left-1/2 lg:-translate-x-1/2 top-8 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-4 border-black shadow-lg shadow-blue-500/50" />
                    
                    {/* Empty Space */}
                    <div className="flex-1 hidden lg:block" />
                  </div>
                )
              })}
            </div>
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
                  className="glass-card rounded-2xl p-6 sm:p-8 border border-border/30 hover:border-primary/50 transition-all duration-500 hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-primary" />
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
