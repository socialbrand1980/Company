"use client"

import React from "react"
import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#process", label: "Process" },
  { href: "#why-us", label: "Why Us" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const isPortfolioPage = pathname.startsWith("/portfolio")
  const isArticlesPage = pathname.startsWith("/article")
  const isWorkWithUsPage = pathname === "/work-with-us"

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    
    if (!isHomePage) {
      // Navigate to homepage with hash
      window.location.href = `/${href}`
      return
    }

    const targetId = href.replace("#", "")
    const element = document.getElementById(targetId)
    if (element) {
      const offsetTop = element.offsetTop - 80
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth"
      })
    }
    setIsOpen(false)
  }, [isHomePage])

  // Check if section is active (for homepage scroll sections)
  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    if (!isHomePage) {
      setActiveSection("")
      return
    }

    const handleScroll = () => {
      const sections = ["about", "services", "process", "why-us"]
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isHomePage])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled || !isHomePage
          ? "glass border-b border-border/50 bg-black/80 backdrop-blur-xl"
          : "bg-black/40 backdrop-blur-md"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
              Socialbrand <span className="neon-text group-hover:opacity-80 transition-opacity">1980</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => {
              const isActive = isHomePage && activeSection === link.href.replace("#", "")
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className={`text-sm font-medium transition-all relative after:absolute after:bottom-0 after:left-0 after:h-px after:bg-primary after:transition-all ${
                    isActive
                      ? "text-primary after:w-full"
                      : "text-muted-foreground hover:text-primary after:w-0 hover:after:w-full"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-primary blur-[2px]" />
                  )}
                </a>
              )
            })}
          </div>

          {/* Portfolio, Articles & Work With Us Links - Aligned to Right */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link
              href="/portfolio"
              className={`text-sm font-medium transition-all relative after:absolute after:bottom-0 after:left-0 after:h-px after:bg-primary after:transition-all ${
                isPortfolioPage
                  ? "text-primary after:w-full"
                  : "text-muted-foreground hover:text-primary after:w-0 hover:after:w-full"
              }`}
            >
              Portfolio
              {isPortfolioPage && (
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-primary blur-[2px]" />
              )}
            </Link>
            <Link
              href="/work-with-us"
              className={`text-sm font-medium transition-all relative after:absolute after:bottom-0 after:left-0 after:h-px after:bg-primary after:transition-all ${
                isWorkWithUsPage
                  ? "text-primary after:w-full"
                  : "text-muted-foreground hover:text-primary after:w-0 hover:after:w-full"
              }`}
            >
              Work With Us
              {isWorkWithUsPage && (
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-primary blur-[2px]" />
              )}
            </Link>
            <Link
              href="/article"
              className={`text-sm font-medium transition-all relative after:absolute after:bottom-0 after:left-0 after:h-px after:bg-primary after:transition-all ${
                isArticlesPage
                  ? "text-primary after:w-full"
                  : "text-muted-foreground hover:text-primary after:w-0 hover:after:w-full"
              }`}
            >
              Articles
              {isArticlesPage && (
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-primary blur-[2px]" />
              )}
            </Link>
          </div>

          <div className="hidden md:block">
            <Button asChild className="neon-btn text-white font-medium">
              <a href="https://wa.me/62811198093" target="_blank" rel="noopener noreferrer">Start a Project</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 -mr-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden glass rounded-2xl mt-2 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const isActive = isHomePage && activeSection === link.href.replace("#", "")
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                    }`}
                    onClick={(e) => {
                      scrollToSection(e, link.href)
                    }}
                  >
                    {isActive && <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2" />}
                    {link.label}
                  </a>
                )
              })}
              <div className="border-t border-border/50 pt-4 mt-2">
                <Link
                  href="/portfolio"
                  className={`block text-sm font-medium transition-colors py-2 ${
                    isPortfolioPage ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {isPortfolioPage && <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2" />}
                  Portfolio
                </Link>
                <Link
                  href="/work-with-us"
                  className={`block text-sm font-medium transition-colors py-2 ${
                    isWorkWithUsPage ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {isWorkWithUsPage && <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2" />}
                  Work With Us
                </Link>
                <Link
                  href="/article"
                  className={`block text-sm font-medium transition-colors py-2 ${
                    isArticlesPage ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {isArticlesPage && <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2" />}
                  Articles
                </Link>
              </div>
              <Button asChild className="mt-2 neon-btn text-white font-medium">
                <a href="https://wa.me/62811198093" target="_blank" rel="noopener noreferrer">Start a Project</a>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
