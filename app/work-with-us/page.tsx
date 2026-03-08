"use client"

import React, { useState } from "react"
import { ArrowRight, CheckCircle2, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { services } from "@/data/services"
import ReactMarkdown from "react-markdown"
import { BrandIntakeForm } from "@/components/brand-intake-form"

export default function WorkWithUsPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const selectedServiceData = services.find(s => s.id === selectedService)

  const handleServiceClick = (serviceId: string) => {
    setSelectedService(serviceId)
    setShowDetail(true)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
    // Restore body scroll
    document.body.style.overflow = ''
    setTimeout(() => setSelectedService(null), 300)
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center pt-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background animate-gradient" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2D75FF]/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-foreground/80">Start Your Project</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                Work With <span className="neon-text">Us</span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Tell us about your brand and goals. We'll help you choose the right services and create a tailored strategy for growth.
              </p>
            </div>
          </div>
        </section>

        {/* Service Selector Section */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#2D75FF]/10 rounded-full blur-3xl -translate-y-1/2 animate-pulse-glow" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-xs sm:text-sm font-medium tracking-widest uppercase mb-4 neon-text">
                Our Services
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
                Select Your <span className="neon-text">Service</span>
              </h2>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground">
                Choose the service that fits your brand's needs.
              </p>
            </div>

            {/* Service Selector Buttons */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceClick(service.id)}
                  className={`glass-card p-6 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] ${
                    selectedService === service.id ? 'border-primary/50 bg-primary/5' : 'hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{service.title}</h3>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                    <ArrowRight 
                      className={`h-5 w-5 text-primary flex-shrink-0 transition-transform duration-300 ${
                        selectedService === service.id ? 'translate-x-1' : ''
                      }`} 
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Service Detail Modal/Sheet */}
        {showDetail && selectedServiceData && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={handleCloseDetail}
            />
            
            {/* Modal Content */}
            <div className="relative w-full sm:max-w-3xl h-[90vh] sm:h-[80vh] sm:max-h-[80vh] sm:rounded-2xl glass-card overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col">
              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-border/50 bg-background">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground pr-8">
                  {selectedServiceData.title}
                </h3>
                <button
                  onClick={handleCloseDetail}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="p-4 sm:p-6 sm:pb-4">
                  <div className="prose prose-lg prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({children}) => <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">{children}</h1>,
                        h2: ({children}) => <h2 className="text-lg sm:text-xl font-semibold text-primary mt-6 mb-3">{children}</h2>,
                        h3: ({children}) => <h3 className="text-base sm:text-lg font-semibold text-foreground mt-5 mb-2">{children}</h3>,
                        p: ({children}) => <p className="text-muted-foreground mb-4 leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="list-disc list-inside space-y-2 my-4 ml-4">{children}</ul>,
                        li: ({children}) => <li className="text-foreground/80">{children}</li>,
                        strong: ({children}) => <strong className="font-semibold text-foreground">{children}</strong>,
                      }}
                    >
                      {selectedServiceData.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
              
              {/* Footer with Button */}
              <div className="flex-shrink-0 p-4 sm:p-6 pt-2 border-t border-border/50 bg-background">
                <Button
                  onClick={handleCloseDetail}
                  size="lg"
                  className="w-full neon-btn text-white"
                >
                  Got It
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Brand Intake Form Section */}
        <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
          <div className="absolute top-1/3 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-[#2D75FF]/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-xs sm:text-sm font-medium tracking-widest uppercase mb-4 neon-text">
                Brand Brief
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
                Tell Us About <span className="neon-text">Your Brand</span>
              </h2>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
            </div>

            <BrandIntakeForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
