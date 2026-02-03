"use client"

import Link from "next/link"

const footerLinks = {
  services: [
    { label: "Brand Strategy", href: "#services" },
    { label: "Social Media", href: "#services" },
    { label: "Content Production", href: "#services" },
    { label: "Paid Advertising", href: "#services" },
  ],
  company: [
    { label: "About Us", href: "#about" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "Process", href: "#process" },
    { label: "Contact", href: "#contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="relative border-t border-border/30 py-12 sm:py-16 lg:py-20 overflow-hidden">
      {/* Subtle neon background glow */}
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-[#2D75FF]/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 animate-pulse-glow" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <Link href="/" className="inline-block group">
              <span className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
                Socialbrand <span className="neon-text group-hover:opacity-80 transition-opacity">1980</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Strategic digital agency specializing in brand storytelling, 
              social media management, and performance marketing.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 text-foreground">Services</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 text-foreground">Company</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-border/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} Socialbrand 1980. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link 
              href="#" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              LinkedIn
            </Link>
            <Link 
              href="#" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              Instagram
            </Link>
            <Link 
              href="#" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              aria-label="Twitter"
            >
              Twitter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
