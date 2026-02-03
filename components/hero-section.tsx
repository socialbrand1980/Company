"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
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
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted animate-gradient" />
      
      {/* Floating neon orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2D75FF]/30 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/25 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-[#2D75FF]/15 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-[#2D75FF]/20 rounded-full blur-2xl animate-float" style={{ animationDelay: "3s" }} />
      
      {/* Neon grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#2D75FF08_1px,transparent_1px),linear-gradient(to_bottom,#2D75FF08_1px,transparent_1px)] bg-[size:4rem_4rem] sm:bg-[size:6rem_6rem]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 pt-32 sm:pt-40">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6 sm:mb-8 animate-float">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-foreground/80">Strategic Digital Agency</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] text-balance">
            We Don't Just Create Content.{" "}
            <span className="neon-text">We Manage Brands.</span>
          </h1>
          
          <p className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Socialbrand 1980 helps brands grow through structured strategy, 
            creative storytelling, and data-driven execution.
          </p>
          
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button size="lg" asChild className="group w-full sm:w-auto neon-btn text-white font-semibold">
              <a href="#process" onClick={(e) => scrollToSection(e, "#process")}>
                See How We Handle Your Brand
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto neon-border text-foreground hover:bg-[#2D75FF]/10 bg-transparent backdrop-blur-sm">
              <a href="#portfolio" onClick={(e) => scrollToSection(e, "#portfolio")}>View Our Work</a>
            </Button>
          </div>

          {/* Stats row */}
          <div className="mt-16 sm:mt-20 grid grid-cols-3 gap-4 sm:gap-8 max-w-xl">
            {[
              { value: "50+", label: "Brands Managed" },
              { value: "2+", label: "Years Avg. Partnership" },
              { value: "340%", label: "Avg. Growth Rate" },
            ].map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold neon-text">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
