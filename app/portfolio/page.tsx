"use client"

import React from "react"
import Link from "next/link"
import { Calendar, ArrowRight, Compass, MessageSquare, Camera, Users2, Target, Layers, Zap, TrendingUp } from "lucide-react"
import { sanityFetch, type Portfolio } from '@/lib/sanity'
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

const PORTFOLIOS_QUERY = `*[_type == "portfolio" && defined(slug.current)] | order(completedDate desc, featured desc) {
  _id,
  title,
  "slug": slug.current,
  clientName,
  description,
  industry,
  services,
  completedDate,
  featured,
  "clientLogoUrl": clientLogo.asset->url,
  "projectImageUrl": projectImage.asset->url,
  projectUrl,
}`

const CATEGORIES = [
  { name: "All", icon: Zap },
  { name: "Brand Strategy & Positioning", icon: Compass },
  { name: "Social Media Management", icon: MessageSquare },
  { name: "Content Production", icon: Camera },
  { name: "KOL & Influencer Activation", icon: Users2 },
  { name: "Paid Ads (Meta & Google)", icon: Target },
  { name: "Omnichannel Marketing Strategy", icon: Layers },
]

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = React.useState("All")
  const [portfolios, setPortfolios] = React.useState<Portfolio[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchPortfolios() {
      try {
        const fetched = await sanityFetch<Portfolio[]>({
          query: PORTFOLIOS_QUERY,
        })
        setPortfolios(fetched || [])
      } catch (error) {
        console.error('Error fetching portfolios:', error)
        setPortfolios([])
      } finally {
        setLoading(false)
      }
    }
    fetchPortfolios()
  }, [])

  const filteredPortfolios = activeCategory === "All"
    ? portfolios
    : portfolios.filter((p: Portfolio) => p.services?.includes(activeCategory))

  const featuredPortfolios = filteredPortfolios.filter((p: Portfolio) => p.featured)
  const regularPortfolios = filteredPortfolios.filter((p: Portfolio) => !p.featured)

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-8">
              <div className="h-12 w-64 bg-white/5 rounded mx-auto" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 bg-white/5 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-32 sm:pt-40 lg:pt-48 pb-16 sm:pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <p className="text-xs sm:text-sm font-medium tracking-widest uppercase mb-4 neon-text">
              Our Work
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance mb-6">
              Featured <span className="neon-text">Projects</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Discover how we've helped brands achieve remarkable results through strategic digital solutions.
            </p>
          </div>

          {/* Category Filter - Horizontal Scroll */}
          <div className="scrollable-categories mb-12 sm:mb-16 px-4 sm:px-0">
            {CATEGORIES.map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() => setActiveCategory(category.name)}
                className={`
                  inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap
                  ${activeCategory === category.name
                    ? "neon-btn text-white"
                    : "glass-card text-muted-foreground hover:text-foreground hover:scale-105"
                  }
                `}
              >
                <category.icon className="h-4 w-4 flex-shrink-0" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Featured Projects */}
          {featuredPortfolios.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                Featured Projects
              </h2>
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                {featuredPortfolios.map((portfolio: Portfolio, index: number) => (
                  <Link
                    key={portfolio._id}
                    href={`/portfolio/${portfolio.slug}`}
                    className="group glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                      {portfolio.projectImageUrl ? (
                        <img
                          src={portfolio.projectImageUrl}
                          alt={portfolio.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-6xl font-bold text-primary/20">
                            {portfolio.title.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                          Featured
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {portfolio.clientLogoUrl && (
                          <img
                            src={portfolio.clientLogoUrl}
                            alt={portfolio.clientName}
                            className="h-8 object-contain"
                          />
                        )}
                        <span className="text-sm text-muted-foreground">{portfolio.clientName}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {portfolio.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {portfolio.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {portfolio.services?.slice(0, 2).map((service: string) => (
                            <span key={service} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {service}
                            </span>
                          ))}
                          {portfolio.services?.length > 2 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-muted-foreground">
                              +{portfolio.services.length - 2}
                            </span>
                          )}
                        </div>
                        <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* All Projects */}
          <div>
            {featuredPortfolios.length > 0 && (
              <h2 className="text-2xl font-bold text-foreground mb-8">All Projects</h2>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {regularPortfolios.map((portfolio: Portfolio, index: number) => (
                <Link
                  key={portfolio._id}
                  href={`/portfolio/${portfolio.slug}`}
                  className="group glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-video w-full bg-gradient-to-br from-secondary/30 to-muted/30 relative overflow-hidden">
                    {portfolio.projectImageUrl ? (
                      <img
                        src={portfolio.projectImageUrl}
                        alt={portfolio.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-5xl font-bold text-muted-foreground/20 group-hover:scale-110 transition-transform duration-500">
                          {portfolio.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {portfolio.clientLogoUrl && (
                        <img
                          src={portfolio.clientLogoUrl}
                          alt={portfolio.clientName}
                          className="h-6 object-contain"
                        />
                      )}
                      <span className="text-xs text-muted-foreground">{portfolio.clientName}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {portfolio.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {portfolio.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(portfolio.completedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                      <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {portfolios.length === 0 && (
            <div className="text-center py-16">
              <div className="glass-card inline-flex items-center justify-center h-16 w-16 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
              <p className="text-muted-foreground">Check back soon to see our latest work!</p>
            </div>
          )}

          {filteredPortfolios.length === 0 && portfolios.length > 0 && (
            <div className="text-center py-16">
              <div className="glass-card inline-flex items-center justify-center h-16 w-16 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No projects in this category</h3>
              <p className="text-muted-foreground">Try selecting a different industry.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
