"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function CTASection() {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const targetId = href.replace("#", "")
    const element = document.getElementById(targetId)
    if (element) {
      const offsetTop = element.offsetTop - 80
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth"
      })
    }
  }

  return (
    <section id="contact" className="relative py-16 sm:py-24 lg:py-32 scroll-mt-20 overflow-hidden">
      {/* Background neon gradient and orbs */}
      <div className="absolute inset-0 bg-gradient-to-t from-muted/50 via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-[#2D75FF]/25 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse-glow" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-accent/25 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-[#2D75FF]/20 rounded-full blur-2xl animate-float" style={{ animationDelay: "1.5s" }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card neon-border max-w-4xl mx-auto p-8 sm:p-12 lg:p-16 rounded-3xl text-center">
          {/* Decorative badge */}
          <div className="inline-flex items-center gap-2 bg-[#2D75FF]/10 border border-[#2D75FF]/30 px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-[#2D75FF]" />
            <span className="text-sm font-medium text-[#2D75FF]">Ready to grow?</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
            Let Us Manage Your Brand <span className="neon-text">Professionally</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Ready to transform your brand's digital presence? Let's discuss how 
            Socialbrand 1980 can become your strategic partner for growth.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button size="lg" asChild className="group w-full sm:w-auto neon-btn text-white font-semibold">
              <a href="https://wa.me/62811198093" target="_blank" rel="noopener noreferrer">
                Start a Project
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto neon-border text-foreground hover:bg-[#2D75FF]/10 bg-transparent backdrop-blur-sm">
              <a href="#services" onClick={(e) => scrollToSection(e, "#services")}>Explore Services</a>
            </Button>
          </div>
          <p className="mt-6 sm:mt-8 text-sm text-muted-foreground">
            Typical response time: within 24 hours
          </p>
        </div>
      </div>
    </section>
  )
}
